"use client";

import { useState } from "react";
import { updateSubmissionEmail } from "@/app/actions/submissions";

interface InlineEmailFormProps {
  submissionId: string | null;
}

export default function InlineEmailForm({ submissionId }: InlineEmailFormProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem("company") as HTMLInputElement)?.value;

    if (honeypot) return;
    if (!firstName || !email) return;

    if (submissionId) {
      updateSubmissionEmail(submissionId, email, firstName).catch(() => {});
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-[18px] leading-relaxed text-emerald-900 text-center">
        Thank you {firstName} — we'll be in touch shortly.
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 px-5 py-5">
      <p className="mb-2 text-[20px] font-serif text-stone-800">
        Let's talk through what you're seeing.
      </p>
      <p className="mb-4 text-[17px] leading-relaxed text-stone-600">
        A free 30-minute conversation — no obligation, no pressure. We'll review your results together and identify the most appropriate next step.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="firstName" className="sr-only">First name</label>
          <input
            id="firstName"
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-[18px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
          />

          <label htmlFor="email" className="sr-only">Email address</label>
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
        </div>

        <button
          type="submit"
          className="rounded-xl bg-amber-600 px-6 py-3 text-[18px] font-medium text-white transition-colors hover:bg-amber-700 cursor-pointer"
        >
          Request My Free Review
        </button>

      </form>
    </div>
  );
}
