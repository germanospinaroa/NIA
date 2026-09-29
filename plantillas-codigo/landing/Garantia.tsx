'use client';

// KIT DE LANDING — §7 GARANTÍA (blueprint: 55 §7)
// Franja propia compacta (48-64px) bajo la oferta — NO una línea perdida.
// Escudo SVG en chip 60px (jamás emoji), nombre PROPIO de la garantía en acento,
// condición máx 3 líneas (warn a las 30 palabras), piso Hotmart con candado SVG.
// Nunca placeholders ("garantía visible"): se nombra la política concreta o la
// sección no se monta (52 §5). El plazo = el configurado en Hotmart (19 §7).

import { motion } from 'motion/react';
import { Lock, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Accent, Hairline, SectionShell, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy, warnCopy } from './MarkedCopy';

export interface GarantiaProps {
  /** Nombre PROPIO ("la Garantía del Primer Día Claro") — se pinta en acento. */
  nombre: string;
  /** Copy MARCADO de la condición — máx 3 líneas (~30 palabras, warn). */
  condicionMarked: string;
  /** Piso legal verificable ("Respaldada por la garantía Hotmart de 7 días"). */
  pisoLegal?: string;
  /** default ShieldCheck (Lucide) — siempre SVG. */
  icon?: LucideIcon;
  id?: string;
}

export function Garantia({ nombre, condicionMarked, pisoLegal, icon: Icono = ShieldCheck, id }: GarantiaProps) {
  warnCopy('Garantía → condición', condicionMarked, 30);
  const { contenedor, item } = useReveal();

  return (
    <SectionShell id={id} elevacion="elevada" compacta ariaLabel="Garantía">
      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mx-auto max-w-[560px]"
      >
        <motion.div variants={item}>
          {/* La card de garantía: uno de los 1-3 usos de hairline permitidos por vista */}
          <Hairline surface="surface" className="shadow-[var(--shadow-1)]">
            <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
              <span
                aria-hidden="true"
                className="flex size-15 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
              >
                <Icono size={32} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
              </span>
              <h2 className="text-balance text-[22px] font-bold leading-tight [font-family:var(--font-display)]">
                <Accent>{nombre}</Accent>
              </h2>
              <p className="max-w-[44ch] text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                <MarkedCopy text={condicionMarked} />
              </p>
              {pisoLegal && (
                <p className="flex items-center gap-1.5 text-[13px] text-[var(--text-tertiary)]">
                  <Lock size={14} aria-hidden="true" />
                  {pisoLegal}
                </p>
              )}
            </div>
          </Hairline>
        </motion.div>
      </motion.div>
    </SectionShell>
  );
}
