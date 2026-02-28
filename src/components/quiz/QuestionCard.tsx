"use client";

import { ANSWER_OPTIONS, Question } from "@/lib/quiz/questions";

interface QuestionCardProps {
  question: Question;
  selected: number | null;
  onSelect: (value: number) => void;
  questionNumber: number;
  total: number;
}

export default function QuestionCard({ question, selected, onSelect, questionNumber, total }: QuestionCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-block bg-amber-100 text-amber-700 text-xs font-mono tracking-widest px-2 py-0.5 rounded uppercase">
          {question.category}
        </span>
      </div>
      <h2 className="text-xl md:text-2xl font-serif text-stone-800 mb-8 leading-snug">
        {question.text}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ANSWER_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`
                group relative flex flex-col items-center justify-center rounded-xl border-2 py-5 px-3 transition-all duration-200 cursor-pointer
                ${isSelected
                  ? "border-amber-500 bg-amber-50 shadow-md shadow-amber-100"
                  : "border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/40"
                }
              `}
            >
              <span className={`text-2xl font-serif font-bold mb-1 transition-colors ${isSelected ? "text-amber-600" : "text-stone-400 group-hover:text-amber-400"}`}>
                {opt.value}
              </span>
              <span className={`text-xs text-center leading-tight transition-colors ${isSelected ? "text-amber-700 font-medium" : "text-stone-400"}`}>
                {opt.label}
              </span>
              {isSelected && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}