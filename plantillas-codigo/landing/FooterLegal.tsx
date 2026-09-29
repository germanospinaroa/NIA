// KIT DE LANDING — §10 FOOTER LEGAL (blueprint: 55 §10)
// 2 filas máximo: enlaces legales arriba, copyright + soporte abajo. Jerarquía
// terciaria total: cero acento, cero botones — el footer NUNCA compite con el
// CTA final. Cada enlace con área táctil ≥44px. REGLA DURA (19 §10): todos los
// enlaces apuntan a páginas que EXISTEN (contenido con 47) — la landing no está
// lista con enlaces muertos. El contraste del texto terciario debe medir ≥4.5:1
// sobre --bg (se verifica al tematizar tokens.css).
// Server component: sin hooks ni motion — no necesita 'use client'.

import type { ReactNode } from 'react';

export interface EnlaceLegal {
  label: string;
  /** Página EXISTENTE — nunca "#" ni rutas muertas. */
  href: string;
}

export interface FooterLegalProps {
  appName: string;
  logo?: ReactNode;
  /** Privacidad · Términos · Reembolsos · Aviso de IA (si aplica) — con 47. */
  enlaces: EnlaceLegal[];
  /** Email REAL que alguien lee. */
  soporteEmail: string;
  anio?: number;
}

export function FooterLegal({ appName, logo, enlaces, soporteEmail, anio }: FooterLegalProps) {
  const year = anio ?? new Date().getFullYear();
  return (
    <footer className="py-8 md:py-12">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        {/* Fila 1: marca chica + enlaces legales */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-secondary)]">
            {logo ?? <span aria-hidden="true" className="size-5 rounded-[6px] bg-[var(--text-tertiary)]" />}
            {appName}
          </p>
          <nav aria-label="Enlaces legales">
            <ul className="flex flex-wrap items-center gap-x-1 gap-y-0">
              {enlaces.map((e, i) => (
                <li key={e.href} className="flex items-center">
                  {i > 0 && (
                    <span aria-hidden="true" className="px-1 text-[var(--text-tertiary)]">
                      ·
                    </span>
                  )}
                  {/* py-3 = área táctil ≥44px sin líneas pegadas */}
                  <a
                    href={e.href}
                    className="px-1 py-3 text-[13px] text-[var(--text-tertiary)] underline-offset-4 hover:text-[var(--text-secondary)] hover:underline"
                  >
                    {e.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Fila 2: copyright + soporte */}
        <p className="mt-3 text-[13px] text-[var(--text-tertiary)]">
          © {year} {appName} ·{' '}
          <a href={`mailto:${soporteEmail}`} className="py-3 underline-offset-4 hover:underline">
            {soporteEmail}
          </a>
        </p>
      </div>
    </footer>
  );
}
