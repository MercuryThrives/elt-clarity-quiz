/**
 * Vercel Cron -- SC follow-up email (Email 2).
 * Runs daily. Finds SC submissions that:
 *   - Were created >= 48 hours ago
 *   - Have not yet received a follow-up (sc_followup_sent = false)
 *   - Have not clicked the consultation link (was_clicked = false)
 * Sends a follow-up email via Resend and marks sc_followup_sent = true.
 *
 * Secured by CRON_SECRET -- Vercel sets Authorization: Bearer <CRON_SECRET>
 * on cron-triggered requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buildSCFollowUpEmail } from '@/lib/emailTemplates';

const FROM_CARE = 'care@elderlifetransitions.net';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: submissions, error } = await supabaseAdmin
    .from('submissions')
    .select('id, first_name, email')
    .eq('partner_type', 'senior_care')
    .eq('sc_followup_sent', false)
    .eq('was_clicked', false)
    .lte('created_at', cutoff)
    .not('email', 'is', null)
    .not('first_name', 'is', null);

  if (error) {
    console.error('[SC cron] Query error:', error);
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

    const { error: emailErr } = await resend.emails.send({
      from: FROM_CARE,
      to: email,
      subject: 'A quick follow-up on your care options',
      html: buildSCFollowUpEmail({ firstName }),
    });

    if (emailErr) {
      console.error(`[SC cron] Follow-up email error for ${sub.id}:`, emailErr);
    } else {
      ids.push(sub.id as string);
      sent++;
    }
  }

  if (ids.length > 0) {
    await supabaseAdmin
      .from('submissions')
      .update({ sc_followup_sent: true })
      .in('id', ids);
  }

  return NextResponse.json({ sent });
}
