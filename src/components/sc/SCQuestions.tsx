"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Pronoun context
// ---------------------------------------------------------------------------

export interface SCPronouns {
  subject: string;     // he / she / they / you
  subjectCap: string;  // He / She / They / You
  object: string;      // him / her / them / you
  possessive: string;  // his / her / their / your
  verbBe: string;      // is / are
  verbDo: string;      // does / do
  verbHave: string;    // has / have
}

const PRONOUN_MAP: Record<string, SCPronouns> = {
  "Myself": {
    subject: "you", subjectCap: "You", object: "you", possessive: "your",
    verbBe: "are", verbDo: "do", verbHave: "have",
  },
  "My mother": {
    subject: "she", subjectCap: "She", object: "her", possessive: "her",
    verbBe: "is", verbDo: "does", verbHave: "has",
  },
  "My father": {
    subject: "he", subjectCap: "He", object: "him", possessive: "his",
    verbBe: "is", verbDo: "does", verbHave: "has",
  },
  "My spouse or partner": {
    subject: "they", subjectCap: "They", object: "them", possessive: "their",
    verbBe: "are", verbDo: "do", verbHave: "have",
  },
  "Another family member": {
    subject: "they", subjectCap: "They", object: "them", possessive: "their",
    verbBe: "are", verbDo: "do", verbHave: "have",
  },
};

function interpolate(template: string, p: SCPronouns): string {
  const verbHaveCap = p.verbHave.charAt(0).toUpperCase() + p.verbHave.slice(1);
  return template
    .replace(/\[Has\/Have\]/g, verbHaveCap)
    .replace(/\[he\/she\/they\]/g, p.subject)
    .replace(/\[He\/She\/They\]/g, p.subjectCap)
    .replace(/\[his\/her\/their\]/g, p.possessive)
    .replace(/\[him\/her\/them\]/g, p.object)
    .replace(/\[He\/She\/They is\]/g, `${p.subjectCap} ${p.verbBe}`)
    .replace(/\[is\/are\]/g, p.verbBe)
    .replace(/\[does\/do\]/g, p.verbDo)
    .replace(/\[has\/have\]/g, p.verbHave);
}

// ---------------------------------------------------------------------------
// Question definitions
// ---------------------------------------------------------------------------

interface SCQuestionDef {
  id: number;
  label: string;
  options: string[];
  multiSelect?: boolean;
  maxSelections?: number;
}

const QUESTIONS: SCQuestionDef[] = [
  {
    id: 1,
    label: "Who are you completing this for?",
    options: [
      "Myself",
      "My mother",
      "My father",
      "My spouse or partner",
      "Another family member",
    ],
  },
  {
    id: 2,
    label: "What's the main thing prompting you to look at this today?",
    options: [
      "I've noticed changes and I'm not sure what they mean",
      "We've had a health event or close call and we're reassessing",
      "Care at home is becoming harder to manage",
      "We're planning ahead before things change",
      "Something just feels different -- I'm not sure how to describe it",
    ],
  },
  {
    id: 3,
    label: "Where [is/are] [he/she/they] living right now?",
    options: [
      "Living alone at home",
      "Living with family",
      "In an assisted living or memory care community",
      "In a senior apartment or independent living",
      "Other",
    ],
  },
  {
    id: 4,
    label: "How much help [does/do] [he/she/they] need with personal care -- bathing, dressing, grooming?",
    options: [
      "None -- fully independent",
      "Some help, but mostly manages",
      "Needs regular help from someone",
      "Needs full assistance",
    ],
  },
  {
    id: 5,
    label: "[Has/Have] [he/she/they] had any falls, near-falls, or moments where safety at home felt uncertain in the last six months?",
    options: [
      "No",
      "Once or twice, but minor",
      "Yes, more than once",
      "Yes, and it is a serious concern",
    ],
  },
  {
    id: 6,
    label: "Have you noticed any changes in memory, judgment, or ability to manage daily decisions?",
    options: [
      "No noticeable changes",
      "Occasionally -- forgetting things, getting confused sometimes",
      "Yes -- this is becoming a regular concern",
      "Yes -- significant changes that affect daily safety",
    ],
  },
  {
    id: 7,
    label: "Who is currently providing most of the support?",
    options: [
      "[He/She/They is] managing independently",
      "Family members are helping -- we are managing okay",
      "Family members are helping -- but it is becoming a strain",
      "A paid caregiver is already involved",
      "No one is currently providing regular support",
    ],
  },
  {
    id: 8,
    label: "How would you describe [his/her/their] social connection and daily engagement?",
    options: [
      "Active -- regularly involved with others and activities",
      "Somewhat active -- some social contact but more isolated than before",
      "Mostly isolated -- limited social contact",
      "Completely isolated -- this is a concern",
    ],
  },
  {
    id: 9,
    label: "How soon do you feel like something may need to change?",
    options: [
      "We have time -- this is planning ahead",
      "In the next few months",
      "Fairly soon -- things are progressing",
      "We need to act now",
    ],
  },
  {
    id: 10,
    label: "Do you have a general sense of how care would be funded?",
    options: [
      "Yes -- we have thought about this",
      "Partially -- we are not sure what is available",
      "No -- this is one of the things we need to figure out",
      "I would rather not say",
    ],
  },
  {
    id: 11,
    label: "When you imagine the best possible outcome for [him/her/them], what matters most? Select up to 2.",
    options: [
      "Staying home as long as possible",
      "Being safe and well-supported",
      "Being socially engaged and active",
      "Getting the right level of care without overpaying",
      "Giving family members relief from caregiving",
      "Making a decision the whole family can feel good about",
    ],
    multiSelect: true,
    maxSelections: 2,
  },
];

const TOTAL = QUESTIONS.length;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SCAnswers = Record<number, string | string[]>;

export interface SCCompletePayload {
  answers: SCAnswers;
  pronouns: SCPronouns;
}

interface SCQuestionsProps {
  onComplete: (result: SCCompletePayload) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SCQuestions({ onComplete }: SCQuestionsProps) {
  const [currentQ, setCurrentQ] = useState(1);
  const [answers, setAnswers] = useState<SCAnswers>({});
  const [pronouns, setPronouns] = useState<SCPronouns>(PRONOUN_MAP["Myself"]);

  const question = QUESTIONS[currentQ - 1];
  const isMulti = question.multiSelect === true;
  const maxSel = question.maxSelections ?? 1;

  const multiSelected: string[] = isMulti
    ? ((answers[currentQ] as string[] | undefined) ?? [])
    : [];

  function resolveText(template: string): string {
    return currentQ === 1 ? template : interpolate(template, pronouns);
  }

  function advance(nextAnswers: SCAnswers, nextPronouns: SCPronouns) {
    if (currentQ === TOTAL) {
      onComplete({ answers: nextAnswers, pronouns: nextPronouns });
    } else {
      setCurrentQ(currentQ + 1);
    }
  }

  function handleSingleSelect(option: string) {
    const nextAnswers = { ...answers, [currentQ]: option };
    setAnswers(nextAnswers);

    const nextPronouns = currentQ === 1
      ? (PRONOUN_MAP[option] ?? PRONOUN_MAP["Myself"])
      : pronouns;

    if (currentQ === 1) setPronouns(nextPronouns);

    advance(nextAnswers, nextPronouns);
  }

  function handleMultiToggle(option: string) {
    const current = (answers[currentQ] as string[] | undefined) ?? [];
    let updated: string[];
    if (current.includes(option)) {
      updated = current.filter((o) => o !== option);
    } else if (current.length < maxSel) {
      updated = [...current, option];
    } else {
      return;
    }
    setAnswers({ ...answers, [currentQ]: updated });
  }

  function handleMultiContinue() {
    advance(answers, pronouns);
  }

  function handleBack() {
    if (currentQ > 1) setCurrentQ(currentQ - 1);
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">

      {/* Progress bar + back */}
      <div className="flex items-center justify-between mb-6">
        {currentQ > 1 ? (
          <button
            onClick={handleBack}
            className="text-[14px] text-stone-400 hover:text-stone-600 font-mono tracking-widest uppercase transition-colors cursor-pointer"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}
        <p className="text-[13px] font-mono text-stone-400 tracking-widest">
          {currentQ} / {TOTAL}
        </p>
      </div>

      {/* Question label */}
      <h2 className="font-serif text-[22px] sm:text-[26px] text-stone-800 leading-snug mb-6">
        {resolveText(question.label)}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((opt) => {
          const display = resolveText(opt);
          const isSelected = isMulti
            ? multiSelected.includes(opt)
            : answers[currentQ] === opt;
          const isDisabled = isMulti && !isSelected && multiSelected.length >= maxSel;

          return (
            <button
              key={opt}
              onClick={() => isMulti ? handleMultiToggle(opt) : handleSingleSelect(opt)}
              disabled={isDisabled}
              className={`w-full text-left rounded-xl border-2 px-5 py-4 text-[16px] leading-relaxed transition-all duration-150 cursor-pointer
                ${isSelected
                  ? "border-amber-400 bg-amber-50 text-stone-800 font-medium"
                  : isDisabled
                  ? "border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed"
                  : "border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50/40"
                }`}
            >
              {display}
            </button>
          );
        })}
      </div>

      {/* Multi-select continue */}
      {isMulti && (
        <button
          onClick={handleMultiContinue}
          disabled={multiSelected.length === 0}
          className="w-full mt-6 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[17px] font-medium py-4 px-6 transition-colors cursor-pointer"
        >
          Continue
        </button>
      )}
    </div>
  );
}
