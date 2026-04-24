'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { calculateSnfScore } from '@/lib/quiz/snf-config';
import { selectSnfPathway, getSnfFinancialModifier } from '@/lib/quiz/snf-scoring';
import {
  buildSnfReportEmail,
  buildSnfInternalNotificationEmail,
} from '@/lib/emailTemplates';
import { PATHWAY_LABELS } from '@/lib/snf-pathway-content';

const FROM_CARE = 'Care Clarity Report <care@elderlifetransitions.net>';
const FROM_NOTIFICATIONS = 'notifications@elderlifetransitions.net';

// NOTE: SNF_NOTIFICATION_EMAIL must be added to Vercel environment variables
// before the first SNF facility goes live. If missing, the internal notification
// is skipped and a warning is logged — the submission is still saved and Email 1 still sends.
const SNF_NOTIFICATION_EMAIL = process.env.SNF_NOTIFICATION_EMAIL;

export async function saveSnfSubmission(payload: {
  partnerId: string | null;
  answers: Record<string, number>;
  firstName: string;
  email: string;
  phone?: string;
}): Promise<{ submissionId: string; pathway: string }> {
  const { partnerId, answers, firstName, email, phone } = payload;

  const pathway = selectSnfPathway(answers);
  const score = calculateSnfScore(answers);

  const { data, error } = await supabaseAdmin
    .from('submissions')
    .insert({
      partner_id: partnerId,
      partner_type: 'snf',
      answers,
      pathway,
      total_score: Math.round(score),
      tier_result: `SNF: ${pathway}`,
      first_name: firstName,
      email,
      phone: phone || null,
    })
    .select('id, created_at')
    .single();

  if (error || !data) {
    console.error('[SNF] saveSnfSubmission error:', error);
    throw new Error('Failed to save SNF submission');
  }

  const submissionId = data.id as string;
  const submittedAt = new Date(data.created_at as string);

  // Fire emails in parallel — don't block the response on either
  const resend = new Resend(process.env.RESEND_API_KEY);
  const financialModifier = getSnfFinancialModifier(answers, pathway);
  const pathwayLabel = PATHWAY_LABELS[pathway];

  const emailPromises: Promise<unknown>[] = [];

  // Email 1 — Report delivery to family
  emailPromises.push(
    resend.emails.send({
      from: FROM_CARE,
      to: email,
      subject: `Your Care Options Report — ${firstName}`,
      html: buildSnfReportEmail({ firstName, pathway, financialModifier }),
    }).then(({ error: err }) => {
      if (err) console.error('[SNF] Email 1 (report) error:', err);
    })
  );

  // Email 3 — Internal notification to ELT
  if (SNF_NOTIFICATION_EMAIL) {
    emailPromises.push(
      resend.emails.send({
        from: FROM_NOTIFICATIONS,
        to: SNF_NOTIFICATION_EMAIL,
        subject: `New SNF Lead — ${firstName} — ${pathwayLabel}`,
        html: buildSnfInternalNotificationEmail({
          firstName,
          email,
          phone: phone || null,
          pathway,
          partnerId,
          answers,
          submittedAt,
        }),
      }).then(({ error: err }) => {
        if (err) console.error('[SNF] Email 3 (internal notification) error:', err);
      })
    );
  } else {
    console.warn('[SNF] SNF_NOTIFICATION_EMAIL is not set — internal notification skipped.');
  }

  await Promise.allSettled(emailPromises);

  return { submissionId, pathway };
}

export async function markSnfSubmissionClicked(submissionId: string): Promise<void> {
  await supabaseAdmin
    .from('submissions')
    .update({ was_clicked: true })
    .eq('id', submissionId);
}
