"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizePartnerId } from "@/lib/partner";
import SCHeader from "@/components/sc/SCHeader";

function SCHomeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const partnerId = normalizePartnerId(searchParams.get("partner"));

  function handleStart() {
    const params = new URLSearchParams();
    if (partnerId) params.set("partner", partnerId);
    const qs = params.toString();
    router.push(`/sc/quiz${qs ? `?${qs}` : ""}`);
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <SCHeader partnerId={partnerId} />

      <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-16">
        <div className="w-full max-w-[640px]">

          <h1 className="font-serif text-[26px] md:text-[30px] leading-snug text-stone-800 mb-5">
            In about five minutes, you&rsquo;ll have a clearer picture of what kind of support
            your loved one actually needs -- and what to do next.
          </h1>

          <p className="text-[17px] leading-relaxed text-stone-600 mb-6"
            style={{ borderLeft: "3px solid #f59e0b", paddingLeft: "12px" }}>
            This assessment was built by a former Executive Director who ran an Assisted
            Living/Memory Care community and an Independent Living community. It cuts through the
            confusion most families face when they don&rsquo;t know where to start.
          </p>

          <ul className="space-y-2 mb-8">
            {[
              "About 5 minutes to complete",
              "No login or account required",
              "Your results are private and personalized to your situation",
            ].map((bullet) => (
              <li key={bullet} className="flex items-center gap-2 text-[16px] text-stone-600">
                <span className="text-amber-500 shrink-0">&#10003;</span>
                {bullet}
              </li>
            ))}
          </ul>

          <button
            onClick={handleStart}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[18px] font-medium py-4 px-6 transition-colors cursor-pointer"
          >
            Start the Assessment
          </button>

          <p className="text-[14px] text-stone-400 text-center mt-3 leading-relaxed">
            The earlier families have this picture, the more options they usually have.
          </p>

          <p className="text-[13px] text-stone-400 text-center mt-6 leading-relaxed">
            This tool helps identify general care directions based on what you share. It is a
            starting point -- not a diagnosis or a recommendation. Results are prepared by Elder
            Life Transitions at no cost to you.
          </p>

        </div>
      </div>
    </main>
  );
}

export default function SCHomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <SCHomeInner />
    </Suspense>
  );
}
