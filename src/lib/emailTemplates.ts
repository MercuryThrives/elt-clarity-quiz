import { GUIDE_CONTENT } from './guideContent';

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
