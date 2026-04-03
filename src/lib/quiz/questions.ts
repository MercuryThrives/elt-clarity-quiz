export interface Question {
  id: string;
  category: string;
  text: string;
  insight: string;
}

export const QUESTIONS: Question[] = [
  { id: "Q01", category: "Social", text: "How consistently is your loved one engaging in meaningful social interaction?", insight: "Social connection is a vital factor in overall health." },
  { id: "Q02", category: "Nutrition", text: "Have you noticed changes in eating habits, meal preparation, or food management?", insight: "Changes in eating habits often signal 'Executive Function' shifts." },
  { id: "Q03", category: "Safety", text: "Has there been a recent fall, near-fall, or noticeable change in mobility?", insight: "A change in mobility often indicates an increased risk of future falls." },
  { id: "Q04", category: "Support Coverage", text: "Are support needs increasingly occurring outside of currently scheduled care hours?", insight: "Frequent non-emergency calls are a common indicator of caregiver burnout." },
  { id: "Q05", category: "Environment", text: "Is your loved one avoiding certain rooms or levels of the home due to safety or comfort concerns?", insight: "Avoiding levels of a home suggests the environment may be becoming a barrier." },
  { id: "Q06", category: "Medical", text: "Is there a consistent and reliable system in place for medications to be taken as prescribed?", insight: "Medication errors are a leading cause of avoidable senior hospitalizations." },
  { id: "Q07", category: "Night", text: "Are there emerging concerns at night related to anxiety, safety, or supervision?", insight: "Night-time anxiety can lead to sleep deprivation and increased risk." },
  { id: "Q08", category: "Daily Tasks", text: "Are routine personal care tasks becoming more difficult or inconsistent?", insight: "Declining hygiene suggests that daily tasks may be becoming overwhelming." },
  { id: "Q09", category: "Resource Alignment", text: "Is the current level of support requiring more time, coordination, or resources than originally anticipated?", insight: "There is often a tipping point where home care costs match the infrastructure of a community." },
  { id: "Q10", category: "Backup", text: "Is there a clear backup plan if a caregiver or support routine is unexpectedly disrupted?", insight: "Effective care plans usually account for potential caregiver disruptions." },
  { id: "Q11", category: "Caregiver", text: "Is the primary caregiver experiencing signs of strain, fatigue, or reduced personal capacity?", insight: "A primary caregiver's health is a critical factor in the senior's ongoing stability." },
  { id: "Q12", category: "Family", text: "Is the family aligned on how evolving care needs should be addressed?", insight: "Alignment among family members is key for a successful care transition." },
];

export const ANSWER_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Very Often" },
];