'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  buildFamilyGuideEmail,
  buildPartnerNotificationEmail,
  buildELTNotificationEmail,
} from '@/lib/emailTemplates';

const ELT_NOTIFICATION_EMAIL =
  process.env.ELT_NOTIFICATION_EMAIL ?? 'hca_app@elderlifetransitions.net';
const FROM_NOTIFICATIONS = 'ELT Care Clarity Tool <notifications@elderlifetransitions.net>';
const FROM_NOREPLY = 'noreply@elderlifetransitions.net';

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
  email: string,
  firstName: string,
  topCategories: string[] = [],
): Promise<void> {
  const { data: submission } = await supabaseAdmin
    .from('submissions')
    .update({ email, first_name: firstName })
    .eq('id', submissionId)
    .select('total_score, tier_result, partner_id')
    .single();

  const score = submission?.total_score ?? 0;
  const tierStr = submission?.tier_result ?? '';
  const tier = parseInt(tierStr.replace('Tier ', '')) || 3;
  const partnerId = submission?.partner_id ?? null;

  let partnerAgencyName: string | null = null;
  let partnerNotificationEmail: string | null = null;

  if (partnerId) {
    const { data: partnerData } = await supabaseAdmin
      .from('partners')
      .select('notification_email, agency_name')
      .eq('id', partnerId)
      .single();
    partnerAgencyName = partnerData?.agency_name ?? null;
    partnerNotificationEmail = partnerData?.notification_email ?? null;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Notify partner if they have a notification email
  if (partnerNotificationEmail && partnerAgencyName) {
    try {
      await resend.emails.send({
        from: FROM_NOTIFICATIONS,
        to: partnerNotificationEmail,
        subject: `Care Clarity Tool — TIER 3 Completion — ${new Date().toLocaleDateString()}`,
        html: buildPartnerNotificationEmail({
          tier: 3,
          score,
          topCategories,
          familyFirstName: firstName,
          familyEmail: email,
          agencyName: partnerAgencyName,
          shareEmail: true,
        }),
      });
    } catch (err) {
      console.error('[Resend] Partner notification error:', err);
    }
  }

  // Priority notification to ELT for Tier 3
  try {
    await resend.emails.send({
      from: FROM_NOREPLY,
      to: ELT_NOTIFICATION_EMAIL,
      subject: `ACTION NEEDED — New Tier 3 Lead — ${firstName} via ${partnerAgencyName ?? 'Direct'}`,
      html: buildELTNotificationEmail({
        tier,
        score,
        topCategories,
        email,
        familyFirstName: firstName,
        partnerName: partnerAgencyName,
      }),
    });
  } catch (err) {
    console.error('[Resend] ELT notification error:', err);
  }
}

export async function saveTier2Email(
  submissionId: string,
  email: string,
  topCategories: string[],
  partnerName: string | null,
): Promise<void> {
  const { data: submission } = await supabaseAdmin
    .from('submissions')
    .update({ email })
    .eq('id', submissionId)
    .select('total_score, partner_id')
    .single();

  const score = submission?.total_score ?? 0;
  const partnerId = submission?.partner_id ?? null;

  let partnerAgencyName: string | null = partnerName;
  let partnerNotificationEmail: string | null = null;

  if (partnerId) {
    const { data: partnerData } = await supabaseAdmin
      .from('partners')
      .select('notification_email, agency_name')
      .eq('id', partnerId)
      .single();
    partnerNotificationEmail = partnerData?.notification_email ?? null;
    if (partnerData?.agency_name) partnerAgencyName = partnerData.agency_name;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Send personalized Care Planning Guide to family
  try {
    await resend.emails.send({
      from: 'Elder Life Transitions <care@elderlifetransitions.net>',
      to: email,
      subject: 'Your Personalized Care Planning Guide',
      html: buildFamilyGuideEmail(topCategories, partnerAgencyName),
    });
  } catch (err) {
    console.error('[Resend] Family guide email error:', err);
  }

  // Notify partner if they have a notification email
  if (partnerNotificationEmail && partnerAgencyName) {
    try {
      await resend.emails.send({
        from: FROM_NOTIFICATIONS,
        to: partnerNotificationEmail,
        subject: `Care Clarity Tool — Tier 2 Completion (${new Date().toLocaleDateString()})`,
        html: buildPartnerNotificationEmail({
          tier: 2,
          score,
          topCategories,
          familyEmail: email,
          agencyName: partnerAgencyName,
          shareEmail: true,
        }),
      });
    } catch (err) {
      console.error('[Resend] Partner notification error:', err);
    }
  }

  // Notify ELT
  try {
    await resend.emails.send({
      from: FROM_NOREPLY,
      to: ELT_NOTIFICATION_EMAIL,
      subject: `New Tier 2 Lead — ${partnerAgencyName ?? 'Direct'}`,
      html: buildELTNotificationEmail({
        tier: 2,
        score,
        topCategories,
        email,
        partnerName: partnerAgencyName,
      }),
    });
  } catch (err) {
    console.error('[Resend] ELT notification error:', err);
  }
}

export async function markSubmissionClicked(submissionId: string): Promise<void> {
  await supabaseAdmin
    .from('submissions')
    .update({ was_clicked: true })
    .eq('id', submissionId);
}
