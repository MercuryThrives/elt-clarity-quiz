"use client";

import { Suspense, useState } from "react";
import { QUESTIONS } from "@/lib/quiz/questions";
import ProgressBar from "@/components/quiz/ProgressBar";
import QuestionCard from "@/components/quiz/QuestionCard";
import Disclaimer from "@/components/quiz/Disclaimer";
import { useQuiz } from "@/components/quiz/QuizStore";
import { useRouter, useSearchParams } from "next/navigation";
import PartnerHeader from "@/components/quiz/PartnerHeader";

function QuizPageInner() {
  const router = useRouter();
  const { answers, setAnswer } = useQuiz();

  const [currentIndex, setCurrentIndex] = useState(0);

  const current = QUESTIONS[currentIndex];
  const isLast = currentIndex === QUESTIONS.length - 1;

  const searchParams = useSearchParams();
  const partner = searchParams.get("partner");

  function handleSelect(value: number) {
    setAnswer(current.id, value);

    if (isLast) {
      router.push(partner ? `/quiz/results?partner=${encodeURIComponent(partner)}` : "/quiz/results");
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 200);
    }
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <PartnerHeader partnerId={partner} />
      <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-4">

        <div className="w-full max-w-2xl">
          <ProgressBar current={currentIndex + 1} total={QUESTIONS.length} />
          <QuestionCard
            question={current}
            selected={answers[current.id] ?? null}
            onSelect={handleSelect}
            questionNumber={currentIndex + 1}
            total={QUESTIONS.length}
          />

          {currentIndex > 0 && (
            <button
              onClick={handleBack}
              className="mt-8 text-[18px] text-stone-700 hover:text-stone-600 font-mono tracking-widest uppercase transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
      <Disclaimer />
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <QuizPageInner />
    </Suspense>
  );
}
