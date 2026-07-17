import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory Care Crisis Review | Elder Life Transitions",
  description:
    "A second opinion on your parent's memory care crisis from a former psychiatric RN and memory care Executive Director. Not a placement service.",
};

export default function MemoryCareReviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
