"use client";

import { useState } from "react";
import { updateSubmissionEmail } from "@/app/actions/submissions";

interface InlineEmailFormProps {
  submissionId: string | null;
}

export default function InlineEmailForm({ submissionId }: InlineEmailFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const form = e.currentTarget;
  const honeypot = (form.elements.namedItem("company") as HTMLInputElement)?.value;

  if (honeypot) return;
  if (!email) return;

  if (submissionId) {
    updateSubmissionEmail(submissionId, email).catch(() => {});
  }

  setSubmitted(true);
}

  if (submitted) {
    return (
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-[18px] leading-relaxed text-emerald-900 text-center">
        Thank you — we’ll be in touch shortly.
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="mb-4 text-[18px] leading-relaxed text-stone-700">
        Request a care clarity review with Elder Life Transitions:
      </p>

 <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">

  <input
    type="text"
    name="company"
    tabIndex={-1}
    autoComplete="off"
    className="hidden"
  />

  <label htmlFor="email" className="sr-only">
    Email address
  </label>

  <input
    id="email"
    type="email"
    required
    inputMode="email"
    autoComplete="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Email address"
    className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-[18px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
  />

  <button
    type="submit"
    className="rounded-xl bg-stone-800 px-6 py-3 text-[18px] font-medium text-white transition-colors hover:bg-stone-900"
  >
    Request Review
  </button>

</form>
    </div>
  );
}