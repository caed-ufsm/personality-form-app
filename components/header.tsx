'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type NavItem = { label: string; href: string };
type CTA = { label: string; href: string };

export type HeaderProps = {
  brand?: { name: string; href?: string };
  items?: NavItem[];
  cta?: CTA;
  className?: string;
};

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function Header({
  brand = { 
    name: 'Programa de Autoconhecimento Aplicado à Docência na UFSM', 
    href: '/' 
  },
  items = [
    { label: 'Home', href: '/' },
    { label: 'Formulários', href: '/forms' },
    { label: 'Sobre', href: '/about' },
    { label: 'Grupos de Reflexão (em breve)', href: '/participar' },
  ],
  cta,
  className = '',
}: HeaderProps) {

  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`
        sticky top-0 z-50
        bg-[#004c97] text-white
        shadow-lg backdrop-blur-sm
        ${className}
      `}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">

        {/* HEADER MAIS ALTA COM MELHOR ENCAIXE */}
        <nav className="flex h-[160px] items-center justify-between" aria-label="Principal">
          
          {/* BRAND — TITULO CENTRALIZADO VERTICALMENTE E MAIS LEGÍVEL */}
          <div className="flex items-center">
            <Link
              href={brand.href ?? '/'}
              className="
                font-bold tracking-tight text-white
                leading-tight
                text-xl sm:text-2xl md:text-3xl lg:text-4xl
                max-w-[520px]
                hover:text-white/80
                transition
              "
              style={{
                lineHeight: '1.15',
              }}
            >
              {brand.name}
            </Link>
          </div>

          {/* NAV DESKTOP */}
          <div className="hidden md:flex items-center gap-8">

            {/* LINKS */}
            <ul className="flex items-center gap-3">
              {items.map(({ label, href }) => {
                const active = isActivePath(pathname ?? '/', href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`
                        rounded-lg px-4 py-2.5 text-lg font-medium
                        transition
                        ${active ? 'bg-white/25' : 'hover:bg-white/15'}
                      `}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* CTA */}
            {cta && (
              <Link
                href={cta.href}
                className="
                  inline-flex items-center
                  rounded-lg bg-white px-5 py-3
                  text-lg font-semibold text-[#004c97]
                  shadow-md hover:bg-gray-100 transition
                "
              >
                {cta.label}
              </Link>
            )}
          </div>

          {/* BOTÃO MOBILE */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-controls="mobile-menu"
            aria-expanded={open}
            className="md:hidden rounded-md p-3 hover:bg-white/10 transition"
          >
            {open ? (
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </nav>
      </div>

      {/* MOBILE MENU */}
      <div
        id="mobile-menu"
        className={`
          md:hidden overflow-hidden transition-all duration-300
          ${open ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="space-y-2 px-6 pb-6 pt-4">
          {items.map(({ label, href }) => {
            const active = isActivePath(pathname ?? '/', href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`
                  block rounded-lg px-4 py-3 text-lg font-medium
                  ${active ? 'bg-white/25' : 'hover:bg-white/15'}
                `}
              >
                {label}
              </Link>
            );
          })}

          {cta && (
            <Link
              href={cta.href}
              onClick={() => setOpen(false)}
              className="
                block mt-3 text-center
                rounded-lg bg-white px-5 py-3
                text-lg font-semibold text-[#004c97]
                shadow hover:bg-gray-100 transition
              "
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
