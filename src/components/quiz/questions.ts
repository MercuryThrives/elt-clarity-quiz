export interface Question {
  id: string;
  category: string;
  text: string;
  insight: string;
}

export const QUESTIONS: Question[] = [
  { id: "Q01", category: "Social", text: "How often is your loved one engaging in social activities?", insight: "Social connection is a vital factor in overall health." },
  { id: "Q02", category: "Nutrition", text: "Are you noticing changes in eating habits or food management?", insight: "Changes in eating habits often signal 'Executive Function' shifts." },
  { id: "Q03", category: "Safety", text: "Has there been a recent fall or a change in mobility?", insight: "A change in mobility often indicates an increased risk of future falls." },
  { id: "Q04", category: "Burnout", text: "Are you getting frequent, non-emergency calls at all hours?", insight: "Frequent non-emergency calls are a common indicator of caregiver burnout." },
  { id: "Q05", category: "Environment", text: "Is the senior avoiding certain floors or rooms in the house?", insight: "Avoiding levels of a home suggests the environment may be becoming a barrier." },
  { id: "Q06", category: "Medical", text: "Is there a reliable system for taking meds as prescribed?", insight: "Medication errors are a leading cause of avoidable senior hospitalizations." },
  { id: "Q07", category: "Night", text: "Is the senior experiencing anxiety or safety issues at night?", insight: "Night-time anxiety can lead to sleep deprivation and increased risk." },
  { id: "Q08", category: "Hygiene", text: "Is there a visible decline in grooming or hygiene?", insight: "Declining hygiene suggests that daily tasks may be becoming overwhelming." },
  { id: "Q09", category: "Cost", text: "Does the cost of current care outweigh the infrastructure of a community?", insight: "There is often a tipping point where home care costs match the infrastructure of a community." },
  { id: "Q10", category: "Backup", text: "Is there a backup plan if the current care routine is disrupted?", insight: "Effective care plans usually account for potential caregiver disruptions." },
  { id: "Q11", category: "Caregiver", text: "Has the primary caregiver's own health begun to suffer?", insight: "A primary caregiver's health is a critical factor in the senior's ongoing stability." },
  { id: "Q12", category: "Family", text: "Is the family in agreement on the next steps for care?", insight: "Alignment among family members is key for a successful care transition." },
];

export const ANSWER_OPTIONS = [
  { value: 1, label: "Not at all" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
];