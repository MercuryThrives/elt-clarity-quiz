'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { SCResult } from '@/lib/sc/scScoring';
import { buildSCInternalNotificationEmail } from '@/lib/emailTemplates';

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

  if (SC_NOTIFICATION_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: emailErr } = await resend.emails.send({
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
    });
    if (emailErr) console.error('[SC] notification email error:', emailErr);
  } else {
    console.warn('[SC] SC_NOTIFICATION_EMAIL is not set -- internal notification skipped.');
  }
}
