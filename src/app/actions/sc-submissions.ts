'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { SCResult } from '@/lib/sc/scScoring';
import {
  buildSCReportEmail,
  buildSCInternalNotificationEmail,
} from '@/lib/emailTemplates';

const FROM_CARE = 'Care Clarity Report <care@elderlifetransitions.net>';
const FROM_NOTIFICATIONS = 'notifications@elderlifetransitions.net';
const SC_NOTIFICATION_EMAIL = process.env.SC_NOTIFICATION_EMAIL;

export async function saveSCSubmission(payload: {
  partnerId: string | null;
  answers: Record<number, string | string[]>;
  result: SCResult;
  firstName: string;
  email: string;
  phone?: string;
}): Promise<void> {
  const { partnerId, answers, result, firstName, email, phone } = payload;

  const { data, error } = await supabaseAdmin
    .from('submissions')
    .insert({
      partner_id: partnerId,
      partner_type: 'senior_care',
      pathway: result.pathway,
      first_name: firstName,
      email,
      phone: phone || null,
      answers,
      total_score: result.score,
      tier_result: null,
      sc_followup_sent: false,
      snf_followup_sent: false,
      was_clicked: false,
    })
    .select('id, created_at')
    .single();

  if (error || !data) {
    console.error('[SC] saveSCSubmission error:', error);
    throw new Error('Failed to save SC submission');
  }

  const submittedAt = new Date(data.created_at as string);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const emailPromises: Promise<unknown>[] = [];

  // Email 1 -- Report delivery to family
  emailPromises.push(
    resend.emails.send({
      from: FROM_CARE,
      to: email,
      subject: 'Your care options report is ready',
      html: buildSCReportEmail({ firstName, pathway: result.pathway }),
    }).then(({ error: err }) => {
      if (err) console.error('[SC] Email 1 (report) error:', err);
    })
  );

  // Internal notification to ELT
  if (SC_NOTIFICATION_EMAIL) {
    emailPromises.push(
      resend.emails.send({
        from: FROM_NOTIFICATIONS,
        to: SC_NOTIFICATION_EMAIL,
        subject: `New Senior Care Clarity Submission -- ${result.pathway}`,
        html: buildSCInternalNotificationEmail({
          firstName,
          email,
          phone: phone || null,
          pathway: result.pathway,
          partnerId,
          submittedAt,
        }),
      }).then(({ error: err }) => {
        if (err) console.error('[SC] notification email error:', err);
      })
    );
  } else {
    console.warn('[SC] SC_NOTIFICATION_EMAIL is not set -- internal notification skipped.');
  }

  await Promise.allSettled(emailPromises);
}
