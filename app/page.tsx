'use client';

import { useEffect } from 'react';
import { ArrowDown, ArrowRight, Check, Eye, LockKeyhole, MessageSquareQuote, Sparkles } from 'lucide-react';
import { Agitacion } from '@/components/landing/Agitacion';
import { CtaFinal } from '@/components/landing/CtaFinal';
import { Faq } from '@/components/landing/Faq';
import { FooterLegal } from '@/components/landing/FooterLegal';
import { Hero } from '@/components/landing/Hero';
import { Problema } from '@/components/landing/Problema';
import { Solucion } from '@/components/landing/Solucion';
import { CtaButton, Kicker, SectionShell, StickyCtaMobile } from '@/components/landing/ui';

const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Probar NIA 7 días gratis';

function trackEvent(eventName: string) {
  if (typeof window === 'undefined') return;
  const event = { name: eventName, timestamp: new Date().toISOString(), path: window.location.pathname };
  const typedWindow = window as Window & { __niaEvents?: typeof event[] };
  const queue = (typedWindow.__niaEvents ??= []);
  queue.push(event);
  window.dispatchEvent(new CustomEvent('nia:event', { detail: event }));
}

function AdaptationDemo() {
  return (
    <SectionShell id="demostracion" elevacion="base" className="bg-[var(--surface-2)]" ariaLabel="Demostración de adaptación de Punto NIA">
      <div className="mx-auto max-w-[980px]">
        <div className="mx-auto max-w-[640px] text-center">
          <Kicker>EL PUNTO NIA</Kicker>
          <h2 className="text-balance text-[32px] font-bold leading-[1.08] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[48px]">
            Lo que marcas hoy cambia lo que recibes después.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--text-secondary)] md:text-[18px]">
            No es una conversación. Es una señal pequeña que hace que la siguiente intervención parta de un lugar más real.
          </p>
        </div>
        <div className="relative mt-10 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <article className="rounded-[var(--radius-card)] bg-[var(--surface)] p-6 shadow-[var(--shadow-1)] md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Primera intervención</p>
            <p className="mt-6 text-[25px] leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
              Puedes manejar esta conversación perfectamente.
            </p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] px-3 py-2 text-[13px] font-semibold text-[var(--accent)]">
              <span className="size-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />Señal: <strong>Más real</strong>
            </div>
          </article>
          <div className="flex items-center justify-center gap-2 text-[var(--accent)] md:flex-col">
            <span className="hidden text-center text-[11px] font-bold uppercase tracking-[0.13em] md:block">NIA ajusta</span>
            <ArrowRight className="hidden md:block" size={22} aria-hidden="true" />
            <ArrowDown className="md:hidden" size={22} aria-hidden="true" />
          </div>
          <article className="rounded-[var(--radius-card)] bg-[var(--text-primary)] p-6 text-[var(--bg)] shadow-[var(--shadow-2)] md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color-mix(in_oklab,var(--bg)_62%,transparent)]">Más adelante</p>
            <p className="mt-6 text-[25px] leading-[1.15] [font-family:var(--font-display)]">
              No tienes que sentirte completamente segura. Puedes entrar a la conversación con una idea clara de lo que sí quieres decir.
            </p>
            <div className="mt-7 flex items-center gap-2 text-[13px] font-semibold text-[var(--accent)]"><Sparkles size={16} aria-hidden="true" />Menos absoluto. Más creíble.</div>
          </article>
        </div>
      </div>
    </SectionShell>
  );
}

function MemorySection() {
  return (
    <SectionShell id="memoria" elevacion="elevada" ariaLabel="Memoria controlada de NIA">
      <div className="mx-auto grid max-w-[980px] gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-center">
        <div>
          <Kicker>MEMORIA BAJO CONTROL</Kicker>
          <h2 className="mt-2 text-balance text-[31px] font-bold leading-[1.1] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[44px]">NIA recuerda lo mínimo necesario para no empezar de cero.</h2>
          <p className="mt-5 max-w-[470px] text-[16px] leading-relaxed text-[var(--text-secondary)]">Tú decides qué permanece. La memoria se puede revisar, editar o borrar; no construye una biografía sobre ti.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-5 shadow-[var(--shadow-1)]">
            <div className="flex items-center gap-3 text-[var(--accent)]"><Eye size={19} aria-hidden="true" /><span className="text-[12px] font-bold uppercase tracking-[0.12em]">Sí conserva</span></div>
            <ul className="mt-5 space-y-3 text-[15px] leading-snug text-[var(--text-primary)]">{['Tu intención', 'Qué lenguaje te resulta real', 'Señales y contextos elegidos'].map((item) => <li key={item} className="flex gap-2"><Check size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden="true" />{item}</li>)}</ul>
          </div>
          <div className="rounded-[var(--radius-card)] bg-[var(--surface-2)] p-5">
            <div className="flex items-center gap-3 text-[var(--text-secondary)]"><LockKeyhole size={19} aria-hidden="true" /><span className="text-[12px] font-bold uppercase tracking-[0.12em]">No guarda</span></div>
            <ul className="mt-5 space-y-3 text-[15px] leading-snug text-[var(--text-secondary)]">{['Secretos o diagnósticos', 'Una conversación abierta', 'Una historia íntima inventada'].map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--text-tertiary)]" aria-hidden="true" />{item}</li>)}</ul>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function TrialSection() {
  return (
    <SectionShell id="trial" elevacion="base" ariaLabel="Prueba gratuita de NIA">
      <div className="mx-auto max-w-[700px] text-center">
        <Kicker>PRUÉBALA EN EL MOMENTO REAL</Kicker>
        <h2 className="text-balance text-[32px] font-bold leading-[1.1] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[46px]">Siete días para comprobar si lo siguiente cambia para ti.</h2>
        <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-relaxed text-[var(--text-secondary)]">Acceso al producto real: intención, intervenciones, microseñales, adaptación, Punto NIA y evidencia. 7 días gratis. Después se cobra el plan elegido salvo cancelación.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-[14px] text-[var(--text-secondary)]">{['Sin rachas ni culpa', 'Cancelación clara', 'Memoria bajo tu control'].map((item) => <span key={item} className="inline-flex items-center gap-2"><Check size={16} className="text-[var(--accent)]" aria-hidden="true" />{item}</span>)}</div>
        <div className="mt-8"><CtaButton href={CTA_HREF}>{CTA_LABEL}</CtaButton></div>
      </div>
    </SectionShell>
  );
}

export default function Home() {
  useEffect(() => {
    if (!sessionStorage.getItem('nia_landing_viewed')) {
      sessionStorage.setItem('nia_landing_viewed', '1');
      trackEvent('landing_viewed');
    }
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('a[href="/onboarding"]')) trackEvent('cta_started');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <Hero appName="NIA" logo={<span className="size-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />} h1Marked="Actúa como la persona que quieres ser [acento]cuando importa[/acento]" subtitleMarked="NIA aprende qué te ayuda y adapta lo siguiente, sin frases genéricas." ctaLabel={CTA_LABEL} ctaHref={CTA_HREF} socialProof={<span>7 días gratis · después eliges cómo continuar</span>} visual={<HeroPreview />} />
      <Problema titulo="¿Te suena?" preguntas={[{ icon: MessageSquareQuote, textoMarked: 'Sabes cómo quieres actuar, pero al llegar el momento [b]vuelves a dudar[/b].' }, { icon: ArrowDown, textoMarked: 'Guardas frases, escuchas podcasts o abres ChatGPT para [b]volver a empezar[/b].' }, { icon: Sparkles, textoMarked: 'Lo que ayer te ayudó hoy ya suena [b]demasiado genérico[/b].' }]} />
      <Agitacion frases={['No te falta información: te falta algo que aparezca cuando [b]ya estás dentro del momento[/b].', 'Otra frase bonita puede acompañarte un minuto. Pero no cambia lo que recibes [acento]mañana[/acento].']} contraste={{ labelHoy: 'Lo que pasa ahora', hoy: 'Encuentras una frase, la pruebas, y al día siguiente todo vuelve a empezar.', labelFuturo: 'Lo que cambia con NIA', futuro: 'Una señal pequeña modifica el lenguaje y el enfoque de la próxima intervención.' }} />
      <AdaptationDemo />
      <Solucion tituloMarked="Una señal. [acento]Un siguiente paso distinto.[/acento]" mecanismo="Punto NIA" bigIdeaMarked="La inteligencia no está en hablar más. Está en que [b]lo que ocurre hoy modifique lo que NIA hace después[/b]." pasos={[{ titulo: 'Define tu intención', detalle: 'Elige cómo quieres volver a actuar cuando llegue el momento.' }, { titulo: 'Responde con una señal', detalle: 'Marca “Así sí”, “Más real” u “Otro enfoque” con un toque.' }, { titulo: 'Recibe algo más preciso', detalle: 'La próxima intervención parte de lo que ya señalaste.' }]} antesDespues={{ labelAntes: 'Sin continuidad', antes: 'La misma frase para todos, todos los días.', labelDespues: 'Con Punto NIA', despues: 'Una intervención que cambia porque tú ya marcaste qué te sirve.' }} />
      <MemorySection />
      <SectionShell id="chatgpt" elevacion="base" ariaLabel="NIA frente a ChatGPT"><div className="mx-auto grid max-w-[920px] gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center"><div><Kicker>NO ES OTRA CONVERSACIÓN</Kicker><h2 className="mt-2 text-balance text-[31px] font-bold leading-[1.1] [font-family:var(--font-display)] md:text-[44px]">Menos esfuerzo que abrir ChatGPT y explicar todo otra vez.</h2></div><div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-6 shadow-[var(--shadow-1)] md:p-8"><div className="flex items-center gap-3 text-[var(--accent)]"><MessageSquareQuote size={20} aria-hidden="true" /><span className="text-[12px] font-bold uppercase tracking-[0.12em]">La diferencia</span></div><p className="mt-5 text-[18px] leading-relaxed text-[var(--text-primary)]">NIA no te pide construir un prompt ni sostener una sesión. Tú das una señal pequeña; lo que recibes después se vuelve más relevante.</p></div></div></SectionShell>
      <TrialSection />
      <Faq items={[{ pregunta: '¿NIA es una app de afirmaciones?', respuestaMarked: 'No. Las intervenciones se ajustan con tus señales; la diferencia está en la continuidad, no en acumular frases.' }, { pregunta: '¿NIA es terapia o un coach virtual?', respuestaMarked: 'No. NIA ofrece intervenciones breves y opciones de un toque. No diagnostica, no trata y no abre conversaciones largas.' }, { pregunta: '¿Qué recuerda NIA?', respuestaMarked: 'Recuerda tu intención, señales, contextos y lenguaje que te resulta real. La memoria es visible, editable y revocable.' }, { pregunta: '¿Qué ocurre después de los 7 días?', respuestaMarked: 'Se cobra el plan que hayas elegido, salvo que canceles. El importe, la moneda y la periodicidad se muestran antes de confirmar.' }]} />
      <CtaFinal h2Marked="Vuelve a ti [acento]cuando importa[/acento]" futurePacingMarked="Empieza con una intención. Da una señal. Deja que lo siguiente parta de ahí." ctaLabel={CTA_LABEL} ctaHref={CTA_HREF} recap="7 días gratis · sin frases genéricas · sin journaling" psMarked="NIA recuerda lo mínimo necesario para que no tengas que empezar de cero." />
      <FooterLegal appName="NIA" soporteEmail="soporte@nia.app" enlaces={[{ label: 'Privacidad', href: '/privacidad' }, { label: 'Términos y Condiciones', href: '/terminos' }, { label: 'Cancelación', href: '/cancelacion' }]} />
      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} ofertaId="trial" />
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="mx-auto mt-8 w-full max-w-[760px] rounded-[var(--radius-card)] bg-[var(--text-primary)] p-4 text-left shadow-[var(--shadow-2)] sm:p-6">
      <div className="flex items-center justify-between border-b border-[color-mix(in_oklab,var(--bg)_16%,transparent)] pb-4"><span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color-mix(in_oklab,var(--bg)_60%,transparent)]">Punto NIA · ahora</span><span className="flex items-center gap-2 text-[12px] text-[color-mix(in_oklab,var(--bg)_60%,transparent)]"><span className="size-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />unos segundos</span></div>
      <div className="grid min-w-0 gap-5 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><p className="min-w-0 max-w-[520px] break-words text-[28px] leading-[1.07] text-[var(--bg)] [font-family:var(--font-display)] sm:text-[38px]">No necesitas llegar sin dudas. Solo necesitas recordar cómo quieres entrar.</p><div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--accent)]"><span className="size-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />una señal cambia lo siguiente</div></div>
    </div>
  );
}
