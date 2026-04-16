'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { calculateSnfScore } from '@/lib/quiz/snf-config';
import { selectSnfPathway } from '@/lib/quiz/snf-scoring';

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
    .select('id')
    .single();

  if (error || !data) {
    console.error('[SNF] saveSnfSubmission error:', error);
    throw new Error('Failed to save SNF submission');
  }

  return { submissionId: data.id, pathway };
}
