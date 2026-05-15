import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { buildSCInternalNotificationEmail } from '@/lib/emailTemplates';
import type { SCPathway } from '@/lib/sc/scScoring';

const FROM_NOTIFICATIONS = 'notifications@elderlifetransitions.net';
const SC_NOTIFICATION_EMAIL = process.env.SC_NOTIFICATION_EMAIL;

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    firstName: string;
    email: string;
    phone?: string | null;
    pathway: SCPathway;
    partnerId?: string | null;
    timestamp?: string;
  };

  if (!SC_NOTIFICATION_EMAIL) {
    console.warn('[SC notify] SC_NOTIFICATION_EMAIL not set -- skipping');
    return NextResponse.json({ ok: true, skipped: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const submittedAt = body.timestamp ? new Date(body.timestamp) : new Date();

  const { error } = await resend.emails.send({
    from: FROM_NOTIFICATIONS,
    to: SC_NOTIFICATION_EMAIL,
    subject: `New Senior Care Clarity Submission -- ${body.pathway}`,
    html: buildSCInternalNotificationEmail({
      firstName: body.firstName,
      email: body.email,
      phone: body.phone ?? null,
      pathway: body.pathway,
      partnerId: body.partnerId ?? null,
      submittedAt,
    }),
  });

  if (error) {
    console.error('[SC notify] email error:', error);
    return NextResponse.json({ ok: false, error: 'Email failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
