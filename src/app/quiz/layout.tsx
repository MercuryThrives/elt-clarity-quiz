// QuizProvider is now at the root layout so state persists across all routes.
export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
