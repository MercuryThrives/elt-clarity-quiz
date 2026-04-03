'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';

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
  await supabaseAdmin
    .from('submissions')
    .update({ email })
    .eq('id', submissionId);
}

export async function markSubmissionClicked(submissionId: string): Promise<void> {
  await supabaseAdmin
    .from('submissions')
    .update({ was_clicked: true })
    .eq('id', submissionId);
}
