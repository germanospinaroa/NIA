'use client';

// KIT DE LANDING — §5 LA APP POR DENTRO (blueprint: 55 §5)
// Carrusel de frames de teléfono 9:19.5 con scroll-snap + dots sincronizados
// (IntersectionObserver) + mask-fade lateral (el corte nunca es seco) + CTA
// mid-page con el MISMO verbo del hero (19). Sin screenshot → frame PLACEHOLDER
// gris con el nombre de la pantalla futura (pendiente en ESTADO.md). Los
// screenshots reales los toma la IA al cerrar la app (paso obligatorio de 19 §5).

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CtaButton, Kicker, SectionShell, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy, warnCopy, warnRango } from './MarkedCopy';

export interface FrameCarrusel {
  /** Screenshot REAL a 375px (ratio 9:19.5). Sin src → placeholder honesto. */
  src?: string;
  alt?: string;
  /** Label bajo el frame: nombre-RESULTADO de la pantalla ("Tu semana, ya planificada"). */
  label: string;
  /** Nombre de la pantalla futura para el placeholder ("Plan del día"). */
  nombrePantalla?: string;
}

export interface AppPorDentroProps {
  kicker?: string;
  /** Copy MARCADO del título (máx 8 palabras). */
  tituloMarked: string;
  /** 3-5 frames. */
  frames: FrameCarrusel[];
  /** CTA mid-page: mismas medidas y MISMO verbo del CTA héroe (19). */
  ctaLabel: string;
  ctaHref: string;
  id?: string;
}

export function AppPorDentro({
  kicker = 'ASÍ SE VE POR DENTRO',
  tituloMarked,
  frames,
  ctaLabel,
  ctaHref,
  id,
}: AppPorDentroProps) {
  warnCopy('AppPorDentro → título', tituloMarked, 8);
  warnRango('AppPorDentro → frames', frames.length, 3, 5);
  const reduce = useReducedMotion();
  const { contenedor, item } = useReveal();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activo, setActivo] = useState(0);

  // Dots sincronizados con el frame más visible — obligatorios SIEMPRE (19 §5)
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = frameRefs.current.indexOf(e.target as HTMLDivElement);
            if (idx >= 0) setActivo(idx);
          }
        }
      },
      { root: scroller, threshold: 0.6 }
    );
    for (const f of frameRefs.current) {
      if (f) io.observe(f);
    }
    return () => io.disconnect();
  }, [frames.length]);

  const irA = (i: number): void => {
    frameRefs.current[i]?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  return (
    <SectionShell id={id} elevacion="elevada" ariaLabel="La app por dentro">
      <motion.div variants={contenedor} initial="hidden" whileInView="visible" viewport={VIEWPORT_ONCE}>
        <motion.div variants={item} className="mx-auto max-w-[620px] text-center">
          <Kicker>{kicker}</Kicker>
          <h2 className="text-balance text-[30px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[40px]">
            <MarkedCopy text={tituloMarked} />
          </h2>
        </motion.div>

        {/* Pista con scroll-snap + fade en ambos bordes (mask-image) */}
        <motion.div variants={item} className="mt-10">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(20px,calc(50%-125px))] pb-2 [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [&::-webkit-scrollbar]:hidden"
          >
            {frames.map((f, i) => (
              <div key={i} className="shrink-0 snap-center">
                <div
                  ref={(el) => {
                    frameRefs.current[i] = el;
                  }}
                  className="relative aspect-[9/19.5] w-[250px] overflow-hidden rounded-[30px] border-[5px] shadow-[var(--shadow-2)]"
                  style={{ borderColor: 'color-mix(in oklab, var(--text-primary) 90%, var(--accent))' }}
                >
                  {f.src ? (
                    /* Si el proyecto usa next/image, cambiar por <Image> — <img> mantiene el kit portable */
                    <img
                      src={f.src}
                      alt={f.alt ?? f.label}
                      width={250}
                      height={542}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    /* Placeholder honesto (55 §5.2): gris elevado + nombre + dashed —
                       nunca un frame que finja producto terminado */
                    <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--surface-2)] px-4">
                      <span className="text-center text-[14px] font-medium text-[var(--text-secondary)]">
                        {f.nombrePantalla ?? f.label}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center text-[13px] font-medium text-[var(--text-secondary)]">
                  {f.label}
                </p>
              </div>
            ))}
          </div>

          {/* Dots: activo en acento, resto neutro 30% — tocables (ir al frame) */}
          <div className="mt-4 flex justify-center gap-2">
            {frames.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => irA(i)}
                aria-label={`Ir a: ${f.label}`}
                aria-current={activo === i ? 'true' : undefined}
                className="flex size-6 items-center justify-center [touch-action:manipulation]"
              >
                <span
                  className={`size-2 rounded-full transition-colors duration-200 ${
                    activo === i
                      ? 'bg-[var(--accent)]'
                      : 'bg-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)]'
                  }`}
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* CTA mid-page (reglas de CTA de 19): tras la prueba visual, cuando la confianza es alta */}
        <motion.div variants={item} className="mt-10 flex justify-center">
          <CtaButton href={ctaHref}>{ctaLabel}</CtaButton>
        </motion.div>
      </motion.div>
    </SectionShell>
  );
}
