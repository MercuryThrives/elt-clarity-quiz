"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type AnswerMap = Record<string, number>;

type QuizContextValue = {
  answers: AnswerMap;
  setAnswer: (questionId: string, value: number) => void;
  reset: () => void;
};

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<AnswerMap>({});

  function setAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function reset() {
    setAnswers({});
  }

  const value = useMemo(() => ({ answers, setAnswer, reset }), [answers]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) {
    throw new Error("useQuiz must be used within <QuizProvider />");
  }
  return ctx;
}