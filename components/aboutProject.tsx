'use client';

import Link from 'next/link';

type AboutProjectProps = { className?: string };

export default function AboutProject({ className = '' }: AboutProjectProps) {
  return (
    <section
      aria-label="Sobre o Programa de Autoconhecimento Docente"
      className={`mx-auto max-w-7xl px-6 pt-4 sm:pt-6 md:pt-8 pb-10 bg-white text-gray-800 ${className}`}
    >

      {/* HERO INSTITUCIONAL REESTRUTURADO */}
      <header className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#004c97] leading-tight">
          Programa de Autoconhecimento Docente
        </h1>

        <p className="mt-6 max-w-3xl text-base sm:text-lg md:text-xl leading-relaxed text-gray-700 mx-auto sm:mx-0">
          O <strong className="text-[#004c97]">Programa de Autoconhecimento</strong> é um processo estruturado que busca apoiar
          docentes da UFSM no desenvolvimento pessoal e profissional. Utilizando recursos de avaliação psicológica
          e psicoeducação, ele promove equilíbrio entre vida pessoal e docência.
        </p>

        <div className="mt-6 bg-red-50 border-l-4 border-red-700 p-4 max-w-3xl mx-auto sm:mx-0 rounded-md">
          <p className="text-red-700 text-sm sm:text-base leading-relaxed">
            <strong>Atenção:</strong> Este programa <u>não substitui psicoterapia</u>.
            Ele é um recurso de autodesenvolvimento e reflexão, não um tratamento clínico.
          </p>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#004c97] mb-4">
          Objetivos do Programa
        </h2>

        <ul className="mt-4 list-disc pl-6 space-y-1 text-lg leading-relaxed">
          <li>Explorar características pessoais, valores e motivações.</li>
          <li>Promover equilíbrio entre vida profissional e pessoal.</li>
          <li>Fomentar a saúde mental e o bem-estar docente.</li>
          <li>Desenvolver habilidades de comunicação e relações interpessoais.</li>
          <li>Aprimorar o gerenciamento do estresse acadêmico.</li>
          <li>Fortalecer o crescimento e preparo para desafios futuros.</li>
        </ul>
      </section>

      {/* Metodologia */}
      <section className="mb-12 grid gap-8 md:grid-cols-2 justify-center">
        {[
          {
            title: 'Personalidade (Big Five)',
            desc:
              'Os formulários utilizam os Cinco Grandes Fatores da Personalidade — Abertura, Conscienciosidade, Extroversão, Amabilidade e Neuroticismo — para compreender como diferentes traços influenciam atitudes, comportamentos e potencial de crescimento pessoal.',
          },
          {
            title: 'Aplicação Docente',
            desc:
              'O foco está em apoiar o professor na prática educacional, desde o planejamento e condução das aulas até o desenvolvimento profissional. A aplicação também considera o bem-estar docente e a integração entre ensino, pesquisa e vida acadêmica.',
          },
          {
            title: 'Confidencialidade',
            desc:
              'Nenhum dado de identificação pessoal ou funcional é solicitado. Todas as respostas são anônimas e tratadas de forma ética e segura, garantindo que não seja possível identificar individualmente os participantes.',
          },
        ].map((c, i, arr) => (
          <article
            key={c.title}
            className={`rounded-2xl border border-[#004c97]/20 bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition
        ${
          i === arr.length - 1 && arr.length % 2 !== 0
            ? 'md:col-span-2 md:max-w-2xl md:mx-auto md:p-10'
            : ''
        }`}
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-[#004c97]">
              {c.title}
            </h3>
            <p className="mt-3 text-lg leading-relaxed">{c.desc}</p>
          </article>
        ))}
      </section>

      {/* Formulários */}
      <section className="text-center py-16 bg-[#f3f9ff] border-t-4 border-[#004c97] mt-10 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold text-[#004c97] mb-4">
          Acesse os Formulários
        </h2>

        <p className="mb-8 text-xl text-[#003865] max-w-2xl mx-auto">
          Participe do programa respondendo aos formulários disponíveis.
        </p>

        <Link
          href="/forms"
          className="inline-block rounded-lg bg-[#004c97] px-8 py-4 text-xl font-semibold text-white shadow-lg transition hover:bg-[#003870] hover:scale-105"
        >
          Ir para os Formulários
        </Link>
      </section>

    </section>
  );
}
