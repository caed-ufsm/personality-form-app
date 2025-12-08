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
      {/* CAEd / PROGRAD */}
      <header>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#004c97]">
          CAEd/PROGRAD — Coordenadoria de Ações Educacionais (UFSM)
        </h1>

        <p className="mt-4 max-w-4xl text-lg leading-relaxed">
          A Coordenadoria de Ações Educacionais, vinculada à Pró-Reitoria de Graduação,
          desenvolve ações visando, de modo geral, o acesso e a permanência dos estudantes
          na UFSM. Desenvolvemos ações nas áreas da aprendizagem, da acessibilidade, das
          ações afirmativas e da educação-saúde.
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

      {/* Sobre o Programa */}
      <div className="mt-10 max-w-4xl space-y-4">
        <h2 className="text-2xl font-semibold text-[#004c97]">
          Sobre o Programa
        </h2>

        <p className="text-lg leading-relaxed">
          Na UFSM, a prioridade é a formação técnica, humana e profissional dos discentes.
          Contudo, para que essa formação seja alcançada de maneira plena, é fundamental
          que os professores também desenvolvam suas competências pessoais e profissionais,
          respeitando seus valores e características individuais.
        </p>

        <p className="text-lg leading-relaxed">
          Reconhecendo essa necessidade, desenvolvemos o Programa de Autoconhecimento
          Aplicado à Docência na UFSM, com o objetivo de fortalecer o autoconhecimento dos
          docentes e, assim, contribuir indiretamente para a excelência na formação dos alunos.
        </p>

        <p className="text-lg leading-relaxed">
          Este projeto está registrado sob o número 064348 e foi viabilizado por meio
          do edital nº 023/2025 do Programa Inovagente, uma parceria entre Progep e Proinova.
        </p>

        <p className="text-lg leading-relaxed">
          Nossa equipe conta com dois psicólogos da CAEd, Renato Favarin dos Santos e Ana Júlia
          Vicentini, com um estudante do curso de Sistemas de Informação, Dante Dardaque Santos,
          e com o apoio da professora Andréia Schwertner Charão.
        </p>
      </div>
    </section>
  );
}
