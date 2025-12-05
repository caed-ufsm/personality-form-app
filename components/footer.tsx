// components/footer.tsx
import React from "react";
import Link from "next/link";

type SocialLink = { label: string; href: string; icon?: React.ReactNode };
type ContactLine = { label: string; href?: string };

export type FooterProps = {
  orgTitle?: string;
  leftBlock?: { title: string; lines: ContactLine[] };
  centerBlock?: { title: string; lines: ContactLine[] };
  rightBlockLogoSrc?: string;
  socials?: SocialLink[];
  showBackToTop?: boolean;
  className?: string;
};

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="inline-block">
    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" fill="currentColor"/>
  </svg>
);
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="inline-block">
    <path d="M4 6h16v12H4z" fill="currentColor" />
    <path d="M4 6l8 6 8-6" fill="none" stroke="#004c97" strokeWidth="1.5" />
  </svg>
);
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="inline-block">
    <path d="M13 22v-9h3l1-4h-4V7a1 1 0 0 1 1-1h3V2h-3a5 5 0 0 0-5 5v2H6v4h3v9h4z" fill="currentColor"/>
  </svg>
);
const RSSIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="inline-block">
    <path d="M4 11a9 9 0 0 1 9 9h3A12 12 0 0 0 4 8v3zM4 4a16 16 0 0 1 16 16h-3A13 13 0 0 0 4 7V4zm2 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
  </svg>
);

export default function Footer({
  orgTitle = "COORDENADORIA DE AÇÕES EDUCACIONAIS — CAED",
  leftBlock = {
    title: "COORDENADORIA DE AÇÕES EDUCACIONAIS - CAED/PROGRAD",
    lines: [
      { label: "Av. Roraima nº 1000" },
      { label: "Prédio 67" },
      { label: "Cidade Universitária" },
      { label: "Bairro Camobi" },
      { label: "Santa Maria - RS" },
      { label: "CEP: 97105-900" },
    ],
  },
  centerBlock = {
    title: "Contato e Informações",
    lines: [
      { label: "Telefone: +55 (55) 3220-9622" },
      { label: "Email: equipeedusaudecaed@ufsm.br" },

    ],
  },
  socials = [
    { label: "Instagram", href: "https://www.instagram.com/ufsmoficial/", icon: <InstagramIcon /> },
    { label: "E-mail", href: "mailto:caed@ufsm.br", icon: <MailIcon /> },
    { label: "Facebook", href: "https://www.facebook.com/ufsmoficial", icon: <FacebookIcon /> },
    { label: "RSS", href: "https://www.ufsm.br/pro-reitorias/prograd/caed/busca/?area=post&q=&rss=true&sites%5B%5D=391", icon: <RSSIcon /> },
  ],
  rightBlockLogoSrc,
  showBackToTop = true,
  className = "",
}: FooterProps) {
  return (
    <footer className={`mt-16 bg-[#004c97] text-white ${className}`}>

      {/* conteúdo */}
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">

        <div className="my-6 h-px w-full bg-white/20" />

        {/* grid principal */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* left */}
          <div>
            <h4 className="mb-2 font-semibold">{leftBlock.title}</h4>
            <ul className="space-y-1 text-white/90">
              {leftBlock.lines.map((l, i) => (
                <li key={i}>
                  {l.href ? <a href={l.href} className="hover:underline">{l.label}</a> : l.label}
                </li>
              ))}
            </ul>
          </div>

          {/* center */}
          <div className="md:col-span-2"> {/* ★ ocupa 2 colunas no md+ */}
            <h4 className="mb-2 font-semibold">{centerBlock.title}</h4>
            <ul className="text-white/90 md:columns-2 md:gap-6"> {/* ★ divide em 2 colunas */}
              {centerBlock.lines.map((l, i) => (
                <li key={i} className="mb-1 break-inside-avoid"> {/* ★ evita quebra estranha */}
                  {l.href ? <a href={l.href} className="hover:underline">{l.label}</a> : l.label}
                </li>
              ))}
            </ul>
          </div>

          {/* right (logo opcional) */}
          {rightBlockLogoSrc ? (
            <div className="flex items-start md:justify-end md:col-span-3"> {/* ★ joga o logo para a linha de baixo e à direita no md+ */}
              <img src={rightBlockLogoSrc} alt="UFSM" className="h-16 w-auto object-contain opacity-95" />
            </div>
          ) : null}
        </div>
      </div>

      {/* base bar */}
      <div className="bg-[#003a74]">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-white/80 sm:px-8 lg:px-10">
          © {new Date().getFullYear()} UFSM • CAEd/PROGRAD — Todos os direitos reservados.
        </div>
      </div>
      
    </footer>
  );
}
