'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';

const FROM_RUNWAY = 'Care Cost Runway <care@elderlifetransitions.net>';
const FROM_NOTIFICATIONS = 'notifications@elderlifetransitions.net';
const RUNWAY_NOTIFICATION_EMAIL = process.env.RUNWAY_NOTIFICATION_EMAIL;
const BOOKING_URL =
  process.env.NEXT_PUBLIC_RUNWAY_BOOKING_URL ??
  'https://calendar.app.google/wtJzCe3nKDBeiXqv9';

const MARKET_LABELS: Record<string, string> = {
  denver: 'Denver Metro',
  fortcollins: 'Fort Collins',
  coloradosprings: 'Colorado Springs',
  other: 'Rest of Colorado',
};

const CARE_LABELS: Record<string, string> = {
  light: 'Light',
  moderate: 'Moderate',
  heavy: 'Heavy',
};

export interface RunwayLeadPayload {
  firstName: string;
  email: string;
  assetsBucket: string;
  incomeBucket: string;
  market: string;
  careLevel: string;
  quotedMonthly: number;
  actualMonthly: number;
  monthlyGap: number;
  annualGap: number;
  runwayYears: number;
  gclid?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function buildLeadConfirmationEmail(payload: RunwayLeadPayload): string {
  const { firstName, runwayYears, quotedMonthly, actualMonthly, annualGap, market, careLevel } =
    payload;
  const marketLabel = MARKET_LABELS[market] ?? market;
  const careLevelLabel = CARE_LABELS[careLevel] ?? careLevel;
  const runwayDisplay = runwayYears >= 50 ? '50+' : String(runwayYears);

  return `
    <div style="font-family:'Open Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#EDE8DC;padding:0;">
      <div style="background:#6B6B4A;padding:16px 24px;border-bottom:3px solid #C49A2A;">
        <div style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:3px;">Elder Life Transitions</div>
        <div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#fff;">Care Cost Runway Calculator</div>
      </div>
      <div style="padding:28px 24px;">
        <p style="font-family:Georgia,serif;font-size:18px;color:#3D3025;margin:0 0 20px;">${firstName}, here is your runway estimate.</p>

        <div style="background:#5D0E0E;border-radius:10px;padding:22px;margin-bottom:20px;text-align:center;">
          <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:8px;">Estimated runway at current care costs</div>
          <div style="font-family:Georgia,serif;font-size:48px;font-weight:700;color:#C49A2A;line-height:1;">${runwayDisplay} <span style="font-size:22px;">yrs</span></div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:10px;line-height:1.4;">Assumes 4.5% annual cost escalation. Based on the inputs you provided.</div>
        </div>

        <div style="background:#fff;border:1px solid #C4A882;border-radius:8px;overflow:hidden;margin-bottom:20px;">
          <div style="background:#3D3025;padding:10px 18px;">
            <span style="font-family:Georgia,serif;font-size:14px;color:#fff;">The reality check</span>
          </div>
          <div style="padding:4px 0;">
            <div style="display:flex;justify-content:space-between;padding:8px 18px;border-bottom:1px solid #C4A882;">
              <span style="font-size:13px;color:#7a6e64;">Advertised rate (${marketLabel})</span>
              <span style="font-size:14px;font-weight:700;color:#3D3025;">${fmt(quotedMonthly)}/mo</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 18px;border-bottom:1px solid #C4A882;">
              <span style="font-size:13px;font-weight:600;color:#3D3025;">Estimated all-in cost (${careLevelLabel} care)</span>
              <span style="font-size:14px;font-weight:700;color:#5D0E0E;">${fmt(actualMonthly)}/mo</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 18px;">
              <span style="font-size:13px;font-weight:600;color:#3D3025;">Annual difference</span>
              <span style="font-size:14px;font-weight:700;color:#5D0E0E;">${fmt(annualGap)}/yr</span>
            </div>
          </div>
        </div>

        <div style="background:#fdf8f0;border:1px solid #C49A2A;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
          <p style="font-size:13px;color:#3D3025;line-height:1.65;margin:0 0 10px;">This estimate projects how long the money is likely to last based on your inputs and Colorado cost benchmarks. It holds care needs fixed at today's level and does not model care progression, level-of-care step-ups, or other factors that typically shorten the runway.</p>
          <p style="font-size:13px;color:#3D3025;line-height:1.65;margin:0;">A Care Cost Runway Review covers all five realistic care paths and delivers a written analysis within about a week. The founding rate is $1,500.</p>
        </div>

        <div style="text-align:center;margin-bottom:20px;">
          <a href="${BOOKING_URL}" style="display:inline-block;padding:13px 28px;background:#C49A2A;color:#3D3025;font-family:Arial,sans-serif;font-weight:700;font-size:15px;text-decoration:none;border-radius:6px;">Book a Free 20-Minute Call</a>
        </div>

        <p style="font-size:11px;color:#7a6e64;text-align:center;line-height:1.5;margin:0;">Former Executive Director of assisted living, memory care, and independent living communities -- the person who built the schedules, set the care fees, and signed the level-of-care notices.</p>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #C4A882;">
        <p style="font-size:10px;color:#7a6e64;text-align:center;line-height:1.5;margin:0;">This is care cost planning information and does not constitute financial, tax, legal, or medical advice. Benchmarks based on current Colorado senior care cost research.</p>
      </div>
    </div>
  `;
}

function buildNotificationEmail(payload: RunwayLeadPayload): string {
  const {
    firstName,
    email,
    market,
    careLevel,
    assetsBucket,
    incomeBucket,
    quotedMonthly,
    actualMonthly,
    annualGap,
    runwayYears,
    gclid,
    utmSource,
    utmMedium,
    utmCampaign,
    referrer,
  } = payload;
  const marketLabel = MARKET_LABELS[market] ?? market;
  const careLevelLabel = CARE_LABELS[careLevel] ?? careLevel;
  const runwayDisplay = runwayYears >= 50 ? '50+' : String(runwayYears);

  const row = (label: string, value: string, shade: boolean) =>
    `<tr style="background:${shade ? '#f5f5f5' : '#fff'};">
       <td style="padding:8px 12px;font-weight:600;width:42%;font-size:13px;">${label}</td>
       <td style="padding:8px 12px;font-size:13px;">${value}</td>
     </tr>`;

  const optRow = (label: string, value: string | undefined, shade: boolean) =>
    value ? row(label, value, shade) : '';

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="font-size:18px;color:#3D3025;margin:0 0 16px;">New Runway Lead</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Name', firstName, true)}
        ${row('Email', `<a href="mailto:${email}">${email}</a>`, false)}
        ${row('Market', marketLabel, true)}
        ${row('Care level', careLevelLabel, false)}
        ${row('Assets bucket', assetsBucket, true)}
        ${row('Income bucket', incomeBucket, false)}
        <tr style="background:#fff;border-top:2px solid #C49A2A;">
          <td style="padding:8px 12px;font-weight:600;font-size:13px;">Runway</td>
          <td style="padding:8px 12px;font-weight:700;color:#5D0E0E;font-size:13px;">${runwayDisplay} years</td>
        </tr>
        ${row('Quoted rate', `${fmt(quotedMonthly)}/mo`, true)}
        ${row('All-in cost', `${fmt(actualMonthly)}/mo`, false)}
        ${row('Annual gap', `${fmt(annualGap)}/yr`, true)}
        ${optRow('GCLID', gclid, false)}
        ${optRow('UTM source', utmSource, true)}
        ${optRow('UTM medium', utmMedium, false)}
        ${optRow('UTM campaign', utmCampaign, true)}
        ${optRow('Referrer', referrer, false)}
      </table>
    </div>
  `;
}

export async function submitRunwayLead(payload: RunwayLeadPayload): Promise<void> {
  const {
    firstName,
    email,
    assetsBucket,
    incomeBucket,
    market,
    careLevel,
    quotedMonthly,
    actualMonthly,
    monthlyGap,
    annualGap,
    runwayYears,
    gclid,
    utmSource,
    utmMedium,
    utmCampaign,
    referrer,
  } = payload;

  const { error } = await supabaseAdmin.from('runway_leads').insert({
    first_name: firstName,
    email,
    assets_bucket: assetsBucket,
    income_bucket: incomeBucket,
    market,
    care_level: careLevel,
    quoted_monthly: quotedMonthly,
    actual_monthly: actualMonthly,
    monthly_gap: monthlyGap,
    annual_gap: annualGap,
    runway_years: runwayYears,
    gclid: gclid ?? null,
    utm_source: utmSource ?? null,
    utm_medium: utmMedium ?? null,
    utm_campaign: utmCampaign ?? null,
    referrer: referrer ?? null,
  });

  if (error) {
    console.error('[runway] submitRunwayLead error:', error);
    throw new Error('Failed to save runway lead');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const emailPromises: Promise<unknown>[] = [];

  emailPromises.push(
    resend.emails
      .send({
        from: FROM_RUNWAY,
        to: email,
        subject: `Your Care Cost Runway estimate -- ${MARKET_LABELS[market] ?? market}`,
        html: buildLeadConfirmationEmail(payload),
      })
      .then(({ error: err }) => {
        if (err) console.error('[runway] confirmation email error:', err);
      })
  );

  if (RUNWAY_NOTIFICATION_EMAIL) {
    emailPromises.push(
      resend.emails
        .send({
          from: FROM_NOTIFICATIONS,
          to: RUNWAY_NOTIFICATION_EMAIL,
          subject: `New runway lead -- ${MARKET_LABELS[market] ?? market}, ${CARE_LABELS[careLevel] ?? careLevel} care, ${runwayDisplay(runwayYears)} yrs`,
          html: buildNotificationEmail(payload),
        })
        .then(({ error: err }) => {
          if (err) console.error('[runway] notification email error:', err);
        })
    );
  } else {
    console.warn('[runway] RUNWAY_NOTIFICATION_EMAIL not set -- internal notification skipped.');
  }

  await Promise.allSettled(emailPromises);
}

function runwayDisplay(years: number): string {
  return years >= 50 ? '50+' : String(years);
}
