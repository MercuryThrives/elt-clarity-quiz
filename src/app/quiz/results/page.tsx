"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { buildTierResult } from "@/lib/quiz/scoring";
import ResultsCard from "@/components/quiz/ResultsCard";
import Disclaimer from "@/components/quiz/Disclaimer";

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("a");

  if (!raw) {
    return (
      <div className="text-center py-24 text-stone-400 font-mono text-sm">
        No results found.{" "}
        <button onClick={() => router.push("/quiz")} className="underline hover:text-stone-600">
          Retake quiz
        </button>
      </div>
    );
  }

  let answers: Record<string, number>;
  try {
    answers = JSON.parse(raw);
  } catch {
    return (
      <div className="text-center py-24 text-stone-400 font-mono text-sm">
        Invalid results.{" "}
        <button onClick={() => router.push("/quiz")} className="underline hover:text-stone-600">
          Retake quiz
        </button>
      </div>
    );
  }

  const score = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const result = buildTierResult(score);

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-4">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <span className="font-serif text-stone-800 text-lg tracking-tight">ELT</span>
          <span className="font-mono text-xs text-stone-400 ml-2 tracking-widest uppercase">Clarity Quiz</span>
        </div>

        <ResultsCard result={result} answers={answers} />

        <button
          onClick={() => router.push("/quiz")}
          className="mt-10 text-xs text-stone-400 hover:text-stone-600 font-mono tracking-widest uppercase transition-colors"
        >
          ← Retake Quiz
        </button>
      </div>
      <Disclaimer />
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}