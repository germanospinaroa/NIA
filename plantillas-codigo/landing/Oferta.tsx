'use client';

// KIT DE LANDING — §6 OFERTA (blueprint: 55 §6 · mecánica: 02C · estructura: 19 §6)
// Reglas embebidas: el ANUAL va PRIMERO en el DOM (recomendado, mobile arriba) ·
// badge de trial en AMBAS cards SOLO si trialDias existe (02C decide N; sin
// esquema de trial NO se pinta — prohibido inventarlo) · total anual SIEMPRE
// visible ("Se cobra $X/año") · ahorro en MESES, no en % · hairline degradada en
// la card recomendada (el uso canónico de la técnica) · checkmarks custom.
// El destino de los CTAs sigue al MODELO de 02C (checkout vs /onboarding).

import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { CheckCustom, CtaButton, Hairline, Kicker, SectionShell, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy, warnCopy, warnRango } from './MarkedCopy';

export interface PlanOferta {
  nombre: string;
  /** Solo la cifra $/mes ("$4.99") — display 36px tabular-nums. */
  precioMes: string;
  sufijo?: string;
  /** Descomposición por día ("menos de $0.17 al día") — 13px bajo el precio. */
  descomposicionDia?: string;
  ctaLabel: string;
  ctaHref: string;
  /** 4-6 features en lenguaje de RESULTADO, máx 12 palabras c/u. */
  features: string[];
}

export interface OfertaProps {
  kicker?: string;
  /** Copy MARCADO del título (máx 8 palabras). */
  tituloMarked: string;
  /** N días de trial según 02C/ESTADO.md. undefined = esquema SIN trial → sin badge. */
  trialDias?: number;
  /** El plan ANUAL — recomendado, primero en el DOM. */
  anual: PlanOferta & {
    /** "Se cobra $X/año" — OBLIGATORIO: el total nunca se esconde (52 §2). */
    totalAnual: string;
    /** Ahorro en meses ("2 meses gratis") — el elemento más ruidoso tras el CTA. */
    ahorro: string;
    badge?: string;
  };
  mensual: PlanOferta;
  /** Stack de valor Hormozi opcional — total TACHADO del stack, jamás precio falso. */
  stack?: {
    lineas: { resultado: string; valor: string }[];
    totalTachado: string;
    nota?: string;
  };
  /** default 'oferta' — lo observa StickyCtaMobile. */
  id?: string;
}

function TrialBadge({ dias }: { dias: number }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--accent)_13%,transparent)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent)]">
      <Star size={12} strokeWidth={2.5} aria-hidden="true" />
      {dias} días gratis
    </span>
  );
}

function Precio({ plan }: { plan: PlanOferta }) {
  return (
    <div>
      <p className="flex items-baseline gap-1">
        <span className="text-[36px] font-bold leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
          {plan.precioMes}
        </span>
        <span className="text-[14px] text-[var(--text-secondary)]">{plan.sufijo ?? '/mes'}</span>
      </p>
      {plan.descomposicionDia && (
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">{plan.descomposicionDia}</p>
      )}
    </div>
  );
}

function Features({ items, origen }: { items: string[]; origen: string }) {
  warnRango(`${origen} → features`, items.length, 4, 6);
  items.forEach((f, i) => warnCopy(`${origen} → feature ${i + 1}`, f, 12));
  return (
    <ul className="mt-5 flex flex-col gap-3">
      {items.map((f, i) => (
        <li key={i} className="flex items-start gap-3 text-[15px] leading-snug text-[var(--text-primary)]">
          <CheckCustom />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

export function Oferta({
  kicker = 'LA OFERTA',
  tituloMarked,
  trialDias,
  anual,
  mensual,
  stack,
  id = 'oferta',
}: OfertaProps) {
  warnCopy('Oferta → título', tituloMarked, 8);
  const { contenedor, item } = useReveal();

  return (
    <SectionShell id={id} elevacion="base" ariaLabel="Planes y precios">
      <motion.div variants={contenedor} initial="hidden" whileInView="visible" viewport={VIEWPORT_ONCE}>
        <motion.div variants={item} className="mx-auto max-w-[620px] text-center">
          <Kicker>{kicker}</Kicker>
          <h2 className="text-balance text-[30px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[40px]">
            <MarkedCopy text={tituloMarked} />
          </h2>
        </motion.div>

        {/* Stack de valor Hormozi — ARRIBA de los planes; el tachado es del TOTAL
            del stack (nunca un precio mensual falso inflado — 50 C5) */}
        {stack && (
          <motion.div
            variants={item}
            className="mx-auto mt-8 max-w-[560px] rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] p-6"
          >
            <ul className="flex flex-col gap-3">
              {stack.lineas.map((l, i) => (
                <li key={i} className="flex items-start justify-between gap-4 text-[15px]">
                  <span className="flex items-start gap-3 text-[var(--text-primary)]">
                    <CheckCustom />
                    <span>{l.resultado}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--text-secondary)]">{l.valor}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] pt-4 text-right">
              <p className="text-[14px] text-[var(--text-secondary)]">
                Valor total: <span className="tabular-nums line-through">{stack.totalTachado}</span>
              </p>
              {stack.nota && (
                <p className="mt-1 text-[16px] font-semibold text-[var(--text-primary)]">{stack.nota}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Cards: ANUAL PRIMERO en el DOM — en mobile apilado arriba, nunca scroll horizontal */}
        <div className="mx-auto mt-10 grid max-w-[880px] grid-cols-1 items-start gap-6 md:grid-cols-2">
          {/* ── ANUAL (recomendado): hairline 2px + fondo acento sutil + sombra tintada ── */}
          <motion.div variants={item} className="relative md:-translate-y-2">
            {anual.badge && (
              <span className="absolute -top-[10px] left-1/2 z-10 -translate-x-1/2 rounded-full border border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--accent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--bg)]">
                {anual.badge}
              </span>
            )}
            <Hairline emphasis surface="surface" className="shadow-[0_12px_36px_color-mix(in_oklab,var(--accent)_16%,transparent)]">
              <div className="rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--accent)_5%,transparent)] p-6 md:p-7">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">{anual.nombre}</h3>
                  {trialDias !== undefined && <TrialBadge dias={trialDias} />}
                </div>
                <div className="mt-4">
                  <Precio plan={anual} />
                  {/* El total anual SIEMPRE visible — regla de oro de 02C */}
                  <p className="mt-1 text-[12px] text-[var(--text-secondary)]">{anual.totalAnual}</p>
                  <p className="mt-2 text-[15px] font-semibold text-[var(--accent)]">{anual.ahorro}</p>
                </div>
                <Features items={anual.features} origen="Oferta → anual" />
                <div className="mt-6">
                  <CtaButton href={anual.ctaHref} fullMobile>
                    {anual.ctaLabel}
                  </CtaButton>
                </div>
              </div>
            </Hairline>
          </motion.div>

          {/* ── MENSUAL: card base, CTA outline — menos peso visual ── */}
          <motion.div
            variants={item}
            className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)] bg-[var(--surface)] p-6 shadow-[var(--shadow-1)] md:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">{mensual.nombre}</h3>
              {trialDias !== undefined && <TrialBadge dias={trialDias} />}
            </div>
            <div className="mt-4">
              <Precio plan={mensual} />
            </div>
            <Features items={mensual.features} origen="Oferta → mensual" />
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={mensual.ctaHref}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_45%,transparent)] text-[16px] font-semibold text-[var(--accent)] transition-colors duration-150 hover:bg-[var(--chip-bg)] [touch-action:manipulation]"
            >
              {mensual.ctaLabel}
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </SectionShell>
  );
}
