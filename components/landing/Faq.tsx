'use client';

// KIT DE LANDING — §8 FAQ (blueprint: 55 §8)
// Acordeón ACCESIBLE: button real + aria-expanded + aria-controls, fila táctil
// completa ≥56px, chevron SVG que rota 180° (200ms), UNO abierto a la vez, el
// primero abierto por defecto (la objeción #1). Las 4-6 preguntas SON las
// objeciones de FICHA-AVATAR.md (19 §8) — no soporte. Respuestas cortas (warn
// a las 40 palabras). Expand animado por altura, reduced-motion respetado.

import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Kicker, SectionShell, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy, warnCopy, warnRango } from './MarkedCopy';

export interface ItemFaq {
  /** Una objeción REAL de la ficha, en pregunta. */
  pregunta: string;
  /** Copy MARCADO — corta y honesta, cierra reduciendo riesgo (máx 40 palabras). */
  respuestaMarked: string;
}

export interface FaqProps {
  kicker?: string;
  titulo?: string;
  /** 4-6 ítems = las objeciones de la ficha en su orden de fuerza. */
  items: ItemFaq[];
  /** Índice abierto al cargar — default 0 (la objeción #1). null = todo cerrado. */
  abiertoInicial?: number | null;
  id?: string;
}

export function Faq({ kicker = 'PREGUNTAS', titulo = 'Lo que quizá te estás preguntando', items, abiertoInicial = 0, id }: FaqProps) {
  warnRango('FAQ → ítems', items.length, 4, 6);
  items.forEach((it, i) => warnCopy(`FAQ → respuesta ${i + 1}`, it.respuestaMarked, 40));
  const [abierto, setAbierto] = useState<number | null>(abiertoInicial);
  const reduce = useReducedMotion();
  const { contenedor, item } = useReveal();
  const baseId = useId();

  return (
    <SectionShell id={id} elevacion="base" ariaLabel="Preguntas frecuentes">
      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mx-auto max-w-[680px]"
      >
        <motion.div variants={item} className="mb-8">
          <Kicker>{kicker}</Kicker>
          <h2 className="text-balance text-[30px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[40px]">
            {titulo}
          </h2>
        </motion.div>

        <motion.ul variants={item} className="flex flex-col">
          {items.map((it, i) => {
            const estaAbierto = abierto === i;
            const btnId = `${baseId}-faq-btn-${i}`;
            const panelId = `${baseId}-faq-panel-${i}`;
            return (
              <li
                key={i}
                className="border-b border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)]"
              >
                {/* Área táctil = la FILA COMPLETA, ≥56px */}
                <button
                  type="button"
                  id={btnId}
                  aria-expanded={estaAbierto}
                  aria-controls={panelId}
                  onClick={() => setAbierto(estaAbierto ? null : i)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left [touch-action:manipulation]"
                >
                  <span className="text-[16px] font-semibold text-[var(--text-primary)]">{it.pregunta}</span>
                  <ChevronDown
                    size={20}
                    aria-hidden="true"
                    color="var(--text-secondary)"
                    className={`shrink-0 transition-transform duration-200 ease-out ${estaAbierto ? 'rotate-180' : ''}`}
                  />
                </button>
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={false}
                  animate={{ height: estaAbierto ? 'auto' : 0, opacity: estaAbierto ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-9 text-[15px] leading-relaxed text-[var(--text-secondary)]">
                    <MarkedCopy text={it.respuestaMarked} />
                  </p>
                </motion.div>
              </li>
            );
          })}
        </motion.ul>
      </motion.div>
    </SectionShell>
  );
}
