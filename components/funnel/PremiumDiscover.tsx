'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { readFunnelState, resetFunnelState, saveFunnelState, trackFunnel } from '@/lib/funnel';
import { addressName } from '@/lib/funnel-personalization';
import { captureMarketingAttribution } from '@/lib/marketing-attribution';
import { AcquisitionAnalytics } from '@/components/analytics/AcquisitionAnalytics';

type Screen = { title: string; body: string[]; cta: string; image?: string; dark?: boolean; kind?: 'evidence' | 'preferred-name' | 'whatsapp' | 'continuity' | 'closing' };

const screens: Screen[] = [
  { title: '¿Cuántas veces más vas a saber lo que quieres…\ny terminar haciendo otra cosa?', body: ['Dices que sí cuando querías decir que no.', 'Preguntas una decisión que ya habías tomado.', 'Te callas para no incomodar.', 'Cambias de opinión porque alguien te hizo dudar.', 'Y después llega esa sensación que conoces demasiado bien:', '“Otra vez no me hice caso.”'], cta: 'Quiero dejar de repetir esto', image: '/images/nia/hero-before-the-moment.png', dark: true },
  { title: '¿Y si eso se pudiera entrenar?', body: ['No con una frase motivacional.', 'No diciéndote qué decisión tomar.', 'No esperando a que vuelvas a estar en crisis.', 'Imagina tener algo que trabaje contigo todos los días, aprendiendo en qué momentos sueles dudar de ti y ayudándote a desarrollar una forma distinta de responder cuando vuelvan a aparecer.', 'Para que paso a paso dejes de necesitar tanta aprobación, de darle veinte vueltas a lo mismo o de terminar haciendo algo que en el fondo no querías.'], cta: 'Quiero saber cómo', image: '/images/nia/recognition-entering.png', dark: true },
  { title: 'No. No te pasa solo a ti.', body: ['Durante años se han estudiado patrones relacionados con la duda sobre el propio criterio, la rumiación y la confianza.', '+40.000 participantes', 'Un metaanálisis de 2024 reunió evidencia de gran escala y encontró un patrón consistente: muchas mujeres puntuaban más alto en experiencias relacionadas con el fenómeno del impostor.', '14.321 adultos', 'Otro metaanálisis encontró que las mujeres mostraban una mayor tendencia promedio a la rumiación: volver una y otra vez sobre pensamientos, preocupaciones y situaciones.', 'American Economic Review · 2024', 'Una investigación documentó una brecha de confianza entre hombres y mujeres y mostró que esa diferencia puede influir en cómo otros evalúan la capacidad de las mujeres.', 'No significa que haya algo mal contigo.', 'Significa que eso que vives forma parte de patrones que la investigación lleva años intentando entender.'], cta: 'Entonces… ¿esto se puede cambiar?', kind: 'evidence' },
  { title: 'Esa fue exactamente la pregunta que nos hicimos.', body: ['Si una persona puede acostumbrarse a:', 'darle vueltas a sus decisiones, buscar constantemente otra opinión, desconfiar de lo que piensa cuando alguien cuestiona su elección, o necesitar sentirse completamente segura antes de actuar…', '¿puede también entrenar una forma diferente de responder?', 'Creemos que sí.', 'Pero no queríamos hacerlo con otro curso.', 'Ni con afirmaciones.', 'Ni esperando a que estuvieras mal para que recordaras buscar ayuda.', 'Queríamos crear algo que pudiera trabajar contigo todos los días, precisamente sobre aquello que quieres cambiar.', 'Algo que entendiera:', 'qué quieres empezar a hacer diferente, en qué momentos normalmente vuelves a dudar, qué has trabajado antes y qué podría ayudarte hoy a avanzar un poco más.', 'No para decirte qué hacer.', 'Para ayudarte a necesitar cada vez menos que alguien más te lo diga.'], cta: 'Quiero ver qué crearon', image: '/images/nia/evidence-after-conversation.png', dark: true },
  { title: 'Te presentamos a NIA.', body: ['Una herramienta que trabaja contigo todos los días para ayudarte a confiar más en tu propio criterio y responder de una manera diferente en esas situaciones donde hoy vuelves a dudar de ti.', 'Tú le dices qué quieres cambiar y en qué momentos te cuesta hacerlo.', 'NIA trabaja contigo a partir de ahí.', 'Una vez al día.', 'Adaptándose a lo que ya has trabajado.', 'Sin frases genéricas.', 'Sin conversaciones interminables.', 'Sin decirte cómo vivir tu vida.', 'El objetivo no es que dependas de NIA.', 'Es que cada vez dependas más de ti.'], cta: 'Quiero ver cómo se siente', image: '/images/nia/closing-leaving.png', dark: true },
  { title: 'Antes de mostrártelo, quiero conocerte.', body: [], cta: 'Ahora sí, muéstrame cómo se sentiría', kind: 'preferred-name' },
  { title: 'Imagina que mañana tienes una conversación que llevas días evitando.', body: ['Sabes lo que necesitas decir.', 'Incluso has pensado cómo decirlo.', 'Pero desde que te despiertas empieza otra vez:', '“¿Y si estoy exagerando?”', '“¿Y si se lo toma mal?”', '“Tal vez debería esperar.”', '“Déjame preguntarle a alguien qué haría.”', 'Son las 8:00 a. m.', 'Vibra tu celular.', 'No abriste otra aplicación.', 'No tuviste que acordarte de pedir ayuda.', 'No empezaste una conversación con una IA.', 'NIA te escribió a ti.'], cta: 'Seguir', kind: 'whatsapp' },
  { title: 'Y sí, la conversación puede seguir siendo incómoda.', body: ['Pero tú ya no llegas igual.', 'Ese mensaje no buscaba decirte qué hacer.', 'Buscaba dejarte algo que pudieras usar cuando llegara el momento real:', 'una distinción.', 'un criterio.', 'una pregunta.', 'una forma diferente de responder.', 'Y mañana NIA no empieza de cero.', 'Recuerda lo que estás trabajando, retoma lo que todavía aparece y profundiza desde ahí.', 'Porque cambiar no ocurre por entender algo una vez.', 'Ocurre cuando empiezas a responder diferente en esos momentos que antes te llevaban al mismo lugar.', 'NIA no te manda mensajes.', 'Construye un proceso contigo.'], cta: 'Quiero seguir', kind: 'continuity' },
  { title: 'Esos momentos van a volver.', body: ['Vas a tener otra decisión que te haga dudar.', 'Otra conversación en la que sea más fácil callarte.', 'Otra opinión que te haga preguntarte si deberías abandonar la tuya.', 'NIA no promete que nunca vuelvas a dudar.', 'Promete trabajar contigo para que, cuando esa duda aparezca, tengas algo diferente desde donde responder.', 'Porque la duda puede volver.', 'Lo que puede cambiar es quién decide cuando aparezca.', 'No queremos que necesites a NIA para saber qué hacer.', 'Queremos que NIA te ayude a construir algo mucho más valioso:', 'tu propio criterio.', 'Para que cada vez necesites menos que alguien más te diga qué hacer.', 'Y cada vez puedas confiar más en ti.'], cta: 'Quiero vivir NIA', dark: true, kind: 'closing' },
];

function WhatsAppMoment({ preferredName }: { preferredName?: string }) {
  const name = addressName(preferredName);
  const greeting = name ? `Buenos días, ${name}.` : 'Buenos días.';
  return <div className="premium-whatsapp" aria-label="Ejemplo de mensaje de NIA recibido por WhatsApp">
    <div className="premium-whatsapp-top"><span className="premium-whatsapp-avatar">N</span><span><strong>NIA</strong><small>mensaje de hoy</small></span><span className="premium-whatsapp-dot" /></div>
    <div className="premium-whatsapp-body"><p>{greeting}</p><p>Hoy no necesitas encontrar la manera de decirlo sin incomodar a nadie.</p><p>Antes de esa conversación, prueba algo distinto: separa <strong>lo que necesitas expresar</strong> de <strong>cómo la otra persona podría reaccionar</strong>.</p><p>Lo primero sí depende de ti. Lo segundo, no.</p><p>Si hoy empiezas a dudar, vuelve a una sola pregunta:</p><p><strong>“¿Qué necesito decir para no salir de esa conversación sintiendo que otra vez me callé?”</strong></p><small>8:00 a. m. · ✓✓</small></div>
  </div>;
}

function EvidenceComposition() {
  return <div className="premium-evidence-layout">
    <div className="premium-evidence-intro"><p>Durante años se han estudiado patrones relacionados con la duda sobre el propio criterio, la rumiación y la confianza.</p><div className="premium-evidence-artifact" aria-hidden="true"><div className="premium-evidence-artifact-top"><span>FIELD NOTES</span><span>STUDY · 2024</span></div><div className="premium-evidence-artifact-grid"><i /><i /><i /><i /><i /><i /><i /><i /></div><p>Patrones · confianza · experiencia vivida</p></div><p className="premium-evidence-closing"><strong>No significa que haya algo mal contigo.</strong><br />Significa que eso que vives forma parte de patrones que la investigación lleva años intentando entender.</p></div>
    <div className="premium-evidence-modules">
      <article><span className="premium-evidence-number">+40.000</span><strong>participantes</strong><p>Un metaanálisis de 2024 reunió evidencia de gran escala y encontró un patrón consistente: muchas mujeres puntuaban más alto en experiencias relacionadas con el fenómeno del impostor.</p></article>
      <article><span className="premium-evidence-number">14.321</span><strong>adultos</strong><p>Otro metaanálisis encontró que las mujeres mostraban una mayor tendencia promedio a la rumiación: volver una y otra vez sobre pensamientos, preocupaciones y situaciones.</p></article>
      <article><span className="premium-evidence-source">American Economic Review · 2024</span><p>Una investigación documentó una brecha de confianza entre hombres y mujeres y mostró que esa diferencia puede influir en cómo otros evalúan la capacidad de las mujeres.</p></article>
    </div>
  </div>;
}

export default function PremiumDiscover() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [preferredName, setPreferredName] = useState('');
  const initialIndex = useRef(0);
  const screen = screens[index];
  const displayName = addressName(preferredName);
  const title = screen.kind === 'whatsapp' ? (displayName ? `${displayName}, imagina que mañana tienes una conversación que llevas días evitando.` : 'Imagina que mañana tienes una conversación que llevas días evitando.') : screen.kind === 'closing' ? (displayName ? `Pero tenemos que ser muy sinceros contigo, ${displayName}: esos momentos van a volver.` : 'Pero tenemos que ser muy sinceros contigo: esos momentos van a volver.') : screen.title;
  useEffect(() => { captureMarketingAttribution(); trackFunnel('discover_started'); trackFunnel('premium_funnel_started'); trackFunnel('discover_screen_viewed', { screen: 1 }); }, []);
  useEffect(() => {
    const stored = readFunnelState().discoverScreenIndex;
    const restoredIndex = typeof stored === 'number' && Number.isInteger(stored) && stored >= 0 && stored < screens.length ? stored : 0;
    const state = readFunnelState();
    const restoredName = state.preferredNameConfirmed === true ? addressName(state.preferredName) : '';
    initialIndex.current = restoredIndex;
    setIndex(restoredIndex);
    setPreferredName(restoredName);
    const current = window.history.state?.niaDiscoverScreen;
    if (restoredIndex > 0 && current !== restoredIndex) {
      window.history.replaceState({ ...(window.history.state || {}), niaDiscoverScreen: 0 }, '', window.location.href);
      for (let screenIndex = 1; screenIndex <= restoredIndex; screenIndex += 1) window.history.pushState({ niaDiscoverScreen: screenIndex }, '', window.location.href);
    } else window.history.replaceState({ ...(window.history.state || {}), niaDiscoverScreen: restoredIndex }, '', window.location.href);
    saveFunnelState({ discoverScreenIndex: restoredIndex });
    function restoreFromHistory() {
      const next = window.history.state?.niaDiscoverScreen;
      if (!Number.isInteger(next) || next < 0 || next >= screens.length) return;
      setIndex(next);
      saveFunnelState({ discoverScreenIndex: next });
    }
    window.addEventListener('popstate', restoreFromHistory);
    return () => window.removeEventListener('popstate', restoreFromHistory);
  }, []);
  useLayoutEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, [index]);
  function next() {
    if (screen.kind === 'preferred-name') {
      const value = addressName(preferredName);
      if (!value) return;
      setPreferredName(value);
      saveFunnelState({ preferredName: value, preferredNameConfirmed: true });
      trackFunnel('discover_preferred_name_entered');
    }
    trackFunnel('discover_screen_completed', { screen: index + 1 });
    if (index === 2) saveFunnelState({ recognitionComplete: true, recognitionStep: 3, recognitionContext: 'decision_doubt' });
    if (index === screens.length - 1) { trackFunnel('premium_funnel_completed'); router.push('/descubre/planes'); return; }
    const nextIndex = index + 1; saveFunnelState({ discoverScreenIndex: nextIndex }); window.history.pushState({ ...(window.history.state || {}), niaDiscoverScreen: nextIndex }, '', window.location.href); trackFunnel('discover_screen_viewed', { screen: nextIndex + 1 }); setIndex(nextIndex);
  }
  return <main className={`premium-funnel ${screen.dark ? 'is-dark' : ''}`}><AcquisitionAnalytics />
    <header className="premium-header"><Link href="/" onClick={resetFunnelState} className="premium-mark" aria-label="NIA inicio"><span />NIA</Link></header>
    <div className="premium-stage" style={screen.image ? { '--premium-image': `url(${screen.image})` } as CSSProperties : undefined}>
      <AnimatePresence mode="wait"><motion.section key={index} className={`premium-screen premium-screen-${index + 1} ${screen.kind ? `is-${screen.kind}` : ''}`} initial={false} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -12 }} transition={{ duration: reduce ? 0 : .38, ease: [0.22, 1, 0.36, 1] }} aria-labelledby="premium-title">
        {screen.image && <div className="premium-image" aria-hidden="true" />}<div className="premium-vignette" aria-hidden="true" />
        <div className="premium-copy"><h1 id="premium-title">{title.split('\n').map((line, i, lines) => <span key={line} className="premium-title-line">{line}{i < lines.length - 1 && <br />}</span>)}</h1>
          {screen.kind === 'preferred-name' ? <div className="premium-preferred-name"><p>Hasta ahora te he hablado de NIA.</p><p>Pero si esto va a ser sobre ti, quiero que desde aquí también <strong>se sienta tuyo</strong>.</p><p className="is-emphasis">Yo soy NIA.</p><p>Y quiero empezar por algo muy simple:</p><label htmlFor="premium-preferred-name">¿Cómo quieres que te llame?</label><input id="premium-preferred-name" autoFocus value={preferredName} onChange={event => setPreferredName(event.target.value)} placeholder="Juanita" maxLength={80} /></div> : screen.kind === 'whatsapp' ? <div className="premium-whatsapp-wrap"><div className="premium-body-lines">{screen.body.map(line => <p key={line} className={line.startsWith('“') || line === 'NIA te escribió a ti.' ? 'is-emphasis' : ''}>{line}</p>)}</div><WhatsAppMoment preferredName={displayName} /></div> : screen.kind === 'evidence' ? <EvidenceComposition /> : screen.kind === 'continuity' ? <div className="premium-body-lines premium-continuity-copy">{screen.body.map((line, i) => { const copy = i === 0 && displayName ? `Pero, ${displayName}, tú ya no llegas igual.` : i === 9 && displayName ? `Porque, ${displayName}, cambiar no ocurre por entender algo una vez.` : line; return <p key={copy} className={[0, 3, 4, 5, 6, 9, 11, 12].includes(i) ? 'is-emphasis' : ''}>{copy}</p>; })}</div> : <div className="premium-body-lines">{screen.body.map((line, i) => { const copy = screen.kind === 'closing' && i === 7 && displayName ? `${displayName}, no queremos que necesites a NIA para saber qué hacer.` : line; const emphasis = screen.kind === 'closing' ? [3, 5, 6, 7, 9, 11].includes(i) : line.length < 72 && (line.startsWith('No ') || line.startsWith('Es ') || line.startsWith('Creemos') || line.startsWith('NIA ') || line.startsWith('“') || line === 'Que cada vez dependas más de ti.'); const core = screen.kind === 'closing' && [5, 6].includes(i); return <p key={copy} className={`${emphasis ? 'is-emphasis ' : ''}${core ? 'is-core' : ''}`}>{copy}</p>; })}</div>}
        </div>
      </motion.section></AnimatePresence>
    </div>
    <div className="premium-action"><button type="button" className="premium-cta" disabled={screen.kind === 'preferred-name' && !preferredName.trim()} onClick={next}>{screen.cta}<ArrowRight size={18} aria-hidden="true" /></button></div>
  </main>;
}
