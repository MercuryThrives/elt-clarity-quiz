'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import type { FundingRmPathway } from '@/lib/funding-rm-content';

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
      answers: { ageBand },
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[funding-rm] saveFundingRmSubmission error:', error);
    throw new Error('Failed to save funding-rm submission');
  }

  return { submissionId: data.id as string };
}
