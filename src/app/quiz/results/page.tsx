"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveTrack } from "@/lib/quiz/track";
import ResultsCard from "@/components/quiz/ResultsCard";
import Disclaimer from "@/components/quiz/Disclaimer";
import { useQuiz } from "@/components/quiz/QuizStore";
import { saveSubmission } from "@/app/actions/submissions";
import { normalizePartnerId } from "@/lib/partner";
import PartnerHeader from "@/components/quiz/PartnerHeader";

function getPartnerFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find(row => row.startsWith('elt_partner='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function ResultsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { answers, reset } = useQuiz();

  const partnerId = normalizePartnerId(searchParams.get("partner")) ?? getPartnerFromCookie();
  const track = resolveTrack(searchParams.get("track"));

  const [ready, setReady] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [partnerCtaData, setPartnerCtaData] = useState<{ name: string; phone: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const saved = useRef(false);

  useEffect(() => {
    if (!answers || Object.keys(answers).length === 0) {
      router.replace("/quiz");
    }
  }, [answers, router]);

  useEffect(() => {
    if (!answers || Object.keys(answers).length === 0) return;
    if (saved.current) return;
    saved.current = true;

    const score = track.calculateScore(answers);
    const tier = track.calculateTier(score);

    saveSubmission(partnerId, score, `Tier ${tier}`)
      .then(({ submissionId, agencyName: fetchedAgencyName, partnerPhone }) => {
        setSubmissionId(submissionId);
        setAgencyName(fetchedAgencyName);
        if (fetchedAgencyName && partnerPhone) {
          setPartnerCtaData({ name: fetchedAgencyName, phone: partnerPhone });
        }
      })
      .catch(() => {
        // silently ignore — results still display without submission
      })
      .finally(() => {
        setReady(true);
      });
  }, [answers, partnerId]);

  if (!answers || Object.keys(answers).length === 0) return null;
  if (!ready) return <div className="min-h-screen bg-[#faf9f7]" />;

  const score = track.calculateScore(answers);
  const result = track.buildTierResult(score, partnerCtaData);

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <PartnerHeader partnerId={partnerId} />
      <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-4">

        <ResultsCard
          result={result}
          answers={answers}
          submissionId={submissionId}
          agencyName={agencyName}
          partnerId={partnerId}
          trackQuestions={track.questions}
          trackGuideContent={track.guideContent}
        />

        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-[13px] text-stone-400 text-center">
            Care needs evolve. Families who check in quarterly often catch changes earlier.
          </p>

          <button
            onClick={() => {
              reset();
              router.push(partnerId ? `/?partner=${encodeURIComponent(partnerId)}` : "/");
            }}
            className="text-[18px] text-stone-700 hover:text-stone-600 hover:underline font-mono tracking-widest uppercase transition-colors cursor-pointer"
          >
            ← Retake Quiz
          </button>

          <button
            onClick={() => {
              const url = window.location.origin + (partnerId ? `/?partner=${encodeURIComponent(partnerId)}` : '/');
              navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
            className="text-[13px] text-stone-400 hover:text-stone-500 transition-colors"
          >
            {copied ? 'Link copied!' : 'Save Your Return Link'}
          </button>
        </div>
      </div>
      <Disclaimer />
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <ResultsPageInner />
    </Suspense>
  );
}
