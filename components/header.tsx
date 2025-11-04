'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useMemo } from 'react';
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
  brand = { name: 'Programa de Autoconhecimento Docente — CAEd', href: '/', logoSrc: '' },
  items = [
    { label: 'Home', href: '/' },
    { label: 'Formulários', href: '/forms' },
    { label: 'Sobre', href: '/about' },
  ],
  cta,
  className = '',
}: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useMemo(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 bg-[#004c97] text-white ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        {/* altura maior: h-28 */}
        <nav className="flex h-28 items-center justify-between" aria-label="Principal">
          {/* Brand + Logo */}
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
            <Link
              href={brand.href ?? '/'}
              className="text-3xl font-bold tracking-tight hover:text-gray-200"
            >
              {brand.name}
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:gap-10">
            <ul className="flex items-center gap-6">
              {items.map(({ label, href }) => {
                const active = isActivePath(pathname ?? '/', href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`rounded px-5 py-3 text-lg font-medium transition-colors ${
                        active ? 'bg-white/20' : 'hover:bg-white/10'
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
                className="ml-6 inline-flex items-center rounded-lg bg-white px-5 py-3 text-lg font-semibold text-[#004c97] shadow-sm hover:bg-gray-100"
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
              className="inline-flex items-center justify-center rounded-md p-3 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
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

      {/* Mobile nav: só os links */}
      <div id="mobile-menu" className={`md:hidden ${open ? 'block' : 'hidden'}`}>
        <div className="space-y-2 px-6 pb-6 pt-4">
          {items.map(({ label, href }) => {
            const active = isActivePath(pathname ?? '/', href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`block rounded px-4 py-3 text-lg font-medium text-white transition-colors ${
                  active ? 'bg-white/20' : 'hover:bg-white/10'
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
              className="mt-4 block rounded-lg bg-white px-5 py-3 text-lg font-semibold text-[#004c97] text-center hover:bg-gray-100"
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
