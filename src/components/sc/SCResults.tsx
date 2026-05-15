"use client";

import { useState } from "react";
import type { SCResult, SCPathway } from "@/lib/sc/scScoring";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PATHWAY_LABELS: Record<SCPathway, string> = {
  "home-family-support":     "Home with Family Support",
  "home-professional-hca":   "Home with Professional Support",
  "independent-living":      "Independent Living",
  "assisted-living":         "Assisted Living",
  "memory-care":             "Memory Care",
  "residential-care-home":   "Residential Care Home",
  "complex-medical-consult": "Complex Medical Assessment",
};

const CALENDAR_URL = "https://calendar.app.google/GyPaWGMWm7TN2bodA";
const RM_URL = "/funding/reverse-mortgage";

// ---------------------------------------------------------------------------
// Pathway content
// ---------------------------------------------------------------------------

interface PathwayContent {
  anticipationBullets: [string, string, string];
  about: string;
  whyFits: string;
  anticipate: [string, string, string];
  whatFamiliesDontKnow: string;
  alsoConsidering: string;
}

const PATHWAY_CONTENT: Record<SCPathway, PathwayContent> = {
  "home-family-support": {
    anticipationBullets: [
      "What early changes families most often underestimate -- and why it matters now",
      "How to set up support at home so it works long-term, not just for this month",
      "The sign that tells you when this option has stopped being the right fit",
    ],
    about:
      "Home with family support works well when the need is real but manageable -- and when the people providing that support have enough bandwidth to do it well. The key is building a structure that holds without burning anyone out.",
    whyFits:
      "Based on what you shared, your loved one's needs are at a level where staying home with the right family involvement looks feasible. The goal is making sure that support is sustainable -- for everyone involved.",
    anticipate: [
      "Needs tend to increase gradually. What works now may need adjustment in six to twelve months.",
      "Family caregiving works best with clear roles and honest conversations about limits.",
      "Knowing what the next step would look like -- before you need it -- makes that transition much easier.",
    ],
    whatFamiliesDontKnow:
      "Many families in this situation wait too long to involve outside support -- not because they don't need it, but because they don't want to admit it. The families who navigate this best are the ones who build a broader support structure early, while there's still time to do it without pressure.",
    alsoConsidering:
      "Home with Professional Support -- if the caregiving load increases or consistency becomes a concern, bringing in professional help is often the bridge that keeps a parent home longer.",
  },

  "home-professional-hca": {
    anticipationBullets: [
      "What separates a reliable home care agency from one that will let you down at the worst possible moment",
      "Which specific services are worth paying for -- and which ones families often pay for but don't actually need",
      "How to know when home care is working, and when it has reached its limit",
    ],
    about:
      "Professional home care brings trained support into the home on a scheduled basis. It works well when the need is consistent and the home environment is set up to support it. The quality of the agency matters enormously.",
    whyFits:
      "What you've shared suggests a level of need that goes beyond what family support alone can reliably provide. Professional help at home could be the right next step -- if the right agency and services are matched to the specific situation.",
    anticipate: [
      "Consistency matters. Ask agencies specifically how they handle caregiver call-outs -- this is where most families run into problems.",
      "Costs vary significantly depending on hours and services. Understanding the full picture before committing is worth the extra time.",
      "This option works best when someone is overseeing the arrangement -- not just assuming it is running well.",
    ],
    whatFamiliesDontKnow:
      "Most families choose a home care agency based on price or availability. The families who get the best outcomes choose based on how the agency handles problems -- because problems always come up. Knowing what questions to ask before you sign anything is the difference between a good experience and a very difficult one.",
    alsoConsidering:
      "Assisted Living -- if professional support at home becomes difficult to coordinate or needs increase beyond what home care can reliably cover, an assisted living community may offer more consistent support with less family coordination required.",
  },

  "independent-living": {
    anticipationBullets: [
      "What independent living actually includes -- and what it does not",
      "Why isolation is often the real driver behind a move, even when families think it is about safety",
      "How to evaluate whether a community will actually feel like home",
    ],
    about:
      "Independent living communities are designed for older adults who are largely self-sufficient but want connection, activities, and the security of a supportive environment without the isolation of living alone.",
    whyFits:
      "Based on what you shared, the physical care needs appear manageable -- but engagement and social connection stand out as the area where something has shifted. Independent living addresses exactly that.",
    anticipate: [
      "The adjustment period is real. Most residents take two to three months to feel at home. The ones who do best get involved early.",
      "Not all communities are the same. Programming, culture, and the physical environment vary significantly.",
      "Independent living does not provide personal care. If that need develops, understanding what the next step looks like is important.",
    ],
    whatFamiliesDontKnow:
      "Most families think of independent living as a last resort. The families who are happiest with the decision are usually the ones who made it before they had to. Moving from a place of choice rather than a place of crisis makes an enormous difference in how the transition feels.",
    alsoConsidering:
      "Assisted Living -- if personal care needs develop or the level of support in independent living feels insufficient, assisted living is typically the natural next step.",
  },

  "assisted-living": {
    anticipationBullets: [
      "What assisted living actually covers -- and the gaps families are often surprised by",
      "How to compare communities without being misled by the tour",
      "The questions that reveal what a community is actually like to live in",
    ],
    about:
      "Assisted living provides daily support with personal care, meals, activities, and safety oversight in a residential setting. It works well when the level of need has grown beyond what home support can reliably cover.",
    whyFits:
      "What you've shared points to a level of need where consistent, professional support -- around the clock or close to it -- would make a meaningful difference. Assisted living is designed for exactly this stage.",
    anticipate: [
      "Tours are designed to impress. The experience of living there day-to-day is what matters -- and that takes more than one visit to understand.",
      "Costs vary significantly by community, location, and level of care. Understanding how pricing works before you tour saves a lot of confusion.",
      "The right fit depends on more than amenities. Culture, staffing, and how the community handles difficult situations matter most.",
    ],
    whatFamiliesDontKnow:
      "Most families tour three communities and choose the one that looked the best. The families who end up happiest with their choice go deeper -- they talk to residents, ask about staff turnover, and look at state inspection records. That information is public and most families never look at it.",
    alsoConsidering:
      "Memory Care -- if cognitive changes are a significant part of the picture, a memory care community offers a more structured environment designed specifically for that situation.",
  },

  "memory-care": {
    anticipationBullets: [
      "What memory care offers that assisted living does not -- and why it matters",
      "How to evaluate a memory care community beyond what the tour shows you",
      "What families wish they had known before making this decision",
    ],
    about:
      "Memory care communities are a specialized form of assisted living designed for individuals experiencing significant cognitive changes. The environment, programming, and staffing are structured specifically around memory and cognitive support.",
    whyFits:
      "The cognitive changes you've described are at a level where a specialized memory care environment may offer significantly better support than general assisted living or home care. This is not about giving up -- it is about finding the setting where your loved one can be safest and most engaged.",
    anticipate: [
      "The physical environment matters enormously in memory care. Secure, calm, and purposefully designed spaces make a real difference.",
      "Programming in memory care is designed differently than in assisted living -- music, sensory engagement, and structured routine are central.",
      "This decision is often emotionally complex for families. Having someone who has navigated it before helps.",
    ],
    whatFamiliesDontKnow:
      "Memory care is a subset of assisted living -- not a separate category. This means quality varies just as much, and the same due diligence applies. State inspection records, staff-to-resident ratios, and how a community handles behavioral situations are all worth looking into before committing.",
    alsoConsidering:
      "Residential Care Home -- for some families, a smaller, more intimate setting with fewer residents feels like a better fit, especially for individuals who may be overwhelmed by larger community environments.",
  },

  "residential-care-home": {
    anticipationBullets: [
      "What a residential care home offers that larger communities do not",
      "How to find and vet a residential care home in your area",
      "What to look for -- and what to watch out for -- in a smaller setting",
    ],
    about:
      "Residential care homes are smaller, home-like settings -- often six to eight residents -- that provide personal care in an intimate environment. They are a good option for families who want a closer-knit, less institutional setting.",
    whyFits:
      "Based on what you shared, a smaller, more personal environment may be a better fit than a larger assisted living community. Residential care homes offer a higher staff-to-resident ratio and a more consistent daily routine.",
    anticipate: [
      "Quality varies significantly. Licensing, inspection history, and the specific caregiving team matter more in smaller settings.",
      "Activities and programming are more limited than in larger communities. If social engagement and structured programming are important, this is worth factoring in.",
      "These homes are harder to find and evaluate without guidance. There is no equivalent of a large community's marketing department to walk you through the options.",
    ],
    whatFamiliesDontKnow:
      "Most families never consider residential care homes because they don't know they exist. For the right situation, they can offer a level of consistency and personal attention that larger communities simply cannot match. The challenge is knowing how to find and evaluate them.",
    alsoConsidering:
      "Assisted Living -- if programming, social activities, or a broader range of on-site services are important priorities, a larger assisted living community may be worth considering alongside residential care home options.",
  },

  "complex-medical-consult": {
    anticipationBullets: [
      "Why getting the right clinical picture first changes every decision that follows",
      "What a professional assessment covers -- and why it is different from a doctor's appointment",
      "How to move forward when the situation feels too complicated to sort out",
    ],
    about:
      "When care needs are complex, the most important first step is getting a clear clinical picture before making placement decisions. A geriatric care manager or similar professional can assess the full situation and provide guidance grounded in the specific medical and functional reality.",
    whyFits:
      "What you've shared suggests a level of complexity that goes beyond what a general care assessment can fully address. The right next step is a clinical evaluation -- not to delay action, but to make sure the action you take is the right one.",
    anticipate: [
      "A professional assessment typically takes one to two hours and covers medical, functional, cognitive, and social factors.",
      "The output is a care plan -- a specific set of recommendations, not just a general direction.",
      "This step often makes every subsequent decision faster and more confident.",
    ],
    whatFamiliesDontKnow:
      "Most families skip the clinical assessment step because it feels like a delay. The families who go through it consistently say it saved them from making a costly decision in the wrong direction. When the situation is complicated, getting the right picture first is the fastest path forward.",
    alsoConsidering:
      "Assisted Living or Memory Care -- once a clinical picture is clearer, a placement decision can be made from a much stronger foundation. ELT can help you move from assessment to placement when you are ready.",
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GateData {
  firstName: string;
  email: string;
  phone?: string;
}

interface SCResultsProps {
  result: SCResult;
  onGateSubmit: (data: GateData) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionDivider() {
  return <div className="border-t border-stone-200 my-8" />;
}

function ScheduleBlock({ variant }: { variant: "zone25" | "zone3" }) {
  const isZone25 = variant === "zone25";
  return (
    <div className={`px-6 py-8 text-center ${isZone25
      ? "rounded-2xl border border-amber-200 bg-amber-50/60"
      : "rounded-2xl border border-stone-200 bg-white"
    }`}>
      <h3 className="font-serif text-[20px] text-stone-800 mb-2 leading-snug">
        Ready to talk through what this means for your family?
      </h3>
      <p className="text-[15px] text-stone-600 mb-6 leading-relaxed">
        {isZone25
          ? "You just got a direction. A 20-minute conversation with David turns that direction into a specific next step -- at no cost."
          : "A 20-minute conversation with David turns your report into a specific next step -- at no cost."
        }
      </p>
      <a
        href={CALENDAR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[18px] font-medium py-4 px-6 transition-colors text-center"
      >
        Schedule a Free Conversation with David
      </a>
      <p className="text-[13px] text-stone-400 mt-3">No cost. No obligation. Just clarity.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SCResults({ result, onGateSubmit }: SCResultsProps) {
  const [gateSubmitted, setGateSubmitted] = useState(false);
  const [gateLoading, setGateLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const formValid = firstName.trim() !== "" && email.trim() !== "";
  const pathwayLabel = PATHWAY_LABELS[result.pathway];
  const content = PATHWAY_CONTENT[result.pathway];

  async function handleGateSubmit() {
    if (!formValid || gateLoading) return;
    setGateLoading(true);
    try {
      await onGateSubmit({
        firstName: firstName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
    } catch {
      // Surface error gracefully -- still reveal content
    } finally {
      setGateLoading(false);
      setGateSubmitted(true);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* ── Zone 1: Pre-gate (always visible) ──────────────────────────── */}
      <p className="text-[13px] text-stone-400 leading-relaxed mb-4 italic">
        Prepared by David Johnstone, former Executive Director of Assisted Living/Memory Care
        and Independent Living communities.
      </p>

      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-6 py-6 mb-8">
        <p className="text-[13px] font-mono tracking-widest uppercase text-amber-600 mb-2">
          Your Care Direction
        </p>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 mb-4 leading-tight">
          {pathwayLabel}
        </h2>
        <p className="text-[17px] text-stone-700 leading-relaxed mb-4">
          Your report addresses three things families in this situation typically get wrong:
        </p>
        <ul className="space-y-3">
          {content.anticipationBullets.map((bullet, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
              <p className="text-[16px] text-stone-600 leading-relaxed">{bullet}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Zone 2: Email gate ──────────────────────────────────────────── */}
      {!gateSubmitted ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-6">
          <h3 className="text-xl font-serif text-stone-800 mb-3">
            Get Your Personalized Care Options Report
          </h3>
          <p className="text-[16px] text-stone-600 leading-relaxed mb-6">
            I have years of experience running an Assisted Living/Memory Care community and an
            Independent Living community. I&rsquo;ve seen what families miss when they&rsquo;re
            navigating this the first time -- and what makes the difference between a good outcome
            and a painful one. This report is what I&rsquo;d tell my own family. Enter your email
            and I&rsquo;ll send it to you directly.
          </p>

          <div className="space-y-3 mb-4">
            <div>
              <label htmlFor="sc-first-name" className="block text-[14px] text-stone-500 mb-1">
                First name
              </label>
              <input
                id="sc-first-name"
                type="text"
                placeholder="First name"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-[17px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label htmlFor="sc-email" className="block text-[14px] text-stone-500 mb-1">
                Email address
              </label>
              <input
                id="sc-email"
                type="email"
                placeholder="Email address"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-[17px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label htmlFor="sc-phone" className="block text-[14px] text-stone-500 mb-1">
                Phone number <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                id="sc-phone"
                type="tel"
                placeholder="Phone number (optional)"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-[17px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <button
            onClick={handleGateSubmit}
            disabled={!formValid || gateLoading}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-[18px] font-medium py-4 px-6 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {gateLoading ? "Sending..." : "Send My Report"}
          </button>
          <p className="text-[13px] text-stone-400 text-center mt-3 leading-relaxed">
            By submitting, you agree that Elder Life Transitions may follow up with guidance related
            to your results. We do not sell your information.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 mb-2">
          <p className="text-[17px] text-emerald-800 font-medium">
            Your report is on its way -- check your inbox.
          </p>
        </div>
      )}

      {/* ── Zone 2.5 + Zone 3: Post-gate reveal ────────────────────────── */}
      {gateSubmitted && (
        <>
          <SectionDivider />

          {/* Zone 2.5 -- immediate post-gate CTA */}
          <ScheduleBlock variant="zone25" />

          <SectionDivider />

          {/* Zone 3 -- full pathway content */}
          <div className="space-y-6">

            <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
              <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-3">
                About This Care Setting
              </p>
              <p className="text-[17px] text-stone-700 leading-relaxed">
                {content.about}
              </p>
            </div>

            <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
              <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-3">
                Why This Fits Your Situation
              </p>
              <p className="text-[17px] text-stone-700 leading-relaxed">
                {content.whyFits}
              </p>
            </div>

            <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
              <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-4">
                What to Anticipate
              </p>
              <ul className="space-y-4">
                {content.anticipate.map((bullet, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <p className="text-[17px] text-stone-700 leading-relaxed">{bullet}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-5 py-5">
              <p className="text-[13px] font-mono tracking-widest uppercase text-amber-600 mb-3">
                What Most Families Don&rsquo;t Know
              </p>
              <p className="text-[17px] text-stone-700 leading-relaxed">
                {content.whatFamiliesDontKnow}
              </p>
            </div>

            <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
              <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-3">
                Also Worth Considering
              </p>
              <p className="text-[17px] text-stone-700 leading-relaxed">
                {content.alsoConsidering}
              </p>
            </div>

            {result.financialNavNeeded && (
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-5 py-4">
                <p className="text-[15px] text-stone-600 leading-relaxed">
                  If funding is a question, we have a separate resource that may help.{" "}
                  <a
                    href={RM_URL}
                    className="text-amber-600 hover:text-amber-700 underline underline-offset-2"
                  >
                    Explore funding options
                  </a>
                </p>
              </div>
            )}
          </div>

          <SectionDivider />

          {/* Zone 3 -- bottom CTA */}
          <ScheduleBlock variant="zone3" />
        </>
      )}
    </div>
  );
}
