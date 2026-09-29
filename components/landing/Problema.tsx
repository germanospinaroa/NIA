'use client';

// KIT DE LANDING — §2 PROBLEMA (blueprint: 55 §2)
// 3-5 PREGUNTAS que hacen asentir, apiladas — NUNCA párrafo corrido. Cada una con
// su ícono de dolor SVG en IconChip tone="muted" (neutro apagado: los checks son
// de la solución, no del problema). Máx 12 palabras por card (warn). Fondo
// ELEVADO: abre el bloque problema+agitación (un solo movimiento visual, T1).

import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { IconChip, SectionShell, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy, warnCopy, warnRango } from './MarkedCopy';

export interface PreguntaProblema {
  /** Ícono de dolor de Lucide (Inbox, AlarmClock, Repeat…) — jamás emoji. */
  icon: LucideIcon;
  /** Copy MARCADO — pregunta directa al lector, máx 12 palabras. */
  textoMarked: string;
}

export interface ProblemaProps {
  /** Título opcional ("¿Te suena?") — o entrar directo a la primera pregunta. */
  titulo?: string;
  /** 3-5 preguntas, cada una trazada a un dolor de FICHA-AVATAR.md. */
  preguntas: PreguntaProblema[];
  id?: string;
}

export function Problema({ titulo, preguntas, id }: ProblemaProps) {
  warnRango('Problema → preguntas', preguntas.length, 3, 5);
  preguntas.forEach((p, i) => warnCopy(`Problema → pregunta ${i + 1}`, p.textoMarked, 12));
  const { contenedor, item } = useReveal();

  return (
    <SectionShell id={id} elevacion="elevada" flush="bottom" ariaLabel="El problema">
      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mx-auto max-w-[620px]"
      >
        {titulo && (
          <motion.h2
            variants={item}
            className="mb-8 text-balance text-[30px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[40px]"
          >
            {titulo}
          </motion.h2>
        )}
        <ul className="flex flex-col gap-4">
          {preguntas.map((p, i) => (
            <motion.li
              key={i}
              variants={item}
              className="flex items-start gap-4 rounded-[var(--radius-card)] bg-[var(--bg)] p-4 shadow-[var(--shadow-1)]"
            >
              <IconChip icon={p.icon} tone="muted" />
              <p className="pt-2 text-[17px] font-medium leading-snug text-[var(--text-primary)]">
                <MarkedCopy text={p.textoMarked} />
              </p>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </SectionShell>
  );
}
