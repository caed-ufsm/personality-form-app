'use client';

import Link from 'next/link';

type AboutProjectProps = { className?: string };

export default function AboutProject({ className = '' }: AboutProjectProps) {
  return (
    <section
      aria-label="Sobre o Programa de Autoconhecimento Docente"
      className={`mx-auto max-w-7xl px-6 py-12 sm:py-16 bg-white text-gray-800 ${className}`}
    >
      {/* Hero */}
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#004c97]">
          Programa de Autoconhecimento Docente
        </h1>
        <br />
        <p className="mt-4 max-w-4xl text-lg leading-relaxed">
          O <strong className="text-[#004c97]">Programa de Autoconhecimento</strong> é um processo
          estruturado que busca apoiar docentes da UFSM no desenvolvimento pessoal e profissional.
          Utilizando recursos de avaliação psicológica e psicoeducação, ele busca promover o equilíbrio entre a vida pessoal e a docência
        </p>
        <p className="mt-3 text-base sm:text-lg text-red-700 font-medium">
          <strong>Atenção:</strong> Este programa <u>não substitui psicoterapia</u>. Ele é um recurso
          de autodesenvolvimento e reflexão, não um tratamento clínico.
        </p>
      </header>

      {/* Objetivos principais */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#004c97]">Objetivos do Programa</h2>
        <ul className="mt-4 list-disc space-y-3 pl-7 text-lg leading-relaxed">
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
          /*
          {
            title: 'Fragilidades e Fortalezas',
            desc:
              'Cada fator é explorado a partir de possíveis fragilidades e fortalezas, incentivando reflexão prática e construtiva.',
          },
          {
            title: 'Atividades Reflexivas',
            desc:
              'Exercícios de autoconhecimento estimulam a identificar padrões pessoais e aplicar estratégias de melhoria.',
          }, */
{
  title: 'Aplicação Docente',
  desc:
    'O foco está em apoiar o professor na prática educacional, desde o planejamento e condução das aulas até o desenvolvimento profissional. A aplicação também considera o bem-estar docente e a integração entre ensino, pesquisa e vida acadêmica.',
},
          {
            title: 'Confidencialidade',
            desc:
              'Para utilização desta ferramenta, nenhum dado de identificação pessoal ou funcional (como e-mail, CPF, número de matrícula, centro de ensino ou área do conhecimento) será solicitado. Todas as respostas são anônimas e tratadas de forma ética e segura, garantindo que não seja possível identificar individualmente os participantes, mesmo em caso de acesso indevido às informações.',
          },
        ].map((c, i, arr) => (
          <article
            key={c.title}
            className={`rounded-2xl border border-[#004c97]/20 bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition
      ${i === arr.length - 1 && arr.length % 2 !== 0
                ? 'md:col-span-2 md:max-w-2xl md:mx-auto md:p-10'
                : ''
              }`}
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-[#004c97]">{c.title}</h3>
            <p className="mt-3 text-lg leading-relaxed">{c.desc}</p>
          </article>
        ))}
      </section>



      {/* Formulários */}
      <section className="text-center">
        <h2 className="text-2xl font-semibold text-[#004c97] mb-4">
          Acesse os Formulários
        </h2>
        <p className="mb-6 text-lg">
          Participe do programa respondendo aos formulários disponíveis.
        </p>
        <Link
          href="/forms"
          className="inline-block rounded-lg bg-[#004c97] px-6 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-[#003870]"
        >
          Ir para os Formulários
        </Link>
      </section>
    </section>
  );
}
