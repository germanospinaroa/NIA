'use client';

// KIT DE LANDING — §9 CTA FINAL EMOCIONAL + PS (blueprint: 55 §9)
// El bloque de MÁXIMO contraste de la página: fondo INVERTIDO (usa
// --text-primary como fondo y --bg como texto), sin nav ni distracciones.
// H2 emocional ≤8 palabras (warn) · future pacing 1-2 líneas en presente y 2ª
// persona · CTA ≥56px con el MISMO verbo del hero (42) · recap riesgo/urgencia
// SOLO con datos reales · PS estilo carta (borde izquierdo en acento) — el
// segundo texto más leído de la página (19 §9). Nada se interpone entre el PS
// y el footer.

import { motion } from 'motion/react';
import { CtaButton, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy, warnCopy } from './MarkedCopy';

export interface CtaFinalProps {
  /** Copy MARCADO — headline emocional, máx 8 palabras (warn). */
  h2Marked: string;
  /** Copy MARCADO — future pacing 1-2 líneas, presente, 2ª persona (warn a 24). */
  futurePacingMarked: string;
  /** MISMO texto y verbo del CTA héroe (42). */
  ctaLabel: string;
  ctaHref: string;
  /** Recap riesgo/urgencia bajo el CTA — cupo SOLO si es real (19). */
  recap?: string;
  /** El PS de la oferta Hormozi — máx 4 líneas (~55 palabras, warn). */
  psMarked?: string;
  /** default 'cta-final' — lo observa StickyCtaMobile para ocultarse. */
  id?: string;
}

export function CtaFinal({
  h2Marked,
  futurePacingMarked,
  ctaLabel,
  ctaHref,
  recap,
  psMarked,
  id = 'cta-final',
}: CtaFinalProps) {
  warnCopy('CtaFinal → h2', h2Marked, 8);
  warnCopy('CtaFinal → future pacing', futurePacingMarked, 24);
  if (psMarked !== undefined) warnCopy('CtaFinal → PS', psMarked, 55);
  const { contenedor, item } = useReveal();

  return (
    <section
      id={id}
      aria-label="Empieza hoy"
      className="relative overflow-hidden py-20 md:py-24"
      style={{ background: 'var(--text-primary)' }}
    >
      {/* Profundidad también en el bloque invertido: radial sutil del acento */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(720px 420px at 50% 0%, color-mix(in oklab, var(--accent) 16%, transparent) 0%, transparent 60%)',
        }}
      />

      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="relative mx-auto flex max-w-[680px] flex-col items-center px-5 text-center"
      >
        <motion.h2
          variants={item}
          className="text-balance text-[30px] font-bold leading-[1.15] [font-family:var(--font-display)] md:text-[44px]"
          style={{ color: 'var(--bg)' }}
        >
          <MarkedCopy text={h2Marked} />
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-4 max-w-[520px] text-[17px] leading-relaxed"
          style={{ color: 'color-mix(in oklab, var(--bg) 78%, transparent)' }}
        >
          <MarkedCopy text={futurePacingMarked} />
        </motion.p>

        <motion.div variants={item} className="mt-8 w-full sm:w-auto">
          {/* Acento pleno sobre fondo invertido = el máximo contraste de la página */}
          <CtaButton href={ctaHref} alto={56}>
            {ctaLabel}
          </CtaButton>
        </motion.div>

        {recap && (
          <motion.p
            variants={item}
            className="mt-3 text-[13px]"
            style={{ color: 'color-mix(in oklab, var(--bg) 65%, transparent)' }}
          >
            {recap}
          </motion.p>
        )}

        {psMarked !== undefined && (
          <motion.p
            variants={item}
            className="mt-10 max-w-[520px] border-l-2 pl-4 text-left text-[15px] italic leading-[1.6]"
            style={{
              borderColor: 'var(--accent)',
              color: 'color-mix(in oklab, var(--bg) 80%, transparent)',
            }}
          >
            <MarkedCopy text={psMarked} />
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
