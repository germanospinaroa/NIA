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

type ScreenKind = 'pattern' | 'desire' | 'preferred-name' | 'whatsapp' | 'testimonials';
type Screen = { key: DiscoverScreenKey; title: string; body: string[]; cta: string; image?: string; dark?: boolean; kind?: ScreenKind };
export const PUBLIC_DISCOVER_FUNNEL_VERSION = 'emotional_v1';

export const DISCOVER_SCREENS: Screen[] = [
  { key: 'recognition', title: 'Hay cosas que tú ya sabes.', body: ['Sabes lo que quieres decir.', 'Sabes lo que necesitas cambiar.', 'Sabes qué decisión tiene más sentido para ti.', 'Sabes qué llevas tiempo aplazando.', 'Y aun así, cuando llega el momento…', 'dudas,', 'cedes,', 'te callas,', 'lo vuelves a pensar,', 'lo pospones', 'o terminas haciendo otra cosa.', 'Y después aparece esa sensación:', '“Otra vez no me hice caso.”'], cta: 'Sí. Me pasa →', image: '/images/nia/hero-before-the-moment.png', dark: true },
  { key: 'pattern', title: 'No siempre te falta claridad.', body: ['A veces ya habías tomado una decisión.', 'Pero aparece la duda:', '“¿Y si me estoy equivocando?”', '“¿Y si no lo estoy viendo bien?”', '“¿Será mejor preguntarle a alguien?”', 'Y vuelves a abrir algo que ya habías pensado.', 'Otras veces sabes perfectamente qué tienes que hacer…', 'pero cuando llega el momento, simplemente no lo haces.'], cta: 'Quiero dejar de repetir esto →', image: '/images/nia/recognition-entering.png', dark: true, kind: 'pattern' },
  { key: 'desire', title: 'Ahora imagina algo distinto.', body: ['Que puedas escuchar una opinión…', 'sin abandonar automáticamente la tuya.', 'Que puedas sentir duda…', 'sin dejar que la duda decida por ti.', 'Que puedas decir que no cuando querías decir que no.', 'Tener esa conversación.', 'Dar ese paso que llevas tiempo aplazando.', 'Tomar una decisión y confiar más en las razones por las que la tomaste.', 'Volver a hacerte caso.'], cta: 'Quiero sentirme así →', kind: 'desire' },
  { key: 'personalize', title: 'Eso es lo que NIA trabaja contigo.', body: ['No para decirte qué hacer.', 'No para convertirse en otra voz que decide por ti.', 'Sino para acompañarte justo en esos momentos en los que normalmente dudas, cedes, postergas o terminas alejándote de lo que realmente querías.', 'Y ayudarte a desarrollar algo que cambia muchísimo:', 'más criterio propio y más capacidad de actuar desde él.', 'Porque la idea no es que necesites más opiniones.', 'Es que cada vez confíes más en la tuya.'], cta: 'Quiero verlo conmigo →', kind: 'preferred-name' },
  { key: 'demo', title: '', body: ['Hay una decisión que ya pensaste.', 'Sabes por qué la tomaste.', 'Pero empieza a aparecer otra vez esa sensación de:', '“¿Y si me estoy equivocando?”', 'Son las 8:00 a. m.', 'Vibra tu celular.', 'NIA te escribió.'], cta: 'Sí. Quiero vivir esto →', kind: 'whatsapp', dark: true },
  { key: 'testimonials', title: 'No se trata de dejar de dudar.', body: [], cta: 'Quiero empezar con NIA →', kind: 'testimonials', dark: true },
];

function validDiscoverIndex(value: unknown) { return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < DISCOVER_SCREENS.length ? value : null; }
function navigationType() { const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined; return entry?.type ?? 'navigate'; }

function Progress({ index }: { index: number }) {
  if (index === 0) return null;
  return <div className="premium-progress-wrap"><div className="premium-progress" role="progressbar" aria-valuemin={1} aria-valuemax={6} aria-valuenow={index} aria-label={`Progreso de descubrimiento: ${index} de 6`}>{Array.from({ length: 6 }, (_, segment) => <span key={segment} className={segment < index ? 'is-complete' : ''} />)}</div></div>;
}

function WhatsAppMoment({ preferredName }: { preferredName?: string }) {
  const name = addressName(preferredName);
  const greeting = name ? `Buenos días, ${name}.` : 'Buenos días.';
  return <div className="premium-whatsapp" aria-label="Ejemplo de mensaje de NIA recibido por WhatsApp"><div className="premium-whatsapp-top"><span className="premium-whatsapp-avatar">N</span><span><strong>NIA</strong><small>mensaje de hoy</small></span><span className="premium-whatsapp-dot" /></div><div className="premium-whatsapp-body"><p>{greeting}</p><p>Hoy puede que vuelvas a dudar de una decisión que ya habías pensado.</p><p>Antes de abrirla otra vez, pregúntate:</p><p><strong>¿Qué cambió desde que la tomé?</strong></p><p>Si apareció información nueva, vale la pena revisarla.</p><p>Si no cambió nada y solo apareció la inseguridad, vuelve a la razón por la que decidiste.</p><p>No necesitas decidir de nuevo cada vez que aparece una duda.</p><p>A veces confiar en ti también es darle valor a lo que ya pensaste.</p><small>8:00 a. m. · ✓✓</small></div></div>;
}

function PresentationAndName({ preferredName, setPreferredName }: { preferredName: string; setPreferredName: (value: string) => void }) {
  return <div className="premium-presentation-name"><div className="premium-presentation-copy"><p>No para decirte qué hacer.</p><p>No para convertirse en otra voz que decide por ti.</p><p>Sino para acompañarte justo en esos momentos en los que normalmente dudas, cedes, postergas o terminas alejándote de lo que realmente querías.</p><p>Y ayudarte a desarrollar algo que cambia muchísimo:</p><p className="is-emphasis">más criterio propio y más capacidad de actuar desde él.</p><p>Porque la idea no es que necesites más opiniones.</p><p className="is-closing">Es que cada vez confíes más en la tuya.</p></div><div className="premium-preferred-name"><label htmlFor="premium-preferred-name">¿Cómo quieres que te llame?</label><input id="premium-preferred-name" autoFocus value={preferredName} onChange={event => setPreferredName(event.target.value)} placeholder="Juanita" maxLength={80} /></div></div>;
}

function BodyLines({ screen }: { screen: Screen }) {
  return <div className={`premium-body-lines${screen.kind ? ` is-${screen.kind}` : ''}`}>{screen.body.map((line, index) => { const closing = (screen.key === 'recognition' || screen.key === 'desire') && index === screen.body.length - 1; const thought = screen.key === 'pattern' && index >= 2 && index <= 4; const action = screen.key === 'desire' && index >= 4 && index <= 7; return <p key={`${screen.key}-${index}`} className={[closing ? 'is-emphasis' : '', thought ? 'is-thought' : '', action ? 'is-action' : ''].filter(Boolean).join(' ') || undefined}>{line}</p>; })}</div>;
}

export default function PremiumDiscover() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [preferredName, setPreferredName] = useState('');
  const screen = DISCOVER_SCREENS[index];
  const displayName = addressName(preferredName);
  const title = screen.key === 'demo' ? (displayName ? `${displayName}, imagina que hoy vuelve uno de esos momentos.` : 'Imagina que hoy vuelve uno de esos momentos.') : screen.title;

  useEffect(() => { captureMarketingAttribution(); trackFunnel('discover_started'); trackFunnel('premium_funnel_started'); }, []);
  useEffect(() => {
    const state = readFunnelState(); const type = navigationType(); const currentVersion = window.history.state?.niaDiscoverFunnelVersion === PUBLIC_DISCOVER_FUNNEL_VERSION || state.discoverFunnelVersion === PUBLIC_DISCOVER_FUNNEL_VERSION;
    const historyIndex = currentVersion ? validDiscoverIndex(window.history.state?.niaDiscoverScreen) : null; const storedIndex = currentVersion ? validDiscoverIndex(state.discoverScreenIndex) : null; const restoredIndex = type === 'reload' ? historyIndex ?? storedIndex ?? 0 : type === 'back_forward' ? historyIndex ?? 0 : 0; const restoredName = state.preferredNameConfirmed === true ? addressName(state.preferredName) : '';
    setIndex(restoredIndex); setPreferredName(restoredName); window.history.replaceState({ ...(window.history.state || {}), niaDiscoverScreen: restoredIndex, niaDiscoverFunnelVersion: PUBLIC_DISCOVER_FUNNEL_VERSION }, '', window.location.href); saveFunnelState({ discoverScreenIndex: restoredIndex, discoverFunnelVersion: PUBLIC_DISCOVER_FUNNEL_VERSION }); trackFunnel('discover_screen_viewed', { screen: restoredIndex + 1, screen_key: DISCOVER_SCREENS[restoredIndex].key });
    function restoreFromHistory() { const next = window.history.state?.niaDiscoverFunnelVersion === PUBLIC_DISCOVER_FUNNEL_VERSION ? validDiscoverIndex(window.history.state?.niaDiscoverScreen) : null; if (next === null) return; setIndex(next); saveFunnelState({ discoverScreenIndex: next, discoverFunnelVersion: PUBLIC_DISCOVER_FUNNEL_VERSION }); trackFunnel('discover_screen_viewed', { screen: next + 1, screen_key: DISCOVER_SCREENS[next].key }); }
    window.addEventListener('popstate', restoreFromHistory); return () => window.removeEventListener('popstate', restoreFromHistory);
  }, []);
  useLayoutEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, [index]);

  function next() {
    if (screen.kind === 'preferred-name') { const value = addressName(preferredName); if (!value) return; setPreferredName(value); saveFunnelState({ preferredName: value, preferredNameConfirmed: true }); trackFunnel('discover_preferred_name_entered'); }
    trackFunnel('discover_screen_completed', { screen: index + 1, screen_key: screen.key }); if (index === 2) saveFunnelState({ recognitionComplete: true, recognitionStep: 3, recognitionContext: 'decision_doubt' });
    if (index === DISCOVER_SCREENS.length - 1) { trackFunnel('premium_funnel_completed'); router.push('/descubre/planes'); return; }
    const nextIndex = index + 1; saveFunnelState({ discoverScreenIndex: nextIndex, discoverFunnelVersion: PUBLIC_DISCOVER_FUNNEL_VERSION }); window.history.pushState({ ...(window.history.state || {}), niaDiscoverScreen: nextIndex, niaDiscoverFunnelVersion: PUBLIC_DISCOVER_FUNNEL_VERSION }, '', window.location.href); trackFunnel('discover_screen_viewed', { screen: nextIndex + 1, screen_key: DISCOVER_SCREENS[nextIndex].key }); setIndex(nextIndex);
  }

  return <main className={`premium-funnel ${screen.dark ? 'is-dark' : ''}`} data-screen-key={screen.key}><AcquisitionAnalytics /><header className="premium-header"><Link href="/" onClick={resetDiscoverProgress} className="premium-mark" aria-label="NIA inicio"><span />NIA</Link><Progress index={index} /></header><div className="premium-stage" style={screen.image ? { '--premium-image': `url(${screen.image})` } as CSSProperties : undefined}><AnimatePresence mode="wait"><motion.section key={screen.key} className={`premium-screen is-${screen.key}`} initial={false} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -12 }} transition={{ duration: reduce ? 0 : .32, ease: [0.22, 1, 0.36, 1] }} aria-labelledby="premium-title">{screen.image && <div className="premium-image" aria-hidden="true" />}<div className="premium-vignette" aria-hidden="true" /><div className="premium-copy"><h1 id="premium-title">{title.split('\n').map((line, i, lines) => <span key={line} className="premium-title-line">{line}{i < lines.length - 1 && <br />}</span>)}</h1>{screen.kind === 'preferred-name' ? <PresentationAndName preferredName={preferredName} setPreferredName={setPreferredName} /> : screen.kind === 'whatsapp' ? <div className="premium-demo-content"><BodyLines screen={screen} /><WhatsAppMoment preferredName={displayName} /></div> : screen.kind === 'testimonials' ? <div className="premium-testimonials-content"><div className="premium-testimonials-intro">{['Se trata de que la duda y pensar de más no sigan decidiendo por ti.', 'Que puedas escucharte mejor.', 'Confiar más en tu criterio.', 'Dejar de darle tantas vueltas a lo que ya sabes.', 'Y actuar cada vez más de acuerdo con lo que realmente quieres.', 'No queremos que dependas de NIA.', 'Queremos que cada vez dependas más de ti.', 'Y eso es justamente lo que otras mujeres que comenzaron con dudas muy parecidas a las tuyas ya están empezando a experimentar.'].map((line, item) => <p key={line} className={item === 5 || item === 6 ? 'is-emphasis' : ''}>{line}</p>)}</div><TestimonialsCarousel /><p className="premium-testimonials-closing">Y si llegaste hasta aquí…</p><p className="premium-testimonials-news">tenemos una muy buena noticia para ti.</p></div> : <BodyLines screen={screen} />}</div></motion.section></AnimatePresence></div><div className="premium-action"><button type="button" className="premium-cta" disabled={screen.kind === 'preferred-name' && !preferredName.trim()} onClick={next}>{screen.cta}<ArrowRight size={18} aria-hidden="true" /></button></div></main>;
}
