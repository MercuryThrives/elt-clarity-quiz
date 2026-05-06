import type { Question } from './quiz/questions';

export const FUNDING_RM_QUESTIONS: Question[] = [
  {
    id: "rm_age",
    category: "Age",
    text: "How old is the homeowner?",
    insight: "",
    options: [
      { value: 0, label: "Under 62" },
      { value: 1, label: "62 to 69" },
      { value: 2, label: "70 to 79" },
      { value: 3, label: "80 or older" },
    ],
  },
  {
    id: "rm_residence",
    category: "Residency",
    text: "Is this home the person's primary residence — where they currently live?",
    insight: "",
    options: [
      { value: 0, label: "No — they live somewhere else" },
      { value: 1, label: "Temporarily away (rehab, hospital, or staying with family)" },
      { value: 2, label: "Yes — they live there now" },
    ],
  },
  {
    id: "rm_equity",
    category: "Equity",
    text: "Does the person own their home, and roughly how much is still owed on it?",
    insight: "",
    options: [
      { value: 0, label: "Renting, or does not own" },
      { value: 1, label: "Significant balance remaining — more than 30% of home's value" },
      { value: 2, label: "Small balance remaining — less than 30% of home's value" },
      { value: 3, label: "Own it free and clear — no mortgage" },
    ],
  },
  {
    id: "rm_property",
    category: "Property",
    text: "What type of home is it?",
    insight: "",
    options: [
      { value: 0, label: "Other — not sure it qualifies" },
      { value: 1, label: "Manufactured or mobile home" },
      { value: 2, label: "Townhome or condo" },
      { value: 3, label: "Single-family home or 1–4 unit property" },
    ],
  },
  {
    id: "rm_medicaid",
    category: "Medicaid",
    text: "Is this person currently receiving Medicaid, or actively applying for it?",
    insight: "",
    options: [
      { value: 0, label: "Yes — currently on Medicaid" },
      { value: 1, label: "Currently applying or planning to apply soon" },
      { value: 2, label: "Not sure" },
      { value: 3, label: "No" },
    ],
  },
  {
    id: "rm_goal",
    category: "Goal",
    text: "What is the family hoping a reverse mortgage might help with?",
    insight: "",
    modifier: true,
    options: [
      { value: 1, label: "Paying for home care or in-home support" },
      { value: 1, label: "Covering assisted living or memory care costs" },
      { value: 1, label: "Supplementing monthly income at home" },
      { value: 1, label: "Not sure — just exploring options" },
    ],
  },
];
