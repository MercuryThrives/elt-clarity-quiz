"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from '@/lib/quiz/questions'
import ProgressBar from "@/components/quiz/ProgressBar";
import QuestionCard from "@/components/quiz/QuestionCard";
import Disclaimer from "@/components/quiz/Disclaimer";

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const current = QUESTIONS[currentIndex];
  const isLast = currentIndex === QUESTIONS.length - 1;

  function handleSelect(value: number) {
    const updated = { ...answers, [current.id]: value };
    setAnswers(updated);

    if (isLast) {
      const params = new URLSearchParams({ a: JSON.stringify(updated) });
      router.push(`/quiz/results?${params.toString()}`);
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 200);
    }
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-4">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <span className="font-serif text-stone-800 text-lg tracking-tight">ELT</span>
          <span className="font-mono text-xs text-stone-400 ml-2 tracking-widest uppercase">Clarity Quiz</span>
        </div>

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
              className="mt-8 text-xs text-stone-400 hover:text-stone-600 font-mono tracking-widest uppercase transition-colors"
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