'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useLayoutEffect, useState, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { readFunnelState, resetDiscoverProgress, saveFunnelState, trackFunnel, type DiscoverScreenKey } from '@/lib/funnel';
import { addressName } from '@/lib/funnel-personalization';
import { captureMarketingAttribution } from '@/lib/marketing-attribution';
import { AcquisitionAnalytics } from '@/components/analytics/AcquisitionAnalytics';
import { TestimonialsCarousel } from '@/components/funnel/TestimonialsCarousel';

type Screen = { key: DiscoverScreenKey; title: string; body: string[]; cta: string; image?: string; dark?: boolean; kind?: 'evidence' | 'preferred-name' | 'whatsapp' | 'testimonials' };

export const DISCOVER_SCREENS: Screen[] = [
  { key: 'recognition', title: '¿Cuántas veces más vas a saber lo que quieres…\ny terminar haciendo otra cosa?', body: ['Dices que sí cuando querías decir que no.', 'Preguntas una decisión que ya habías tomado.', 'Te callas para no incomodar.', 'Cambias de opinión porque alguien te hizo dudar.', 'Y después llega esa sensación que conoces demasiado bien:', '“Otra vez no me hice caso.”'], cta: 'Quiero entender por qué me pasa', image: '/images/nia/hero-before-the-moment.png', dark: true },
  { key: 'reframe', title: '¿Y si el problema no fuera saber qué quieres…\nsino lo que pasa cuando llega el momento de sostenerlo?', body: ['Muchas veces sí sabes qué quieres.', 'Lo difícil aparece cuando llega la conversación, la opinión de alguien más o esa duda que te hace volver a revisar todo.', 'Ahí es donde el patrón se repite.', 'Y ahí es donde se puede trabajar.'], cta: 'Muéstrame cómo sería diferente', image: '/images/nia/recognition-entering.png', dark: true },
  { key: 'evidence', title: 'Esto no te pasa solo a ti.', body: [], cta: 'Quiero verlo conmigo', kind: 'evidence' },
  { key: 'personalize', title: 'Por eso creamos NIA.', body: [], cta: 'Quiero verlo conmigo', kind: 'preferred-name' },
  { key: 'demo', title: '', body: ['Sabes lo que necesitas decir.', 'Incluso has pensado cómo decirlo.', 'Pero desde que te despiertas empieza otra vez:', '“¿Y si estoy exagerando?”', '“¿Y si se lo toma mal?”', '“Tal vez debería esperar.”', '“Déjame preguntarle a alguien qué haría.”', 'Son las 8:00 a. m.', 'Vibra tu celular.', 'No abriste otra aplicación.', 'No tuviste que acordarte de pedir ayuda.', 'No empezaste una conversación con una IA.', 'NIA te escribió a ti.'], cta: 'Sí, quiero vivir esto', kind: 'whatsapp', dark: true },
  { key: 'testimonials', title: 'Y esto que acabas de vivir no se queda solo en una demostración.', body: [], cta: 'Quiero comenzar a vivir la experiencia', kind: 'testimonials', dark: true },
];

function validDiscoverIndex(value: unknown) { return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < DISCOVER_SCREENS.length ? value : null; }
function navigationType() { const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined; return entry?.type ?? 'navigate'; }

function Progress({ index }: { index: number }) {
  if (index === 0) return null;
  return <div className="premium-progress-wrap"><div className="premium-progress" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={index} aria-label={`Progreso de descubrimiento: ${index} de 5`}>{Array.from({ length: 5 }, (_, segment) => <span key={segment} className={segment < index ? 'is-complete' : ''} />)}</div></div>;
}

function WhatsAppMoment({ preferredName }: { preferredName?: string }) {
  const name = addressName(preferredName);
  const greeting = name ? `Buenos días, ${name}.` : 'Buenos días.';
  return <div className="premium-whatsapp" aria-label="Ejemplo de mensaje de NIA recibido por WhatsApp">
    <div className="premium-whatsapp-top"><span className="premium-whatsapp-avatar">N</span><span><strong>NIA</strong><small>mensaje de hoy</small></span><span className="premium-whatsapp-dot" /></div>
    <div className="premium-whatsapp-body"><p>{greeting}</p><p>Hoy no necesitas encontrar la manera de decirlo sin incomodar a nadie.</p><p>Antes de esa conversación, prueba algo distinto: separa <strong>lo que necesitas expresar</strong> de <strong>cómo la otra persona podría reaccionar</strong>.</p><p>Lo primero sí depende de ti. Lo segundo, no.</p><p>Si hoy empiezas a dudar, vuelve a una sola pregunta:</p><p><strong>“¿Qué necesito decir para no salir de esa conversación sintiendo que otra vez me callé?”</strong></p><small>8:00 a. m. · ✓✓</small></div>
  </div>;
}

function EvidenceComposition() {
  return <div className="premium-evidence-compact">
    <article className="premium-evidence-block"><div className="premium-evidence-stat"><strong>+40.000</strong><span>participantes</span></div><p>El metaanálisis de Price, Holcomb y Payne reunió 115 tamaños de efecto sobre diferencias de género en el fenómeno del impostor. En promedio, las mujeres puntuaron más alto; la diferencia fue pequeña.</p><small>Current Research in Behavioral Sciences · 2024</small></article>
    <article className="premium-evidence-block"><div className="premium-evidence-stat"><strong>14.321</strong><span>adultos</span></div><p>El metaanálisis de Johnson y Whisman encontró una mayor tendencia promedio a la rumiación en mujeres: volver una y otra vez sobre pensamientos y preocupaciones.</p><small>Personality and Individual Differences · 2013</small></article>
    <div className="premium-evidence-closing"><p>No significa que todas las mujeres vivan esto.</p><p>Significa que lo que estás sintiendo forma parte de patrones que la investigación lleva años estudiando.</p></div>
  </div>;
}

function PresentationAndName({ preferredName, setPreferredName }: { preferredName: string; setPreferredName: (value: string) => void }) {
  return <div className="premium-presentation-name">
    <div className="premium-presentation-copy"><p>No para decirte qué hacer.</p><p>Para llevar a tu día a día herramientas respaldadas por investigación, de una forma muy sencilla.</p><p>Empezamos por algo que ya usas todos los días: WhatsApp.</p><p>NIA te escribe con mensajes breves y pensados para ti, a partir de lo que quieres trabajar y de esos momentos en los que más te cuesta actuar como realmente quieres.</p><p className="is-emphasis">Y como esto se trata de ti, queremos que lo veas contigo.</p></div>
    <div className="premium-preferred-name"><label htmlFor="premium-preferred-name">¿Cómo quieres que te llame?</label><input id="premium-preferred-name" autoFocus value={preferredName} onChange={event => setPreferredName(event.target.value)} placeholder="Juanita" maxLength={80} /></div>
  </div>;
}

export default function PremiumDiscover() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [preferredName, setPreferredName] = useState('');
  const screen = DISCOVER_SCREENS[index];
  const displayName = addressName(preferredName);
  const title = screen.key === 'demo' ? (displayName ? `${displayName}, imagina que mañana tienes una conversación que llevas días evitando.` : 'Imagina que mañana tienes una conversación que llevas días evitando.') : screen.title;

  useEffect(() => { captureMarketingAttribution(); trackFunnel('discover_started'); trackFunnel('premium_funnel_started'); }, []);
  useEffect(() => {
    const state = readFunnelState();
    const type = navigationType();
    const historyIndex = validDiscoverIndex(window.history.state?.niaDiscoverScreen);
    const storedIndex = validDiscoverIndex(state.discoverScreenIndex);
    const restoredIndex = type === 'reload' ? historyIndex ?? storedIndex ?? 0 : type === 'back_forward' ? historyIndex ?? 0 : 0;
    const restoredName = state.preferredNameConfirmed === true ? addressName(state.preferredName) : '';
    setIndex(restoredIndex); setPreferredName(restoredName);
    window.history.replaceState({ ...(window.history.state || {}), niaDiscoverScreen: restoredIndex }, '', window.location.href);
    saveFunnelState({ discoverScreenIndex: restoredIndex });
    trackFunnel('discover_screen_viewed', { screen: restoredIndex + 1, screen_key: DISCOVER_SCREENS[restoredIndex].key });
    function restoreFromHistory() { const next = validDiscoverIndex(window.history.state?.niaDiscoverScreen); if (next === null) return; setIndex(next); saveFunnelState({ discoverScreenIndex: next }); trackFunnel('discover_screen_viewed', { screen: next + 1, screen_key: DISCOVER_SCREENS[next].key }); }
    window.addEventListener('popstate', restoreFromHistory); return () => window.removeEventListener('popstate', restoreFromHistory);
  }, []);
  useLayoutEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, [index]);

  function next() {
    if (screen.kind === 'preferred-name') { const value = addressName(preferredName); if (!value) return; setPreferredName(value); saveFunnelState({ preferredName: value, preferredNameConfirmed: true }); trackFunnel('discover_preferred_name_entered'); }
    trackFunnel('discover_screen_completed', { screen: index + 1, screen_key: screen.key });
    if (index === 2) saveFunnelState({ recognitionComplete: true, recognitionStep: 3, recognitionContext: 'decision_doubt' });
    if (index === DISCOVER_SCREENS.length - 1) { trackFunnel('premium_funnel_completed'); router.push('/descubre/planes'); return; }
    const nextIndex = index + 1; saveFunnelState({ discoverScreenIndex: nextIndex }); window.history.pushState({ ...(window.history.state || {}), niaDiscoverScreen: nextIndex }, '', window.location.href); trackFunnel('discover_screen_viewed', { screen: nextIndex + 1, screen_key: DISCOVER_SCREENS[nextIndex].key }); setIndex(nextIndex);
  }

  return <main className={`premium-funnel ${screen.dark ? 'is-dark' : ''}`} data-screen-key={screen.key}><AcquisitionAnalytics /><header className="premium-header"><Link href="/" onClick={resetDiscoverProgress} className="premium-mark" aria-label="NIA inicio"><span />NIA</Link><Progress index={index} /></header><div className="premium-stage" style={screen.image ? { '--premium-image': `url(${screen.image})` } as CSSProperties : undefined}><AnimatePresence mode="wait"><motion.section key={screen.key} className={`premium-screen is-${screen.key}`} initial={false} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -12 }} transition={{ duration: reduce ? 0 : .32, ease: [0.22, 1, 0.36, 1] }} aria-labelledby="premium-title">{screen.image && <div className="premium-image" aria-hidden="true" />}<div className="premium-vignette" aria-hidden="true" /><div className="premium-copy"><h1 id="premium-title">{title.split('\n').map((line, i, lines) => <span key={line} className="premium-title-line">{line}{i < lines.length - 1 && <br />}</span>)}</h1>{screen.kind === 'preferred-name' ? <PresentationAndName preferredName={preferredName} setPreferredName={setPreferredName} /> : screen.kind === 'whatsapp' ? <div className="premium-demo-content"><div className="premium-body-lines">{screen.body.map((line, i) => <p key={line} className={i === 12 ? 'is-emphasis' : i >= 7 && i <= 8 ? 'is-time' : ''}>{line}</p>)}</div><WhatsAppMoment preferredName={displayName} /></div> : screen.kind === 'evidence' ? <EvidenceComposition /> : screen.kind === 'testimonials' ? <div className="premium-testimonials-content"><div className="premium-testimonials-intro"><p>Otras mujeres ya están viviendo NIA en momentos reales de su día: decisiones, conversaciones, dudas y situaciones en las que antes terminaban actuando distinto a como querían.</p><p>Estos son algunos de los mensajes que nos han compartido después de vivir la experiencia.</p></div><TestimonialsCarousel /><p className="premium-testimonials-closing">Y tú también podrías empezar a vivirla.</p></div> : <div className="premium-body-lines">{screen.body.map((line, i) => <p key={line} className={i === screen.body.length - 1 ? 'is-emphasis' : ''}>{line}</p>)}</div>}</div></motion.section></AnimatePresence></div><div className="premium-action"><button type="button" className="premium-cta" disabled={screen.kind === 'preferred-name' && !preferredName.trim()} onClick={next}>{screen.cta}<ArrowRight size={18} aria-hidden="true" /></button></div></main>;
}
