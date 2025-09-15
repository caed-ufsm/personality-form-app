'use client';

import Link from 'next/link';
import { useState } from 'react';

type AboutCAEDProps = { className?: string };

export default function AboutCAED({ className = '' }: AboutCAEDProps) {
  const email = 'caed@ufsm.br';
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
      className={`mx-auto max-w-5xl px-4 py-10 sm:py-14 bg-white text-gray-800 ${className}`}
    >
      {/* Hero */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-[#004c97]">
          CAEd — Coordenadoria de Ações Educacionais (UFSM)
        </h1>
        <p className="mt-3 max-w-3xl">
          A CAEd, vinculada à PROGRAD/UFSM, desenvolve ações de apoio ao ensino com foco em
          <strong className="text-[#004c97]"> acessibilidade</strong>,{" "}
          <strong className="text-[#004c97]">ações afirmativas</strong> e{" "}
          <strong className="text-[#004c97]">apoio à aprendizagem</strong>, favorecendo o acesso, a permanência e o sucesso acadêmico.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={copyEmail}
            className="rounded-lg bg-[#004c97] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003870] focus:outline-none focus:ring-2 focus:ring-[#004c97] focus:ring-offset-2"
            aria-live="polite"
          >
            {copied ? 'E-mail copiado!' : `Copiar e-mail: ${email}`}
          </button>
          <Link
            href="https://www.ufsm.br/pro-reitorias/prograd/caed/"
            target="_blank"
            className="rounded-lg border border-[#004c97] px-4 py-2 text-sm font-medium text-[#004c97] transition hover:bg-[#004c97] hover:text-white"
          >
            Site oficial do CAEd
          </Link>
        </div>
      </header>

      {/* O que faz */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-[#004c97]">O que o CAEd faz</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Atendimentos e orientações em <strong className="text-[#004c97]">acessibilidade</strong> (acadêmica e comunicacional).</li>
          <li>Coordenação e acompanhamento de <strong className="text-[#004c97]">ações afirmativas</strong> (sociais, étnico-raciais e indígenas).</li>
          <li><strong className="text-[#004c97]">Apoio à aprendizagem</strong> com ações pedagógicas e monitorias temáticas.</li>
          <li>Produção de <strong className="text-[#004c97]">materiais acessíveis</strong> (ex.: descrição/audiodescrição, transcrição em Braille).</li>
          <li>Gestão de demandas de <strong className="text-[#004c97]">Tradução/Interpretação em Libras</strong> (TILSP).</li>
        </ul>
      </section>

      {/* Áreas */}
      <section className="mb-10 grid gap-6 md:grid-cols-2">
        {[
          {
            title: 'Acessibilidade',
            desc:
              'Acolhimento e avaliação de demandas para estudantes com deficiência, surdez, TEA e Altas Habilidades/Superdotação, incluindo TILSP.',
          },
          {
            title: 'Ações Afirmativas',
            desc:
              'Acompanha políticas e iniciativas de acesso, permanência e aprendizagem nas dimensões social, étnico-racial e indígena.',
          },
          {
            title: 'Apoio à Aprendizagem',
            desc:
              'Desenvolve ações pedagógicas e monitorias conforme demandas acadêmicas para melhorar o desempenho estudantil.',
          },
          {
            title: 'Educação–Saúde',
            desc:
              'Atendimentos especializados (ex.: Educação Especial, Fonoaudiologia, Terapia Ocupacional), conforme necessidade.',
          },
        ].map((c) => (
          <article
            key={c.title}
            className="rounded-2xl border border-[#004c97]/20 bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-[#004c97]">{c.title}</h3>
            <p className="mt-2">{c.desc}</p>
          </article>
        ))}
      </section>

      {/* Contatos rápidos */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-[#004c97]">Contatos</h2>
        <div className="mt-3 grid gap-4 rounded-2xl border border-[#004c97]/20 bg-white p-5 shadow-sm">
          <p>
            <strong>Secretaria / Geral:</strong>{' '}
            <a className="underline text-[#004c97]" href={`mailto:${email}`}>
              {email}
            </a>
          </p>
          <p>
            <strong>Acessibilidade:</strong>{' '}
            <a className="underline text-[#004c97]" href="mailto:caed.acessibilidade@ufsm.br">
              caed.acessibilidade@ufsm.br
            </a>
          </p>
          <p>
            <strong>Ações Afirmativas:</strong>{' '}
            <a className="underline text-[#004c97]" href="mailto:caed.acoesafirmativas@ufsm.br">
              caed.acoesafirmativas@ufsm.br
            </a>
          </p>
          <p>
            <strong>Apoio à Aprendizagem:</strong>{' '}
            <a className="underline text-[#004c97]" href="mailto:caed.aprendizagem@ufsm.br">
              caed.aprendizagem@ufsm.br
            </a>
          </p>
          <p>
            <strong>Educação–Saúde:</strong>{' '}
            <a className="underline text-[#004c97]" href="mailto:caedsaude@ufsm.br">
              caedsaude@ufsm.br
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Para telefones/horários atualizados, confira os{' '}
            <Link
              href="https://www.ufsm.br/pro-reitorias/prograd/caed/contatos"
              target="_blank"
              className="underline text-[#004c97]"
            >
              contatos oficiais
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Links úteis */}
      <section>
        <h2 className="text-xl font-semibold text-[#004c97]">Links úteis</h2>
        <ul className="mt-3 space-y-2">
          <li>
            <Link
              href="https://www.ufsm.br/pro-reitorias/prograd/caed/sobre-a-caed"
              target="_blank"
              className="text-[#004c97] underline"
            >
              Sobre a CAEd
            </Link>
          </li>
          <li>
            <Link
              href="https://www.ufsm.br/pro-reitorias/prograd/caed/servicos"
              target="_blank"
              className="text-[#004c97] underline"
            >
              Serviços
            </Link>
          </li>
          <li>
            <Link
              href="https://www.ufsm.br/pro-reitorias/prograd/caed/projetos"
              target="_blank"
              className="text-[#004c97] underline"
            >
              Projetos
            </Link>
          </li>
          <li>
            <Link
              href="https://www.ufsm.br/pro-reitorias/prograd/caed/contatos"
              target="_blank"
              className="text-[#004c97] underline"
            >
              Contatos
            </Link>
          </li>
        </ul>
      </section>
    </section>
  );
}
