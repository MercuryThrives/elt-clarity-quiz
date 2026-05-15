"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizePartnerId } from "@/lib/partner";
import SCDisclosure from "@/components/sc/SCDisclosure";
import SCHeader from "@/components/sc/SCHeader";
import SCQuestions from "@/components/sc/SCQuestions";
import type { SCCompletePayload } from "@/components/sc/SCQuestions";
import { selectScPathway } from "@/lib/sc/scScoring";

function SCQuizInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const partnerId = normalizePartnerId(searchParams.get("partner"));
  const [step, setStep] = useState<"disclosure" | "questions">("disclosure");

  function handleComplete({ answers }: SCCompletePayload) {
    const result = selectScPathway(answers);
    sessionStorage.setItem(
      "sc_quiz_result",
      JSON.stringify({ result, answers })
    );
    const qs = partnerId ? `?partner=${partnerId}` : "";
    router.push(`/sc/results${qs}`);
  }

  if (step === "disclosure") {
    return (
      <SCDisclosure partnerId={partnerId} onBegin={() => setStep("questions")} />
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <SCHeader partnerId={partnerId} />
      <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-16">
        <div className="w-full max-w-[640px]">
          <SCQuestions onComplete={handleComplete} />
        </div>
      </div>
    </main>
  );
}

export default function SCQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <SCQuizInner />
    </Suspense>
  );
}
