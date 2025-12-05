'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

type NavItem = { label: string; href: string };
type CTA = { label: string; href: string };

export type HeaderProps = {
  brand?: { name: string; href?: string; logoSrc?: string };
  items?: NavItem[];
  cta?: CTA;
  className?: string;
};

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function Header({
  brand = { name: 'Programa de Autoconhecimento Aplicado à Docência na UFSM', href: '/', logoSrc: '' },
  items = [
    { label: 'Home', href: '/' },
    { label: 'Formulários', href: '/forms' },
    { label: 'Sobre', href: '/about' },
    { label: 'Participar', href: '/participar' }, 
  ],
  cta,
  className = '',
}: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 bg-[#004c97] text-white shadow-md ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">

        {/* HEADER MAIS ALTA (ESTILO HERO INSTITUCIONAL) */}
        <nav className="flex h-[132px] items-center justify-between" aria-label="Principal">
          
          {/* Brand */}
          <div className="flex items-center gap-4">
            {brand.logoSrc && (
              <Image
                src={brand.logoSrc}
                alt={brand.name}
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
            )}

            {/* TÍTULO RESPONSIVO AJUSTADO */}
            <Link
              href={brand.href ?? '/'}
              className="
                text-xl        /* mobile */
                sm:text-2xl    /* tablets */
                md:text-3xl    /* desktop */
                font-bold tracking-tight leading-tight 
                hover:text-white/80 transition
              "
            >
              {brand.name}
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:gap-10">
            <ul className="flex items-center gap-2">
              {items.map(({ label, href }) => {
                const active = isActivePath(pathname ?? '/', href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`rounded-lg px-4 py-3 text-lg font-medium transition ${
                        active ? 'bg-white/25' : 'hover:bg-white/15'
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {cta && (
              <Link
                href={cta.href}
                className="ml-4 inline-flex items-center rounded-lg bg-white px-5 py-3 text-lg font-semibold text-[#004c97] shadow hover:bg-gray-100 transition"
              >
                {cta.label}
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-controls="mobile-menu"
              aria-expanded={open}
              className="inline-flex items-center justify-center rounded-md p-3 text-white hover:bg-white/10 transition"
            >
              <span className="sr-only">Abrir menu</span>
              {open ? (
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile nav */}
      <div
        id="mobile-menu"
        className={`md:hidden transition-all duration-300 ${
          open ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="space-y-2 px-6 pb-6 pt-4">
          {items.map(({ label, href }) => {
            const active = isActivePath(pathname ?? '/', href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-4 py-3 text-lg font-medium text-white transition ${
                  active ? 'bg-white/25' : 'hover:bg-white/15'
                }`}
              >
                {label}
              </Link>
            );
          })}

          {cta && (
            <Link
              href={cta.href}
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-lg bg-white px-5 py-3 text-lg font-semibold text-[#004c97] text-center shadow hover:bg-gray-100 transition"
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
