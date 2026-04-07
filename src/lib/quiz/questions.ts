export interface Question {
  id: string;
  category: string;
  text: string;
  insight: string;
  options?: { value: number; label: string }[];
}

export const QUESTIONS: Question[] = [
  {
    id: "Q01",
    category: "Overview",
    text: "In the past few months, how would you describe the overall direction of your loved one's situation?",
    insight: "Reduced social engagement is one of the earliest and most overlooked signals of cognitive and emotional decline — often appearing months before other changes become visible. Isolation compounds quickly once routines break down.",
    options: [
      { value: 0, label: "Stable and well-managed" },
      { value: 1, label: "Mostly okay with a few concerns" },
      { value: 2, label: "Gradually becoming harder to manage" },
      { value: 3, label: "Several things are getting harder at once" },
      { value: 4, label: "We're in or approaching a crisis point" },
    ],
  },
  { id: "Q02", category: "Safety", text: "Has there been a recent fall, near-fall, or noticeable change in mobility?", insight: "Falls and near-falls are the pattern families most commonly underestimate. What looks like a mobility issue is often the first visible sign of broader changes in physical confidence, spatial awareness, and reaction time." },
  { id: "Q03", category: "Support Coverage", text: "Are support needs increasingly occurring outside of currently scheduled care hours?", insight: "Support needs that spill outside scheduled care hours are a reliable early indicator of a widening gap between current care and actual need. This pattern tends to accelerate, not stabilize." },
  {
    id: "Q04",
    category: "Medical",
    text: "Is there a consistent and reliable system in place for medications to be taken as prescribed?",
    insight: "Medication errors are among the leading causes of avoidable senior hospitalizations. When management is inconsistent, it's rarely a memory problem alone — it often reflects a broader need for structured daily support.",
    options: [
      { value: 0, label: "Yes, consistently" },
      { value: 1, label: "Most of the time" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Rarely" },
      { value: 4, label: "No clear system in place" },
    ],
  },
  { id: "Q05", category: "Night", text: "Are there emerging concerns at night related to anxiety, safety, or supervision?", insight: "Nighttime anxiety, confusion, or safety concerns are among the most disruptive patterns for families — and among the hardest to manage with scheduled daytime care alone. Sleep deprivation compounds every other challenge." },
  { id: "Q06", category: "Daily Tasks", text: "Are routine personal care tasks becoming more difficult or inconsistent?", insight: "Declining personal care routines are a sensitive but important signal. When hygiene or grooming becomes inconsistent, it often reflects a combination of physical, cognitive, and motivational changes that are easier to address early than late." },
  { id: "Q07", category: "Caregiver", text: "Is the primary caregiver experiencing signs of strain, fatigue, or reduced personal capacity?", insight: "The primary caregiver's health is the hidden variable in most care arrangements. When the caregiver is experiencing strain or reduced capacity, the stability of the entire support structure is at risk — often without anyone naming it directly." },
  {
    id: "Q08",
    category: "Family",
    text: "Is the family aligned on how evolving care needs should be addressed?",
    insight: "Family alignment is one of the most significant factors in how smoothly a care transition goes. When family members see the situation differently, decisions get delayed — and delay in care transitions rarely benefits the person who needs support.",
    options: [
      { value: 0, label: "Yes, we're aligned" },
      { value: 1, label: "Mostly aligned with some tension" },
      { value: 2, label: "There are significant differences of opinion" },
      { value: 3, label: "This topic hasn't really been discussed" },
    ],
  },
];

export const ANSWER_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Very Often" },
];