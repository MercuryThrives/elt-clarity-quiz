"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildTierResult, calculateTier } from "@/lib/quiz/scoring";
import ResultsCard from "@/components/quiz/ResultsCard";
import Disclaimer from "@/components/quiz/Disclaimer";
import { useQuiz } from "@/components/quiz/QuizStore";
import { saveSubmission } from "@/app/actions/submissions";
import { normalizePartnerId } from "@/lib/partner";

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

  const [ready, setReady] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
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

    const score = Object.values(answers).reduce((sum, v) => sum + v, 0);
    const tier = calculateTier(score);

    saveSubmission(partnerId, score, `Tier ${tier}`)
      .then(({ submissionId, agencyName, partnerPhone }) => {
        setSubmissionId(submissionId);
        if (agencyName && partnerPhone) {
          setPartnerCtaData({ name: agencyName, phone: partnerPhone });
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

  const score = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const result = buildTierResult(score, partnerCtaData);

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-4">
        <div className="mb-10 text-center">
          <span className="font-serif text-stone-800 text-lg tracking-tight">ELT</span>
          <span className="font-mono text-[18px] text-stone-700 ml-2 tracking-widest uppercase">
            Clarity Quiz
          </span>
        </div>

        <ResultsCard result={result} answers={answers} submissionId={submissionId} />

        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-[13px] text-stone-400 text-center">
            Care needs evolve. Families who check in quarterly often catch changes earlier.
          </p>

          <button
            onClick={() => {
              reset();
              router.push(partnerId ? `/quiz?partner=${encodeURIComponent(partnerId)}` : "/quiz");
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
