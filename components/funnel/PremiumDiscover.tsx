'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { saveFunnelState, trackFunnel } from '@/lib/funnel';

type Screen = { title: string; body: string[]; cta: string; image?: string; dark?: boolean; kind?: 'evidence' | 'whatsapp' | 'continuity' | 'closing' };

const screens: Screen[] = [
  { title: '¿Cuántas veces más vas a saber lo que quieres…\ny terminar haciendo otra cosa?', body: ['Dices que sí cuando querías decir que no.', 'Preguntas una decisión que ya habías tomado.', 'Te callas para no incomodar.', 'Cambias de opinión porque alguien te hizo dudar.', 'Y después llega esa sensación que conoces demasiado bien:', '“Otra vez no me hice caso.”'], cta: 'Quiero dejar de repetir esto', image: '/images/nia/hero-before-the-moment.png', dark: true },
  { title: '¿Y si eso se pudiera entrenar?', body: ['No con una frase motivacional.', 'No diciéndote qué decisión tomar.', 'No esperando a que vuelvas a estar en crisis.', 'Imagina tener algo que trabaje contigo todos los días, aprendiendo en qué momentos sueles dudar de ti y ayudándote a desarrollar una forma distinta de responder cuando vuelvan a aparecer.', 'Para que paso a paso dejes de necesitar tanta aprobación, de darle veinte vueltas a lo mismo o de terminar haciendo algo que en el fondo no querías.'], cta: 'Quiero saber cómo', image: '/images/nia/recognition-entering.png', dark: true },
  { title: 'No. No te pasa solo a ti.', body: ['Durante años se han estudiado patrones relacionados con la duda sobre el propio criterio, la rumiación y la confianza.', 'Un metaanálisis publicado en 2024 reunió 115 resultados de investigación y más de 40.000 participantes. Encontró que, en promedio, las mujeres puntuaban más alto que los hombres en fenómeno del impostor: esa sensación de no confiar completamente en la propia capacidad incluso cuando existen razones objetivas para hacerlo. La diferencia fue pequeña, pero consistente.', 'Otro metaanálisis con 14.321 adultos encontró que las mujeres mostraban, en promedio, mayor tendencia a la rumiación: volver una y otra vez sobre pensamientos, preocupaciones y situaciones. También aquí la diferencia fue pequeña, pero estadísticamente consistente.', 'Una investigación publicada en American Economic Review en 2024 documentó además una brecha de confianza entre hombres y mujeres y mostró que esa menor expresión de confianza puede influir en cómo otros evalúan su capacidad.', 'Y entonces:', 'No significa que haya algo mal contigo.', 'Significa que eso que vives forma parte de patrones que la investigación lleva años intentando entender.'], cta: 'Entonces… ¿esto se puede cambiar?', kind: 'evidence' },
  { title: 'Esa fue exactamente la pregunta que nos hicimos.', body: ['Si una persona puede acostumbrarse a:', 'darle vueltas a sus decisiones, buscar constantemente otra opinión, desconfiar de lo que piensa cuando alguien cuestiona su elección, o necesitar sentirse completamente segura antes de actuar…', '¿puede también entrenar una forma diferente de responder?', 'Creemos que sí.', 'Pero no queríamos hacerlo con otro curso.', 'Ni con afirmaciones.', 'Ni esperando a que estuvieras mal para que recordaras buscar ayuda.', 'Queríamos crear algo que pudiera trabajar contigo todos los días, precisamente sobre aquello que quieres cambiar.', 'Algo que entendiera:', 'qué quieres empezar a hacer diferente, en qué momentos normalmente vuelves a dudar, qué has trabajado antes, y qué podría ayudarte hoy a avanzar un poco más.', 'No para decirte qué hacer.', 'Para ayudarte a necesitar cada vez menos que alguien más te lo diga.'], cta: 'Quiero ver qué crearon', image: '/images/nia/evidence-after-conversation.png', dark: true },
  { title: 'Esto es NIA.', body: ['Una herramienta que trabaja contigo todos los días para ayudarte a confiar más en tu propio criterio y responder de una manera diferente en esas situaciones donde hoy vuelves a dudar de ti.', 'Tú le dices qué quieres cambiar y en qué momentos te cuesta hacerlo.', 'NIA trabaja contigo a partir de ahí.', 'Una vez al día.', 'Adaptándose a lo que ya has trabajado.', 'Sin frases genéricas.', 'Sin conversaciones interminables.', 'Sin decirte cómo vivir tu vida.', 'El objetivo no es que dependas de NIA.', 'Es que cada vez dependas más de ti.'], cta: 'Quiero ver cómo se siente', image: '/images/nia/closing-leaving.png', dark: true },
  { title: 'Imagina que mañana tienes una conversación que llevas días evitando.', body: ['Sabes lo que necesitas decir. Incluso has pensado cómo decirlo.', 'Pero desde que te despiertas empiezas otra vez:', '“¿Y si estoy exagerando?”', '“¿Y si se lo toma mal?”', '“Tal vez debería esperar.”', '“Déjame preguntarle a alguien qué haría.”', 'Son las 8:00 a. m.', 'Vibra tu celular.', 'No abriste otra aplicación. No tuviste que acordarte de pedir ayuda. No empezaste una conversación con una IA.', 'Te llegó un WhatsApp.'], cta: 'Seguir', kind: 'whatsapp' },
  { title: 'Tal vez la conversación siga siendo incómoda.', body: ['Pero tú ya no llegas igual.', 'NIA busca dejarte algo que puedas usar cuando llegue el momento real:', 'una distinción.', 'un criterio.', 'una pregunta.', 'una forma diferente de responder.', 'Porque cambiar no ocurre por entender algo una vez.', 'Ocurre cuando sigues trabajando, paso a paso, lo que todavía aparece en tu vida de formas distintas.', 'Por eso NIA no empieza de cero cada día.', 'Retoma lo que estás viviendo, lo profundiza y te ayuda a construir una forma más tuya de responder.', 'NIA no te manda mensajes.', 'Construye un proceso contigo.'], cta: 'Quiero seguir', kind: 'continuity' },
  { title: 'Imagina dentro de unos meses…', body: ['Que no necesites llamar a alguien cada vez que tienes que decidir.', 'Que una opinión diferente no sea suficiente para hacerte abandonar la tuya.', 'Que puedas decir que no sin pasar tres horas justificándolo después.', 'Que una conversación incómoda siga siendo incómoda… pero ya no sea suficiente para hacerte dejar de ser tú.', 'Ese es el cambio que queremos ayudarte a construir.', 'No que dependas de NIA.', 'Que cada vez dependas más de ti.'], cta: 'Quiero vivir NIA', dark: true, kind: 'closing' },
];

function WhatsAppMoment() {
  return <div className="premium-whatsapp" aria-label="Ejemplo de mensaje de NIA recibido por WhatsApp">
    <div className="premium-whatsapp-top"><span className="premium-whatsapp-avatar">N</span><span><strong>NIA</strong><small>mensaje de hoy</small></span><span className="premium-whatsapp-dot" /></div>
    <div className="premium-whatsapp-body"><p>Buenos días, Juanita.</p><p>Hoy no necesitas encontrar la manera de decirlo sin incomodar a nadie.</p><p>Antes de esa conversación, prueba algo distinto: separa <strong>lo que necesitas expresar</strong> de <strong>cómo la otra persona podría reaccionar</strong>.</p><p>Lo primero sí depende de ti. Lo segundo, no.</p><p>Si hoy empiezas a dudar, vuelve a una sola pregunta:</p><p><strong>“¿Qué necesito decir para no salir de esa conversación sintiendo que otra vez me callé?”</strong></p><small>8:00 a. m. · ✓✓</small></div>
  </div>;
}

export default function PremiumDiscover() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const screen = screens[index];
  useEffect(() => { trackFunnel('discover_started'); trackFunnel('premium_funnel_started'); trackFunnel('discover_screen_viewed', { screen: 1 }); }, []);
  function next() {
    trackFunnel('discover_screen_completed', { screen: index + 1 });
    if (index === 2) saveFunnelState({ recognitionComplete: true, recognitionStep: 3, recognitionContext: 'decision_doubt' });
    if (index === screens.length - 1) { trackFunnel('premium_funnel_completed'); router.push('/descubre/planes'); return; }
    const nextIndex = index + 1; trackFunnel('discover_screen_viewed', { screen: nextIndex + 1 }); setIndex(nextIndex);
  }
  return <main className={`premium-funnel ${screen.dark ? 'is-dark' : ''}`}>
    <header className="premium-header"><a href="/descubre" className="premium-mark" aria-label="NIA inicio"><span />NIA</a></header>
    <div className="premium-stage" style={screen.image ? { '--premium-image': `url(${screen.image})` } as CSSProperties : undefined}>
      <AnimatePresence mode="wait"><motion.section key={index} className={`premium-screen premium-screen-${index + 1} ${screen.kind ? `is-${screen.kind}` : ''}`} initial={false} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -12 }} transition={{ duration: reduce ? 0 : .38, ease: [0.22, 1, 0.36, 1] }} aria-labelledby="premium-title">
        {screen.image && <div className="premium-image" aria-hidden="true" />}<div className="premium-vignette" aria-hidden="true" />
        <div className="premium-copy"><h1 id="premium-title">{screen.title.split('\n').map((line, i, lines) => <span key={line} className="premium-title-line">{line}{i < lines.length - 1 && <br />}</span>)}</h1>
          {screen.kind === 'whatsapp' ? <div className="premium-whatsapp-wrap"><div className="premium-body-lines">{screen.body.map(line => <p key={line} className={line.startsWith('“') || line === 'Te llegó un WhatsApp.' ? 'is-emphasis' : ''}>{line}</p>)}</div><WhatsAppMoment /></div> : screen.kind === 'evidence' ? <div className="premium-evidence-scroll">{screen.body.map((line, i) => <p key={line} className={i > 4 ? 'is-emphasis' : i === 4 ? 'is-divider' : ''}>{line}</p>)}</div> : screen.kind === 'continuity' ? <div className="premium-body-lines premium-continuity-copy">{screen.body.map((line, i) => <p key={line} className={[0, 2, 3, 4, 5, 10, 11].includes(i) ? 'is-emphasis' : ''}>{line}</p>)}</div> : <div className="premium-body-lines">{screen.body.map(line => <p key={line} className={line.length < 72 && (line.startsWith('No ') || line.startsWith('Es ') || line.startsWith('Creemos') || line.startsWith('NIA ') || line.startsWith('“') || line === 'Que cada vez dependas más de ti.') ? 'is-emphasis' : ''}>{line}</p>)}</div>}
        </div>
      </motion.section></AnimatePresence>
    </div>
    <div className="premium-action"><button type="button" className="premium-cta" onClick={next}>{screen.cta}<ArrowRight size={18} aria-hidden="true" /></button></div>
  </main>;
}
