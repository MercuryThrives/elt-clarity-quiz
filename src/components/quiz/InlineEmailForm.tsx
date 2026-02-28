"use client";

import { useState } from "react";

export default function InlineEmailForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Submission logic to be implemented in a future batch
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-700 font-medium text-center">
        Thank you — we’ll reach out soon with next steps.
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="text-sm text-stone-700 mb-1 font-medium">
        Request a Care Clarity Review
      </p>
      <p className="text-sm text-stone-600 mb-3">
        A focused conversation to review your current support structure and clarify what would feel most sustainable.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <button
          type="submit"
          className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 transition-colors whitespace-nowrap"
        >
          Request Review
        </button>
      </form>

      <p className="text-xs text-stone-400 mt-2">
        No obligation. Your information will not be sold or shared.
      </p>
    </div>
  );
}