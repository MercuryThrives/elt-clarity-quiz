/**
 * Vercel Cron — SNF follow-up email (Email 2).
 * Runs every 6 hours. Finds SNF submissions that:
 *   - Were created >= 48 hours ago
 *   - Have not yet received a follow-up (snf_followup_sent = false)
 *   - Have not clicked the consultation link (was_clicked = false)
 * Sends a follow-up email via Resend and marks snf_followup_sent = true.
 *
 * Secured by CRON_SECRET — Vercel sets Authorization: Bearer <CRON_SECRET>
 * on cron-triggered requests. Set CRON_SECRET in Vercel environment variables.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buildSnfFollowUpEmail } from '@/lib/emailTemplates';
import type { SnfPathway } from '@/lib/quiz/snf-scoring';

const FROM_CARE = 'care@elderlifetransitions.net';

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Find due follow-ups: SNF submissions, >= 48h old, not yet followed up, not clicked
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: submissions, error } = await supabaseAdmin
    .from('submissions')
    .select('id, first_name, email, pathway')
    .eq('partner_type', 'snf')
    .eq('snf_followup_sent', false)
    .eq('was_clicked', false)
    .lte('created_at', cutoff)
    .not('email', 'is', null)
    .not('first_name', 'is', null);

  if (error) {
    console.error('[SNF cron] Query error:', error);
    return NextResponse.json({ error: 'DB query failed' }, { status: 500 });
  }

  if (!submissions || submissions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;
  const ids: string[] = [];

  for (const sub of submissions) {
    const firstName = sub.first_name as string;
    const email = sub.email as string;
    const pathway = sub.pathway as SnfPathway;

    const { error: emailErr } = await resend.emails.send({
      from: FROM_CARE,
      to: email,
      subject: `A question about ${firstName}'s next step`,
      html: buildSnfFollowUpEmail({ firstName, pathway }),
    });

    if (emailErr) {
      console.error(`[SNF cron] Follow-up email error for ${sub.id}:`, emailErr);
    } else {
      ids.push(sub.id as string);
      sent++;
    }
  }

  // Mark sent submissions
  if (ids.length > 0) {
    await supabaseAdmin
      .from('submissions')
      .update({ snf_followup_sent: true })
      .in('id', ids);
  }

  return NextResponse.json({ sent });
}
