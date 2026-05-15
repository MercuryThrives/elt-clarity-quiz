"use client";

import { useState } from "react";
import type { SCResult } from "@/lib/sc/scScoring";
import { SC_PATHWAY_LABELS, SC_PATHWAY_CONTENT } from "@/lib/sc/scPathwayContent";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CALENDAR_URL = "https://calendar.app.google/GyPaWGMWm7TN2bodA";
const RM_URL = "/funding/reverse-mortgage";

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
  const pathwayLabel = SC_PATHWAY_LABELS[result.pathway];
  const content = SC_PATHWAY_CONTENT[result.pathway];

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
