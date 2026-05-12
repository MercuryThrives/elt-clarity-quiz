'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { FundingRmPathway } from '@/lib/funding-rm-content';
import {
  buildFundingRmFamilyEmail,
  buildFundingRmInternalNotificationEmail,
} from '@/lib/emailTemplates';

const FROM_CARE = 'Care Clarity Report <care@elderlifetransitions.net>';
const FROM_NOTIFICATIONS = 'notifications@elderlifetransitions.net';
const RM_NOTIFICATION_EMAIL =
  process.env.RM_NOTIFICATION_EMAIL ?? process.env.ELT_NOTIFICATION_EMAIL ?? null;

const SUBJECT: Record<FundingRmPathway, string> = {
  'likely-fit':           'Your reverse mortgage summary, {firstName}',
  'explore-with-caveats': 'Your reverse mortgage summary, {firstName}',
  'medicaid-flag':        'Important: read this before any reverse mortgage conversation',
  'not-a-fit':            'Your funding options summary, {firstName}',
};

export async function saveFundingRmSubmission(payload: {
  firstName: string;
  email: string;
  phone?: string | null;
  pathway: FundingRmPathway;
  score: number;
  ageBand: 0 | 1 | 2 | 3;
  submissionId: string | null;
  partnerId: string | null;
}): Promise<{ submissionId: string }> {
  const { firstName, email, phone, pathway, score, ageBand, partnerId } = payload;

  const { data, error } = await supabaseAdmin
    .from('submissions')
    .insert({
      partner_id: partnerId,
      partner_type: 'funding-rm',
      pathway,
      total_score: score,
      tier_result: `funding-rm: ${pathway}`,
      first_name: firstName,
      email,
      phone: phone || null,
      age_band: ageBand,
      answers: { ageBand },
    })
    .select('id, created_at')
    .single();

  if (error || !data) {
    console.error('[funding-rm] saveFundingRmSubmission error:', error);
    throw new Error('Failed to save funding-rm submission');
  }

  const submissionId = data.id as string;
  const submittedAt = new Date(data.created_at as string);

  const resend = new Resend(process.env.RESEND_API_KEY);
  const emailPromises: Promise<unknown>[] = [];

  const subject = SUBJECT[pathway].replace('{firstName}', firstName);

  // Email 1 — Family result email
  emailPromises.push(
    resend.emails.send({
      from: FROM_CARE,
      to: email,
      subject,
      html: buildFundingRmFamilyEmail({ firstName, pathway, ageBand }),
    }).then(({ error: err }) => {
      if (err) console.error('[funding-rm] family email error:', err);
    })
  );

  // Email 2 — Internal notification to ELT
  if (RM_NOTIFICATION_EMAIL) {
    emailPromises.push(
      resend.emails.send({
        from: FROM_NOTIFICATIONS,
        to: RM_NOTIFICATION_EMAIL,
        subject: `New RM Lead — ${firstName} — ${pathway}`,
        html: buildFundingRmInternalNotificationEmail({
          firstName,
          email,
          phone: phone || null,
          pathway,
          score,
          ageBand,
          partnerId,
          submittedAt,
        }),
      }).then(({ error: err }) => {
        if (err) console.error('[funding-rm] internal notification error:', err);
      })
    );
  } else {
    console.warn('[funding-rm] RM_NOTIFICATION_EMAIL is not set — internal notification skipped.');
  }

  await Promise.allSettled(emailPromises);

  return { submissionId };
}

export async function updateFundingRmPhone(
  submissionId: string,
  phone: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('submissions')
    .update({ phone })
    .eq('id', submissionId);

  if (error) {
    console.error('[funding-rm] updateFundingRmPhone error:', error);
    throw new Error('Failed to update phone');
  }
}
