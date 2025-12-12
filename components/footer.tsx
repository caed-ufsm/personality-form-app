// components/footer.tsx
import React from "react";

type ContactLine = { label: string };

export default function Footer({ className = "" }: { className?: string }) {
  const address: ContactLine[] = [
    { label: "Av. Roraima nº 1000" },
    { label: "Prédio 67 – Cidade Universitária" },
    { label: "Bairro Camobi" },
    { label: "Santa Maria – RS" },
    { label: "CEP: 97105-900" },
  ];

  const contact: ContactLine[] = [
    { label: "Telefone: +55 (55) 3220-9622" },
    { label: "E-mail: equipeedusaudecaed@ufsm.br" },
  ];

  return (
    <footer className={`mt-16 bg-[#004c97] text-white ${className}`}>
      {/* CONTEÚDO PRINCIPAL */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2">
          {/* INSTITUCIONAL */}
          <div>
            <h4 className="mb-3 text-base font-semibold">
              COORDENADORIA DE AÇÕES EDUCACIONAIS – CAEd / PROGRAD
            </h4>

            <ul className="space-y-1 text-sm text-white/90">
              {address.map((item, i) => (
                <li key={i}>{item.label}</li>
              ))}
            </ul>
          </div>

          {/* CONTATO */}
          <div>
            <h4 className="mb-3 text-base font-semibold">
              Contato e Informações
            </h4>

            <ul className="space-y-1 text-sm text-white/90">
              {contact.map((item, i) => (
                <li key={i}>{item.label}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* DIVISOR */}
        <div className="my-8 h-px w-full bg-white/20" />

        {/* CRÉDITOS */}
        <div className="max-w-5xl text-sm text-white/85">
          <ul className="space-y-2 leading-relaxed">
            <li>
              <strong>Psicólogo Renato Favarin dos Santos:</strong> Desenvolvimento e condução técnica do conteúdo.
            </li>
            <li>
              <strong>Psicóloga Ana Júlia Vicentini:</strong> Desenvolvimento e apoio técnico no projeto.
            </li>
            <li>
              <strong>Dante Dardaque Santos (Estudante) :</strong> Desenvolvimento de software e implementação da aplicação.
            </li>
          </ul>
        </div>


      </section>

      {/* BARRA INFERIOR */}
      <div className="bg-[#003a74]">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-white/80 sm:px-8 lg:px-10">
          © {new Date().getFullYear()} UFSM • CAEd / PROGRAD — Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
}
