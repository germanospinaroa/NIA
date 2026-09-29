'use client';

// KIT DE LANDING — §1 HERO (blueprint: 55 §1)
// Reglas embebidas: H1 bold completo con acento vía copy marcado · subtítulo con
// tope duro de 14 palabras (warn + truncado) · CTA vivo ≥52px con sombra tintada ·
// franja de prueba social como slot (SOLO datos reales — 19 §1) · mesh sutil de
// fondo YA incluido · carga inmediata (fade simple, nada que compita con el LCP).

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Camera } from 'lucide-react';
import { CtaButton } from './ui';
import { MarkedCopy, truncarMarcado, warnCopy } from './MarkedCopy';

export interface HeroProps {
  appName: string;
  /** Logo real del proyecto; sin él, marca mínima con el acento. */
  logo?: ReactNode;
  loginHref?: string;
  loginLabel?: string;
  /** Copy MARCADO de docs/copy/landing.md — máx 8-10 palabras, 1-3 en [acento]. */
  h1Marked: string;
  /** Copy MARCADO — máx 14 palabras (52): el kit trunca y avisa si excede. */
  subtitleMarked: string;
  /** 1ª persona + beneficio ("Probar mi primer escaneo") — nunca "Registrarse". */
  ctaLabel: string;
  /** Destino según el MODELO de 02C: checkout Hotmart (M1) u /onboarding (M2). */
  ctaHref: string;
  /** Franja bajo el CTA (posición FIJA de 19 §1). Día 1 sin números: la garantía. */
  socialProof?: ReactNode;
  /** Screenshot real o mini-demo honesto. Sin visual → placeholder honesto (55 §1.3). */
  visual?: ReactNode;
  /** Sugerencia CONCRETA de qué imagen poner en el placeholder — nunca "imagen aquí". */
  visualPlaceholderSugerencia?: string;
  id?: string;
}

export function Hero({
  appName,
  logo,
  loginHref,
  loginLabel = 'Entrar',
  h1Marked,
  subtitleMarked,
  ctaLabel,
  ctaHref,
  socialProof,
  visual,
  visualPlaceholderSugerencia = 'captura de la pantalla principal con datos reales',
  id = 'hero',
}: HeroProps) {
  warnCopy('Hero → h1', h1Marked, 10);
  warnCopy('Hero → subtítulo', subtitleMarked, 14);
  const subtitulo = truncarMarcado(subtitleMarked, 14);

  return (
    <section id={id} className="relative overflow-hidden">
      {/* Fondo con profundidad: mesh/radial sutil del acento — nunca fill plano */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px 480px at 50% -10%, color-mix(in oklab, var(--accent) 8%, transparent) 0%, transparent 60%), ' +
            'radial-gradient(640px 420px at 100% 0%, color-mix(in oklab, var(--accent-2) 6%, transparent) 0%, transparent 55%)',
        }}
      />

      <div className="mx-auto w-full max-w-[1140px] px-5">
        {/* Header 64px: marca a la izquierda, SOLO "Entrar" terciario a la derecha (19) */}
        <header className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-[16px] font-semibold text-[var(--text-primary)]">
            {logo ?? <span aria-hidden="true" className="size-6 rounded-[8px] bg-[var(--accent)]" />}
            {appName}
          </a>
          {loginHref && (
            <a href={loginHref} className="px-2 py-3 text-[14px] font-medium text-[var(--text-tertiary)]">
              {loginLabel}
            </a>
          )}
        </header>

        {/* Carga inmediata: fade simple 300ms — el LCP manda (55 T4) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto flex max-w-[820px] flex-col items-center pt-10 text-center md:pt-16"
        >
          {/* H1: bold completo por defecto; el acento lo pone el [acento] del copy */}
          <h1 className="text-balance text-[40px] font-bold leading-[1.08] tracking-[-0.01em] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[60px]">
            <MarkedCopy text={h1Marked} />
          </h1>

          <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-[var(--text-secondary)] md:text-[18px]">
            <MarkedCopy text={subtitulo} />
          </p>

          <div className="mt-6 w-full sm:w-auto">
            <CtaButton href={ctaHref}>{ctaLabel}</CtaButton>
          </div>

          {/* Franja de prueba social: 8-12px bajo el CTA — SOLO números reales */}
          {socialProof && (
            <div className="mt-3 text-[13px] text-[var(--text-secondary)]">{socialProof}</div>
          )}

          {/* Visual del producto: asoma en el primer viewport e invita al scroll */}
          <div className="mt-10 w-full max-w-[720px]">
            {visual ? (
              <div className="overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_18%,transparent)] shadow-[var(--shadow-2)]">
                {visual}
              </div>
            ) : (
              /* Placeholder HONESTO (55 §1.3): dashed + ratio fijo (CLS 0) + sugerencia.
                 Queda anotado como pendiente en ESTADO.md hasta montar el visual real. */
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[color-mix(in_oklab,var(--accent)_5%,transparent)] px-8">
                <Camera size={20} color="var(--text-secondary)" aria-hidden="true" />
                <p className="max-w-[36ch] text-center text-[14px] font-medium leading-snug text-[var(--text-secondary)]">
                  Sugerencia: {visualPlaceholderSugerencia}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
