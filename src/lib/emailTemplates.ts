import { GUIDE_CONTENT } from './guideContent';
import {
  SNF_PATHWAY_CONTENT,
  COMMUNITY_PATHWAYS,
  COMMUNITY_REPORT_ADDENDUM,
  CALENDAR_URL,
  PATHWAY_LABELS,
} from './snf-pathway-content';
import type { SnfPathway } from './quiz/snf-scoring';
import { SNF_QUESTIONS } from './quiz/snf-config';

export function buildFamilyGuideEmail(
  topCategories: string[],
  partnerName: string | null
): string {
  const sections = topCategories
    .filter(cat => GUIDE_CONTENT[cat])
    .map(cat => {
      const content = GUIDE_CONTENT[cat];
      return `
        <div style="margin-bottom: 36px;">
          <h2 style="font-size: 18px; font-weight: 600; color: #1A3A5C;
            border-bottom: 2px solid #C4621D; padding-bottom: 8px; margin-bottom: 16px;">
            ${content.title}
          </h2>
          ${content.paragraphs.map(p => `
            <p style="font-size: 15px; line-height: 1.7; color: #333333; margin-bottom: 14px;">
              ${p}
            </p>
          `).join('')}
        </div>
      `;
    }).join('');

  const partnerLine = partnerName
    ? `<p style="font-size: 14px; color: #666666;">
        This guide was prepared in partnership with <strong>${partnerName}</strong>
        and Elder Life Transitions.
       </p>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;
      padding: 40px 24px; background: #ffffff;">

      <div style="text-align: center; margin-bottom: 36px;">
        <h1 style="font-size: 22px; font-weight: 700; color: #1A3A5C; margin-bottom: 8px;">
          Your Personalized Care Planning Guide
        </h1>
        <p style="font-size: 15px; color: #666666;">
          Based on the patterns that stood out in your Care Clarity results
        </p>
      </div>

      <p style="font-size: 15px; line-height: 1.7; color: #333333; margin-bottom: 32px;">
        Thank you for taking the time to reflect on your loved one's care situation.
        What follows is a personalized guide based specifically on the areas your
        responses highlighted. It's designed to give you useful context — not to
        alarm you, but to help you see the full picture clearly.
      </p>

      ${sections}

      <div style="background: #FAF8F4; border-left: 4px solid #C4621D;
        padding: 20px 24px; margin: 36px 0; border-radius: 4px;">
        <p style="font-size: 15px; line-height: 1.7; color: #333333; margin: 0;">
          If any of what you've read feels relevant and you'd like to talk through
          next steps with someone who understands this space, Elder Life Transitions
          offers a free 30-minute conversation — no obligation, no pressure.
        </p>
        <p style="margin-top: 12px; margin-bottom: 0;">
          <a href="https://www.elderlifetransitions.net/free-clarity-call"
            style="color: #C4621D; font-weight: 600; text-decoration: none;">
            Schedule your free Care Clarity Review &rarr;
          </a>
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #EEEEEE; margin: 32px 0;" />

      ${partnerLine}
      <p style="font-size: 13px; color: #999999; margin-top: 8px;">
        This guide is for informational purposes only and does not constitute
        medical, legal, or financial advice. Results are based on self-reported
        responses and are not a clinical assessment.
      </p>
    </div>
  `;
}

export function buildPartnerNotificationEmail({
  tier,
  score,
  topCategories,
  familyFirstName,
  familyEmail,
  agencyName,
  shareEmail,
}: {
  tier: number;
  score: number;
  topCategories: string[];
  familyFirstName?: string;
  familyEmail?: string;
  agencyName: string;
  shareEmail: boolean;
}): string {
  const tierColors: Record<number, string> = {
    1: '#2E7D32',
    2: '#E65100',
    3: '#B71C1C',
  };
  const tierLabels: Record<number, string> = {
    1: 'Tier 1 — Well Supported',
    2: 'Tier 2 — Emerging Needs',
    3: 'Tier 3 — Transition Point',
  };
  const tierColor = tierColors[tier] ?? '#333333';
  const tierLabel = tierLabels[tier] ?? `Tier ${tier}`;

  const contactInfo = shareEmail && familyEmail
    ? `<p style="font-size: 15px; color: #333333; margin-bottom: 8px;">
        <strong>Family contact:</strong> ${familyFirstName ?? 'Not provided'} —
        ${familyEmail}
       </p>`
    : `<p style="font-size: 14px; color: #888888; margin-bottom: 8px;">
        Contact information not available — family did not submit a form.
       </p>`;

  const tier3Note = tier === 3
    ? `<div style="background: #FFF3CD; border: 1px solid #FFB300;
        padding: 16px 20px; border-radius: 6px; margin: 20px 0;">
        <p style="font-size: 14px; color: #5D4037; margin: 0;">
          <strong>Note:</strong> This family has also been connected with Elder Life
          Transitions for a care options conversation. We will be in touch with them
          directly.
        </p>
       </div>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;
      padding: 40px 24px; background: #ffffff;">

      <h1 style="font-size: 20px; font-weight: 700; color: #1A3A5C; margin-bottom: 4px;">
        Care Clarity Tool — New Completion
      </h1>
      <p style="font-size: 14px; color: #888888; margin-bottom: 28px;">
        A client from ${agencyName} completed the tool on
        ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <div style="background: #FAF8F4; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #888888; margin: 0 0 6px 0;">RESULT</p>
        <p style="font-size: 22px; font-weight: 700; color: ${tierColor}; margin: 0 0 4px 0;">
          ${tierLabel}
        </p>
        <p style="font-size: 16px; color: #555555; margin: 0;">
          Score: ${score}/32
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <p style="font-size: 14px; color: #888888; margin-bottom: 8px;">
          FLAGGED PATTERNS
        </p>
        ${topCategories.map(cat => `
          <span style="display: inline-block; background: #FFF8EC; color: #92400E;
            font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 4px;
            margin: 0 6px 6px 0; border: 1px solid #FCD34D;">
            ${cat}
          </span>
        `).join('')}
      </div>

      ${contactInfo}
      ${tier3Note}

      <hr style="border: none; border-top: 1px solid #EEEEEE; margin: 28px 0;" />
      <p style="font-size: 12px; color: #AAAAAA;">
        This notification was sent because ${agencyName} is a Care Clarity Tool
        partner. Replies to this email go to Elder Life Transitions.
      </p>
    </div>
  `;
}

export function buildELTNotificationEmail({
  tier,
  score,
  topCategories,
  email,
  familyFirstName,
  partnerName,
}: {
  tier: number;
  score: number;
  topCategories: string[];
  email: string;
  familyFirstName?: string;
  partnerName: string | null;
}): string {
  const isTier3 = tier === 3;

  const header = isTier3
    ? `<div style="background: #B71C1C; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <p style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0;">
          ACTION NEEDED — New Tier 3 Lead
        </p>
        <p style="font-size: 14px; color: #FFCDD2; margin: 6px 0 0 0;">
          Goal: contact within the hour
        </p>
       </div>`
    : `<div style="background: #1A3A5C; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <p style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 0;">
          New ${tier === 2 ? 'Tier 2' : 'Tier 1'} Completion
        </p>
       </div>`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;
      background: #ffffff; border-radius: 8px; overflow: hidden;
      border: 1px solid #EEEEEE;">

      ${header}

      <div style="padding: 28px 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 14px; width: 140px;">
              Tier
            </td>
            <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">
              Tier ${tier} — Score ${score}/32
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 14px;">Family email</td>
            <td style="padding: 8px 0; color: #333333; font-size: 14px;">${email}</td>
          </tr>
          ${familyFirstName ? `
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 14px;">First name</td>
            <td style="padding: 8px 0; color: #333333; font-size: 14px;">${familyFirstName}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 14px;">Source</td>
            <td style="padding: 8px 0; color: #333333; font-size: 14px;">
              ${partnerName ?? 'Direct (no partner)'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 14px;">Flagged</td>
            <td style="padding: 8px 0; color: #333333; font-size: 14px;">
              ${topCategories.join(', ')}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; color: #333333; font-size: 14px;">
              ${new Date().toLocaleString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
              })}
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// SNF email builders
// ─────────────────────────────────────────────────────────────────────────────

const SNF_SIGNATURE = `
  <p style="font-size:15px;color:#333333;margin:0;">Dave</p>
  <p style="font-size:14px;color:#666666;margin:4px 0 0 0;">
    Elder Life Transitions &nbsp;|&nbsp; 720-258-6001 &nbsp;|&nbsp;
    <a href="mailto:Dave@ElderLifeTransitions.net" style="color:#666666;">Dave@ElderLifeTransitions.net</a>
  </p>
`;

const SNF_FOOTER_DISCLOSURE = `
  <p style="font-size:12px;color:#999999;margin:0;line-height:1.6;">
    Elder Life Transitions is compensated by care communities for private-pay placements.
    Our consultation is free to families. This tool is not a clinical assessment and does
    not replace advice from a licensed healthcare professional.
  </p>
`;

/**
 * Email 1 — Immediate report delivery to the family.
 */
export function buildSnfReportEmail({
  firstName,
  pathway,
  financialModifier,
}: {
  firstName: string;
  pathway: SnfPathway;
  financialModifier: string | null;
}): string {
  const content = SNF_PATHWAY_CONTENT[pathway];
  const pathwayLabel = PATHWAY_LABELS[pathway];
  const isCommunity = COMMUNITY_PATHWAYS.has(pathway);

  const communityAddendum = isCommunity
    ? `<p style="font-size:15px;line-height:1.7;color:#333333;margin-bottom:14px;">
        ${COMMUNITY_REPORT_ADDENDUM}
       </p>`
    : '';

  const financialSection = financialModifier
    ? `<div style="background:#FDF8F0;border-left:3px solid #f59e0b;padding:14px 18px;margin:24px 0;border-radius:4px;">
        <p style="font-size:14px;color:#888888;margin:0 0 6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Financial Consideration</p>
        <p style="font-size:15px;color:#333333;margin:0;line-height:1.6;">${financialModifier}</p>
       </div>`
    : '';

  const bullets = content.anticipationBullets
    .map(b => `<li style="font-size:15px;color:#333333;line-height:1.7;margin-bottom:10px;">${b}</li>`)
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#ffffff;">

      <p style="font-size:16px;line-height:1.7;color:#333333;margin-bottom:28px;">
        Hi ${firstName} — thank you for taking the time to work through these questions.
        Here is what the information you shared points toward.
      </p>

      <h2 style="font-size:22px;font-weight:700;color:#1a1a1a;border-bottom:2px solid #f59e0b;padding-bottom:8px;margin-bottom:16px;">
        ${pathwayLabel}
      </h2>

      <p style="font-size:15px;line-height:1.7;color:#333333;margin-bottom:20px;">
        ${content.fullDescription}
      </p>

      <h3 style="font-size:16px;font-weight:600;color:#4a6741;margin-bottom:8px;">Why This Appears to Fit Your Situation</h3>
      <p style="font-size:15px;line-height:1.7;color:#333333;margin-bottom:24px;">
        ${content.whyThisFits}
      </p>

      <h3 style="font-size:16px;font-weight:600;color:#4a6741;margin-bottom:10px;">What to Anticipate</h3>
      <ul style="padding-left:20px;margin-bottom:16px;">
        ${bullets}
      </ul>

      ${communityAddendum}

      <div style="background:#FFFBEB;border:1px solid #FCD34D;padding:18px 20px;border-radius:6px;margin-bottom:24px;">
        <p style="font-size:13px;font-weight:600;color:#92400E;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.05em;">What Most Families Don't Know</p>
        <p style="font-size:15px;line-height:1.7;color:#333333;margin:0;">
          ${content.whatFamiliesDontKnow}
        </p>
      </div>

      <h3 style="font-size:15px;font-weight:600;color:#555555;margin-bottom:6px;">Also Worth Considering</h3>
      <p style="font-size:15px;line-height:1.7;color:#555555;margin-bottom:24px;">
        ${content.secondaryPathway}
      </p>

      ${financialSection}

      <div style="background:#F0F5EE;border-left:4px solid #4a6741;padding:20px 24px;margin:32px 0;border-radius:4px;">
        <p style="font-size:15px;line-height:1.7;color:#333333;margin:0 0 12px 0;">
          If you would like to talk through these options, I am happy to spend 20 minutes
          on a call. No pressure — just here if it is useful.
        </p>
        <p style="margin:0;">
          <a href="${CALENDAR_URL}" style="color:#4a6741;font-weight:600;font-size:15px;text-decoration:none;">
            Schedule a Call With ELT &rarr;
          </a>
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #EEEEEE;margin:28px 0;" />
      ${SNF_SIGNATURE}
      <hr style="border:none;border-top:1px solid #EEEEEE;margin:20px 0 12px 0;" />
      ${SNF_FOOTER_DISCLOSURE}
    </div>
  `;
}

/**
 * Email 2 — 48–72 hour follow-up, sent only if was_clicked = false.
 */
export function buildSnfFollowUpEmail({
  firstName,
  pathway,
}: {
  firstName: string;
  pathway: SnfPathway;
}): string {
  const pathwayLabel = PATHWAY_LABELS[pathway];

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#ffffff;">

      <p style="font-size:16px;line-height:1.7;color:#333333;margin-bottom:16px;">
        Hi ${firstName} — I reviewed the responses you shared a couple of days ago
        and wanted to reach out personally.
      </p>
      <p style="font-size:16px;line-height:1.7;color:#333333;margin-bottom:16px;">
        The ${pathwayLabel} pathway that came up in your results is one I see fairly often
        in situations like yours — and there are a few things about it that are worth knowing
        before you start making calls or touring communities. Most families I talk with at this
        stage have questions they did not know to ask until after they had already made a decision.
      </p>
      <p style="font-size:16px;line-height:1.7;color:#333333;margin-bottom:24px;">
        If a 20-minute conversation would be useful, I am happy to walk through what I am
        seeing in your specific situation. No pressure — just here if it helps.
      </p>

      <p style="margin:0;">
        <a href="${CALENDAR_URL}" style="color:#4a6741;font-weight:600;font-size:16px;text-decoration:none;">
          Schedule a Call &rarr;
        </a>
      </p>

      <hr style="border:none;border-top:1px solid #EEEEEE;margin:28px 0;" />
      ${SNF_SIGNATURE}
    </div>
  `;
}

/**
 * Email 3 — Internal notification to ELT on every SNF submission.
 * Recipient is read from SNF_NOTIFICATION_EMAIL env var.
 *
 * NOTE: SNF_NOTIFICATION_EMAIL must be added to Vercel environment variables
 * before the first SNF facility goes live. If missing, the send is skipped
 * and a warning is logged.
 */
export function buildSnfInternalNotificationEmail({
  firstName,
  email,
  phone,
  pathway,
  partnerId,
  answers,
  submittedAt,
}: {
  firstName: string;
  email: string;
  phone: string | null;
  pathway: SnfPathway;
  partnerId: string | null;
  answers: Record<string, number>;
  submittedAt: Date;
}): string {
  const pathwayLabel = PATHWAY_LABELS[pathway];

  const timestamp = submittedAt.toLocaleString('en-US', {
    timeZone: 'America/Denver',
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });

  const answerRows = SNF_QUESTIONS.map(q => {
    const val = answers[q.id];
    const optionLabel = q.options?.find(o => o.value === val)?.label ?? `(score: ${val ?? 'not answered'})`;
    return `
      <tr>
        <td style="padding:8px 12px 8px 0;vertical-align:top;color:#888888;font-size:13px;width:200px;border-bottom:1px solid #f0f0f0;">
          ${q.category}
        </td>
        <td style="padding:8px 0;font-size:13px;color:#333333;border-bottom:1px solid #f0f0f0;">
          ${optionLabel}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #EEEEEE;">

      <div style="background:#4a6741;padding:16px 24px;">
        <p style="font-size:18px;font-weight:700;color:#ffffff;margin:0;">
          New SNF Lead — ${firstName} — ${pathwayLabel}
        </p>
      </div>

      <div style="padding:24px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr>
            <td style="padding:8px 12px 8px 0;color:#888888;font-size:14px;width:160px;">Name</td>
            <td style="padding:8px 0;color:#333333;font-size:14px;font-weight:600;">${firstName}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#888888;font-size:14px;">Email</td>
            <td style="padding:8px 0;color:#333333;font-size:14px;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#888888;font-size:14px;">Phone</td>
            <td style="padding:8px 0;color:#333333;font-size:14px;">${phone ?? 'not provided'}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#888888;font-size:14px;">Pathway</td>
            <td style="padding:8px 0;color:#333333;font-size:14px;font-weight:600;">${pathwayLabel}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#888888;font-size:14px;">Partner / Facility</td>
            <td style="padding:8px 0;color:#333333;font-size:14px;">${partnerId ?? 'direct'}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#888888;font-size:14px;">Submitted</td>
            <td style="padding:8px 0;color:#333333;font-size:14px;">${timestamp}</td>
          </tr>
        </table>

        <p style="font-size:13px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Assessment Answers</p>
        <table style="width:100%;border-collapse:collapse;">
          ${answerRows}
        </table>
      </div>
    </div>
  `;
}
