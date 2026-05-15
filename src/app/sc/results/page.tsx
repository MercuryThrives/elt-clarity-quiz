"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizePartnerId } from "@/lib/partner";
import SCHeader from "@/components/sc/SCHeader";
import SCResults from "@/components/sc/SCResults";
import type { SCResult } from "@/lib/sc/scScoring";
import type { SCAnswers } from "@/components/sc/SCQuestions";
import { saveSCSubmission } from "@/app/actions/sc-submissions";

interface StoredQuizResult {
  result: SCResult;
  answers: SCAnswers;
}

function SCResultsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const partnerId = normalizePartnerId(searchParams.get("partner"));
  const [stored, setStored] = useState<StoredQuizResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("sc_quiz_result");
    if (!raw) {
      router.replace("/sc");
      return;
    }
    try {
      setStored(JSON.parse(raw) as StoredQuizResult);
    } catch {
      router.replace("/sc");
      return;
    }
    setReady(true);
  }, [router]);

  async function handleGateSubmit(data: {
    firstName: string;
    email: string;
    phone?: string;
  }) {
    if (!stored) return;
    await saveSCSubmission({
      partnerId,
      answers: stored.answers,
      result: stored.result,
      firstName: data.firstName,
      email: data.email,
      phone: data.phone,
    });
  }

  if (!ready || !stored) {
    return <div className="min-h-screen bg-[#faf9f7]" />;
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <SCHeader partnerId={partnerId} />
      <SCResults result={stored.result} onGateSubmit={handleGateSubmit} />
    </main>
  );
}

export default function SCResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <SCResultsInner />
    </Suspense>
  );
}
