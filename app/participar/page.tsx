// app/grupo/page.tsx

export const metadata = {
  title: 'Programa de Autoconhecimento Docente',
  description:
    'Página institucional com informações sobre a Coordenadoria de Ações Educacionais (CAEd/UFSM).',
};


const icons = {
  oque: (
    <svg
      className="w-6 h-6 text-[#004c97]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1 4v-4m0 0V8m0 4h1M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  ),
  pessoas: (
    <svg
      className="w-6 h-6 text-[#004c97]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.121 17.804A3 3 0 017 17h10a3 3 0 012.879 2.804M15 11a3 3 0 10-6 0z"
      />
    </svg>
  ),
  ingresso: (
    <svg
      className="w-6 h-6 text-[#004c97]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  calendario: (
    <svg
      className="w-6 h-6 text-[#004c97]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12z"
      />
    </svg>
  ),
  privacy: (
    <svg
      className="w-6 h-6 text-[#004c97]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11c1.6 0 3-1.6 3-3.5S13.6 4 12 4 9 5.6 9 7.5 10.4 11 12 11z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.5 21a5.5 5.5 0 10-11 0h11z"
      />
    </svg>
  ),
};

export default function GrupoPage() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-14">
        <p className="text-sm text-slate-500 tracking-wide mb-3">
          Próxima etapa do programa
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#004c97] mb-4">
          Grupos de Reflexão <span className="text-[#004c97]/90">(em breve)</span>
        </h1>

        <p className="text-lg leading-relaxed text-slate-700 max-w-4xl">
          Além dos formulários, queremos oferecer um espaço de troca e reflexão
          guiada, com encontros orientados ao autoconhecimento aplicado à
          docência. Esses encontros serão online e contínuos, coordenados pelo
          psicólogo Renato Favarin dos Santos, permitindo participação sem
          ordem fixa conforme seu interesse.
        </p>
      </section>

      {/* CONTEÚDO */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-3xl md:text-4xl font-bold text-[#004c97] mb-10">
          Sobre o Grupo de Acompanhamento
        </h2>

        <div className="grid gap-8 md:grid-cols-2">
          <Card title="O que é?" icon={icons.oque}>
            <ul className="list-disc pl-6 space-y-1 text-lg leading-relaxed">
              <li>
                Atividade <b>não obrigatória</b> do Programa.
              </li>
              <li>Encontros focados na prática aplicada.</li>
              <li>
                <b>Formato:</b> encontros guiados + materiais.
              </li>
              <li>
                <b>Modalidade:</b> online.
              </li>
            </ul>
          </Card>

          <Card title="Para quem?" icon={icons.pessoas}>
            <ul className="list-disc pl-6 space-y-1 text-lg leading-relaxed">
              <li>Docentes da UFSM que concluíram a etapa dos formulários.</li>
            </ul>
          </Card>

          <Card title="Como participar?" icon={icons.ingresso}>
            <ul className="list-disc pl-6 space-y-1 text-lg leading-relaxed">
              <li>Preencher o formulário de interesse.</li>
              <li>Vagas podem ser limitadas.</li>
            </ul>
          </Card>

          <Card title="Quando?" icon={icons.calendario}>
            <p className="text-lg leading-relaxed">
              <b>Início previsto:</b> 2026/1
            </p>
            <p className="mt-1 text-lg leading-relaxed">
              O cronograma será enviado aos inscritos.
            </p>
          </Card>
        </div>

        {/* PRIVACIDADE */}
        <div className="mt-10">
          <Card title="Privacidade e consentimento" icon={icons.privacy}>
            <p className="text-lg leading-relaxed">
              A participação será <b>voluntária</b> e transparente.
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1 text-lg leading-relaxed">
              <li>Uso dos dados apenas para fins do Programa.</li>
              <li>Compartilhamento restrito à equipe responsável.</li>
              <li>Você poderá desistir a qualquer momento.</li>
            </ul>
          </Card>
        </div>
        {/* SESSÃO DESTACADA — CHAMADA PARA AÇÃO */}
        <section className="mt-20 w-full bg-[#004c97]/5 py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">

            <h2 className="text-4xl font-bold text-[#004c97] mb-4">
              Entrar na lista de interesse
            </h2>

            <p className="text-lg text-slate-700 max-w-2xl mx-auto mb-8 leading-relaxed">
              Preencha rapidamente o formulário para ser avisado(a) quando os grupos de reflexão
              estiverem disponíveis. Isso garante que você receba o cronograma e novidades da próxima etapa.
            </p>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSe0Paabn1t_gqS_H8pSToEvYh8wUTso_nYcQvm8lUxRtFKnSw/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="
        inline-flex items-center gap-2
        px-8 py-4 rounded-xl font-semibold text-white text-lg
        bg-[#004c97] hover:bg-[#003870]
        shadow-lg hover:shadow-xl transition
      "
            >
              Preencher formulário
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </section>

      </section>
    </main>
  );
}

type CardProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function Card({ title, icon, children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[#004c97]/20 bg-white p-8 shadow-sm hover:shadow-md transition ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-2xl font-semibold text-[#004c97]">{title}</h3>
      </div>

      <div className="text-lg leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}
