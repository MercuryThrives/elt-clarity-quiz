"use client";

export default function SnfHeader() {
  return (
    <>
      <div className="w-full" style={{ height: "5px", backgroundColor: "#4a6741" }} />
      <header className="w-full border-b border-stone-200 bg-[#faf9f7]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-6 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/elt-logo.png"
            alt="Elder Life Transitions"
            style={{ height: "120px" }}
            className="w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute("hidden");
            }}
          />
          <span hidden className="font-serif text-stone-800 text-[18px] tracking-tight">
            Elder Life Transitions
          </span>
        </div>
      </header>
    </>
  );
}
