'use client';

import { useState } from 'react';

type AboutCAEDProps = { className?: string };

export default function AboutCAED({ className = '' }: AboutCAEDProps) {
  const email = 'equipeedusaudecaed@ufsm.br';
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <section
      aria-label="Sobre o CAEd/UFSM"
      className={`mx-auto max-w-7xl px-6 py-12 sm:py-16 bg-white text-gray-800 ${className}`}
    >
      {/* Hero */}
      <header>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#004c97]">
          CAEd/PROGRAD — Coordenadoria de Ações Educacionais (UFSM)
        </h1>
        <br></br>
        <p className="mt-4 max-w-4xl text-lg leading-relaxed">
          A Coordenadoria de Ações Educacionais (CAED/PROGRAD) , subunidade administrativa vinculada à Pró-Reitoria de Graduação, desenvolve ações de apoio junto ao público  da UFSM. O trabalho desenvolvido visa, de modo geral, o acesso e a permanência dos estudantes na Instituição, a promoção da aprendizagem, a acessibilidade, as ações afirmativas e a promoção de ações na área da educação-saúde.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={copyEmail}
            className="rounded-lg bg-[#004c97] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#003870] focus:outline-none focus:ring-2 focus:ring-[#004c97] focus:ring-offset-2"
            aria-live="polite"
          >
            {copied ? 'E-mail copiado!' : `Copiar e-mail: ${email}`}
          </button>
        </div>
      </header>

    </section>
  );
}
