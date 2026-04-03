import { QuizProvider } from "@/components/quiz/QuizStore";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <QuizProvider>{children}</QuizProvider>;
}