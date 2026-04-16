"use client";

import { Suspense, useState } from "react";
import ProgressBar from "@/components/quiz/ProgressBar";
import QuestionCard from "@/components/quiz/QuestionCard";
import Disclaimer from "@/components/quiz/Disclaimer";
import { useQuiz } from "@/components/quiz/QuizStore";
import { useRouter, useSearchParams } from "next/navigation";
import PartnerHeader from "@/components/quiz/PartnerHeader";
import { resolveTrack } from "@/lib/quiz/track";

function QuizPageInner() {
  const router = useRouter();
  const { answers, setAnswer } = useQuiz();

  const [currentIndex, setCurrentIndex] = useState(0);

  const searchParams = useSearchParams();
  const partner = searchParams.get("partner");
  const track = resolveTrack(searchParams.get("track"));

  const questions = track.questions;
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  function handleSelect(value: number) {
    setAnswer(current.id, value);

    // Build the updated answers map locally so skip logic can read it immediately
    // (state updates are async and won't be reflected in `answers` yet).
    let updatedAnswers = { ...answers, [current.id]: value };

    if (isLast) {
      if (track.id === "snf") {
        // SNF has its own dedicated results page.
        router.push(partner ? `/snf/results?partner=${encodeURIComponent(partner)}` : "/snf/results");
      } else {
        router.push(partner ? `/quiz/results?partner=${encodeURIComponent(partner)}` : "/quiz/results");
      }
      return;
    }

    // Advance to the next non-skipped question, auto-assigning scores for any skipped ones.
    let nextIndex = currentIndex + 1;
    while (nextIndex < questions.length) {
      const nextQ = questions[nextIndex];
      if (
        nextQ.skipIf &&
        updatedAnswers[nextQ.skipIf.questionId] === nextQ.skipIf.triggerValue
      ) {
        setAnswer(nextQ.id, nextQ.skipIf.autoScore);
        updatedAnswers = { ...updatedAnswers, [nextQ.id]: nextQ.skipIf.autoScore };
        nextIndex++;
      } else {
        break;
      }
    }

    const targetIndex = nextIndex;
    setTimeout(() => setCurrentIndex(targetIndex), 200);
  }

  function handleBack() {
    if (currentIndex === 0) return;
    // Step back over any questions that are currently being skipped.
    let prev = currentIndex - 1;
    while (prev > 0) {
      const q = questions[prev];
      if (q.skipIf && answers[q.skipIf.questionId] === q.skipIf.triggerValue) {
        prev--;
      } else {
        break;
      }
    }
    setCurrentIndex(prev);
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <PartnerHeader partnerId={partner} />
      <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-4">

        <div className="w-full max-w-2xl">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
          <QuestionCard
            question={current}
            selected={answers[current.id] ?? null}
            onSelect={handleSelect}
            questionNumber={currentIndex + 1}
            total={questions.length}
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
