// components/Hero.tsx
import React from "react";

export type CTA = { label: string; href: string };

type HeroProps = {
  title: string;
  subtitle?: string;
  ctas?: CTA[];
  eyebrow?: string;
  backgroundImageUrl?: string;
};

export default function Hero({
  title,
  subtitle,
  ctas = [],
  eyebrow,
  backgroundImageUrl,
}: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* BACKGROUND */}
      <div
        className={[
          "absolute inset-0 -z-10",
          "bg-gradient-to-br from-[#004c97] via-[#2767b8] to-[#0a2a52]",
          backgroundImageUrl ? "opacity-95" : "",
        ].join(" ")}
        style={
          backgroundImageUrl
            ? {
                backgroundImage: `linear-gradient(to bottom right, rgba(0,76,151,0.85), rgba(10,42,82,0.85)), url(${backgroundImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      />

      {/* Glow + Grid (mantive os dois) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Glow radial */}
        <div
          className="absolute left-1/2 top-[-10%] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,255,255,0.18), transparent)",
          }}
        />
        {/* Grade listrada (retornada!) */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* CONTEÚDO */}
      <div className="mx-auto flex min-h-[55vh] max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10 md:min-h-[60vh]">
        <div className="max-w-2xl">
          {eyebrow && (
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 ring-1 ring-white/30 backdrop-blur">
              {eyebrow}
            </span>
          )}

          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 md:mt-4 md:text-base">
              {subtitle}
            </p>
          )}

          {ctas.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {ctas.map((c, i) => (
                <a
                  key={c.label}
                  href={c.href}
                  className={[
                    "rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors",
                    i === 0
                      ? "bg-white text-[#004c97] hover:bg-gray-100"
                      : "bg-white/0 text-white ring-1 ring-white/50 hover:bg-white/10",
                  ].join(" ")}
                >
                  {c.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shape divider */}
      <svg
        className="absolute bottom-[-1px] left-0 right-0 -z-10 h-8 w-full text-white"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,64 C240,0 480,128 720,64 C960,0 1200,96 1440,48 L1440,80 L0,80 Z"
        />
      </svg>
    </section>
  );
}
