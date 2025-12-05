// app/grupo/page.tsx
import Link from "next/link";

export default function GrupoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-[#004c97] text-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <p className="text-sm/6 opacity-90">Próxima etapa do programa</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Grupo de Acompanhamento (em breve)
          </h1>
          <p className="mt-4 max-w-2xl text-white/90">
            Além dos formulários, queremos oferecer um espaço de troca e
            reflexão guiada, com encontros e atividades orientadas ao
            autoconhecimento aplicado à docência.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#interesse"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#004c97] shadow-sm hover:bg-white/90"
            >
              Quero participar
            </a>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Ver sobre o projeto
            </Link>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="O que é o grupo?">
            <ul className="list-disc space-y-1 pl-5">
              <li><b>Objetivo:</b> apoiar a aplicação prática do autoconhecimento na docência.</li>
              <li><b>Formato:</b> encontros guiados + materiais/atividades entre encontros.</li>
              <li><b>Modalidade:</b> online e/ou presencial (a definir).</li>
              <li><b>Duração:</b> ciclo curto (ex.: 4–8 semanas) — ajustável.</li>
            </ul>
          </Card>

          <Card title="Para quem é?">
            <ul className="list-disc space-y-1 pl-5">
              <li>Docentes e/ou técnicos envolvidos com atividades de ensino na UFSM.</li>
              <li>Participantes que concluíram a etapa de formulários (preferencial).</li>
              <li>Vagas podem ser <b>limitadas</b> por turma (se necessário).</li>
            </ul>
          </Card>

          <Card title="Como funciona o ingresso?">
            <ul className="list-disc space-y-1 pl-5">
              <li>Inscrição por <b>lista de interesse</b>.</li>
              <li>Se houver muitas inscrições, podemos priorizar por ordem/afinidade com os objetivos.</li>
              <li>Você será contatado(a) por e-mail com orientações quando abrir.</li>
            </ul>
          </Card>

          <Card title="Datas / previsão">
            <p>
              Planejado para a <b>próxima etapa</b> do projeto. Avisaremos com antecedência
              assim que o cronograma e o formato forem definidos.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Sugestão: inserir aqui um “Previsto para: 2026/1” quando tiver uma estimativa.
            </p>
          </Card>

          <Card title="Privacidade e consentimento" className="md:col-span-2">
            <p>
              A participação será <b>voluntária</b>. Informaremos claramente quais dados serão coletados,
              para qual finalidade e por quanto tempo, incluindo um termo de consentimento quando a etapa abrir.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Uso apenas para fins do programa e melhoria das ações educacionais.</li>
              <li>Compartilhamento restrito à equipe responsável, quando aplicável.</li>
              <li>Você poderá desistir a qualquer momento.</li>
            </ul>
          </Card>
        </div>

        {/* Form simples */}
        <div
          id="interesse"
          className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Entrar na lista de interesse
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Preencha para receber um aviso quando a etapa do grupo estiver disponível.
          </p>

          <form className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <label className="text-sm font-medium text-slate-700">Nome</label>
              <input
                type="text"
                placeholder="Seu nome"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#004c97]"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                placeholder="voce@ufsm.br"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#004c97]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Preferência de modalidade (opcional)
              </label>
              <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#004c97]">
                <option value="">Sem preferência</option>
                <option value="online">Online</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" className="mt-1" />
                Concordo em receber contato por e-mail sobre a abertura da próxima etapa.
              </label>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-[#004c97] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
              >
                Enviar interesse
              </button>
            </div>

            <p className="md:col-span-2 text-xs text-slate-500">
              * Ilustração: este formulário ainda não está conectado a um backend.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 text-sm text-slate-700">{children}</div>
    </div>
  );
}
