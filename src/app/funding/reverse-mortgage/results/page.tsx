"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuiz } from "@/components/quiz/QuizStore";
import { scoreFundingRm } from "@/lib/quiz/funding-rm-scoring";
import { normalizePartnerId } from "@/lib/partner";
import PartnerHeader from "@/components/quiz/PartnerHeader";
import FundingRmResultsCard from "@/components/quiz/FundingRmResultsCard";
import Disclaimer from "@/components/quiz/Disclaimer";

function FundingRmResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { answers, reset } = useQuiz();

  const partnerId = normalizePartnerId(searchParams.get("partner"));

  useEffect(() => {
    if (!answers || Object.keys(answers).length === 0) {
      router.replace("/funding/reverse-mortgage");
    }
  }, [answers, router]);

  if (!answers || Object.keys(answers).length === 0) return null;

  const result = scoreFundingRm(answers);

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <PartnerHeader partnerId={partnerId} />
      <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-16">
        <FundingRmResultsCard
          result={result}
          submissionId={null}
          partnerId={partnerId}
        />
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={() => {
              reset();
              router.push(partnerId ? `/funding/reverse-mortgage?partner=${encodeURIComponent(partnerId)}` : "/funding/reverse-mortgage");
            }}
            className="text-[15px] text-stone-400 hover:text-stone-600 font-mono tracking-widest uppercase transition-colors cursor-pointer"
          >
            ← Retake Assessment
          </button>
        </div>
      </div>
      <Disclaimer />
    </main>
  );
}

export default function FundingRmResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <FundingRmResultsInner />
    </Suspense>
  );
}
