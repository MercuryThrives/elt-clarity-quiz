'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const NOTIFY_EMAIL = 'dave.johnstone@elderlifetransitions.net';
const FROM_EMAIL = 'noreply@elderlifetransitions.net';

export async function saveSubmission(
  partnerId: string | null,
  totalScore: number,
  tierResult: string
): Promise<{ submissionId: string; agencyName: string | null; partnerPhone: string | null }> {
  let agencyName: string | null = null;
  let partnerPhone: string | null = null;

  if (partnerId) {
    const { data } = await supabaseAdmin
      .from('partners')
      .select('agency_name, partner_phone')
      .eq('id', partnerId)
      .limit(1)
      .single();

    if (data) {
      agencyName = data.agency_name ?? null;
      partnerPhone = data.partner_phone ?? null;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('submissions')
    .insert({ partner_id: partnerId, total_score: totalScore, tier_result: tierResult })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('Failed to save submission');
  }

  return { submissionId: data.id, agencyName, partnerPhone };
}

export async function updateSubmissionEmail(
  submissionId: string,
  email: string
): Promise<void> {
  // Save email to DB
  const { data: submission } = await supabaseAdmin
    .from('submissions')
    .update({ email })
    .eq('id', submissionId)
    .select('total_score, tier_result, partner_id')
    .single();

  // Send notification email — fire and forget
  const score = submission?.total_score ?? '—';
  const tier = submission?.tier_result ?? '—';
  const partner = submission?.partner_id ?? 'Direct (no partner)';

  console.log('[Resend] Attempting send to', NOTIFY_EMAIL, 'key present:', !!process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: `New Care Clarity Review Request`,
      html: `
        <p>A new Care Clarity Review request was submitted.</p>
        <table>
          <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
          <tr><td><strong>Score:</strong></td><td>${score}</td></tr>
          <tr><td><strong>Result:</strong></td><td>${tier}</td></tr>
          <tr><td><strong>Partner:</strong></td><td>${partner}</td></tr>
        </table>
      `,
    });
  } catch (err) {
    console.error('[Resend] Failed to send notification:', err);
  }
}

export async function markSubmissionClicked(submissionId: string): Promise<void> {
  await supabaseAdmin
    .from('submissions')
    .update({ was_clicked: true })
    .eq('id', submissionId);
}
