'use client';

// KIT DE LANDING — EJEMPLO-page.tsx
// Página de referencia que compone las 10 secciones EN EL ORDEN CANÓNICO de 19
// con datos semilla de una app FICTICIA ("Despeja", productividad, mecanismo:
// "el Filtro de 3 Prioridades"). Muestra el uso del copy MARCADO ([acento]/[b]).
//
// PROHIBIDO COPIAR: los textos y nombres de este ejemplo son SEMILLA — en un proyecto real, TODO
// el copy sale de docs/copy/landing.md (marcado, trazado a FICHA-AVATAR.md) y
// los tokens de la FICHA-ARTE. Copiar este copy = fallo de trazabilidad (52).
//
// 'use client' aquí porque el ejemplo pasa íconos de Lucide como props (los
// componentes de función no cruzan la frontera server→client de RSC). En un
// proyecto real puedes mantener la página igual: la landing es interactiva.

import { AlarmClock, BatteryLow, Inbox, Repeat } from 'lucide-react';
import { Hero } from './Hero';
import { Problema } from './Problema';
import { Agitacion } from './Agitacion';
import { Solucion } from './Solucion';
import { AppPorDentro } from './AppPorDentro';
import { Oferta } from './Oferta';
import { Garantia } from './Garantia';
import { Faq } from './Faq';
import { CtaFinal } from './CtaFinal';
import { FooterLegal } from './FooterLegal';
import { StickyCtaMobile } from './ui';

// Modelo 2 (onboarding-first, default B2C de 02C): el CTA lleva a /onboarding,
// nunca al checkout desde el hero. Con Modelo 1, cambiar por el link de Hotmart.
const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Crear mi plan de mañana gratis';

export default function EjemploLandingDespeja() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* 1. HERO — copy marcado: bold completo + la palabra que vende en [acento] */}
      <Hero
        appName="Despeja"
        loginHref="/entrar"
        h1Marked="Vuelca tu caos y empieza con [acento]3 prioridades claras[/acento]"
        subtitleMarked="El Filtro de 3 Prioridades ordena tu mañana [b]en 3 minutos[/b]"
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span>Garantía Hotmart de 7 días — sin preguntas</span>}
        visualPlaceholderSugerencia="captura del plan del día con las 3 prioridades ya generadas"
      />

      {/* 2. PROBLEMA — preguntas con ícono de dolor (elevado, abre el bloque 2-3) */}
      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: Inbox, textoMarked: '¿Tu lista tiene 40 tareas y [b]ninguna decidida[/b]?' },
          { icon: AlarmClock, textoMarked: '¿Empiezas el día respondiendo correos que no importan?' },
          { icon: Repeat, textoMarked: '¿Replanificas todo cada vez que algo se atrasa?' },
          { icon: BatteryLow, textoMarked: '¿Llegas a la noche sin saber qué avanzaste?' },
        ]}
      />

      {/* 3. AGITACIÓN — mismo fondo elevado que 2 (un solo movimiento visual) */}
      <Agitacion
        frases={[
          'Cada semana pierdes [b]5 horas[/b] solo decidiendo por dónde empezar.',
          'En 6 meses, ese caos suma [acento]130 horas[/acento] que no vuelven.',
          'Otra lista de tareas no lo arregla: [b]más lista no es más claridad[/b].',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: '47 tareas abiertas y la sensación de no avanzar.',
          labelFuturo: 'En 6 meses, si nada cambia',
          futuro: 'El mismo caos — con 6 meses menos.',
        }}
      />

      {/* 4. SOLUCIÓN — mecanismo bautizado + 3 pasos + antes/después */}
      <Solucion
        tituloMarked="Tu día decidido [acento]antes del primer café[/acento]"
        mecanismo="el Filtro de 3 Prioridades"
        bigIdeaMarked="No te faltan horas: te sobra lista. El Filtro elige por ti las [b]3 tareas que mueven tu semana[/b]."
        pasos={[
          { titulo: 'Vuelca todo', detalle: 'Escribe o dicta tu caos tal como sale.' },
          { titulo: 'El Filtro decide', detalle: 'Cruza urgencia real con impacto y descarta el ruido.' },
          { titulo: 'Empiezas', detalle: 'Recibes 3 prioridades con su bloque de tiempo.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Una lista de 47 tareas sin orden ni dueño.',
          labelDespues: 'Después',
          despues: '3 prioridades con su bloque de tiempo, listas a las 8:03.',
        }}
      />

      {/* 5. LA APP POR DENTRO — placeholders honestos hasta tener screenshots
          reales (pendiente que se anota en ESTADO.md) + CTA mid-page */}
      <AppPorDentro
        tituloMarked="Tu mañana, [acento]ya decidida[/acento]"
        frames={[
          { label: 'Tu primer volcado', nombrePantalla: 'Onboarding' },
          { label: 'Tus 3 prioridades de hoy', nombrePantalla: 'Plan del día' },
          { label: 'Replanifica en un tap', nombrePantalla: 'Replan' },
          { label: 'Tu patrón de la semana', nombrePantalla: 'Reporte semanal' },
        ]}
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
      />

      {/* 6. OFERTA — anual PRIMERO, trial en ambas (N=7 de 02C), total visible */}
      <Oferta
        tituloMarked="Empieza gratis. Sigue por [acento]$0.17 al día[/acento]"
        trialDias={7}
        stack={{
          lineas: [
            { resultado: 'Despeja Pro con el Filtro de 3 Prioridades (12 meses)', valor: '$120' },
            { resultado: 'Plantilla «Semana Real» para imprevistos', valor: '$29' },
            { resultado: 'Guía «Primeros 30 días de foco»', valor: '$19' },
          ],
          totalTachado: '$168',
          nota: 'Hoy: $4.99/mes (se cobra $59.90/año)',
        }}
        anual={{
          nombre: 'Anual',
          badge: 'MÁS POPULAR',
          precioMes: '$4.99',
          totalAnual: 'Se cobra $59.90/año',
          ahorro: '2 meses gratis',
          descomposicionDia: 'menos de $0.17 al día',
          ctaLabel: 'Empezar mis 7 días gratis',
          ctaHref: CTA_HREF,
          features: [
            'Tu plan de 3 prioridades cada mañana',
            'Replan ilimitado cuando el día cambie',
            'Historial para ver qué postergas',
            'Reporte semanal de foco',
          ],
        }}
        mensual={{
          nombre: 'Mensual',
          precioMes: '$5.99',
          ctaLabel: 'Elegir mensual',
          ctaHref: CTA_HREF,
          features: [
            'Tu plan de 3 prioridades cada mañana',
            'Replan ilimitado cuando el día cambie',
            'Historial para ver qué postergas',
            'Cancelas cuando quieras',
          ],
        }}
      />

      {/* 7. GARANTÍA — nombre propio + condición concreta + piso Hotmart */}
      <Garantia
        nombre="la Garantía del Primer Día Claro"
        condicionMarked="Si en 7 días el Filtro no te entrega un día con [b]3 prioridades claras[/b], escribes un correo y te devolvemos todo. Sin preguntas."
        pisoLegal="Respaldada por la garantía Hotmart de 7 días"
      />

      {/* 8. FAQ — las objeciones de la ficha, la #1 abierta por defecto */}
      <Faq
        items={[
          {
            pregunta: '¿Necesito aprender otro sistema de productividad?',
            respuestaMarked:
              'No: escribes tu caos como sale y [b]el Filtro hace el resto[/b]. Sin métodos que memorizar.',
          },
          {
            pregunta: '¿Y si mi día cambia a mitad de mañana?',
            respuestaMarked:
              'Tocas Replanificar y el Filtro reordena tus prioridades en segundos — sin culpa ni empezar de cero.',
          },
          {
            pregunta: '¿Por qué no usar una lista de tareas gratis?',
            respuestaMarked:
              'Una lista guarda tareas; el Filtro [b]decide cuáles importan hoy[/b]. Esa decisión es lo que te falta.',
          },
          {
            pregunta: '¿Cuánto tardo en ver resultados?',
            respuestaMarked:
              'Tu primer plan sale en 3 minutos. La primera semana ya ves tu patrón de foco.',
          },
          {
            pregunta: '¿Qué pasa si no me sirve?',
            respuestaMarked:
              'Tienes 7 días de prueba y la Garantía del Primer Día Claro: [b]un correo y te devolvemos todo[/b].',
          },
        ]}
      />

      {/* 9. CTA FINAL — invertido, mismo verbo del hero, PS al cierre */}
      <CtaFinal
        h2Marked="Imagina tu mañana [acento]ya decidida[/acento]"
        futurePacingMarked="Mañana te sientas, vuelcas el caos, y a los 3 minutos empiezas — sin negociar contigo."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="Garantía del Primer Día Claro · 7 días gratis"
        psMarked="PS: Despeja convierte tu lista infinita en 3 prioridades diarias con el Filtro de 3 Prioridades. Hoy entras con 7 días gratis y la Garantía del Primer Día Claro."
      />

      {/* 10. FOOTER LEGAL — todas las páginas enlazadas deben EXISTIR (47) */}
      <FooterLegal
        appName="Despeja"
        soporteEmail="soporte@despeja.app"
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
          { label: 'Aviso de IA', href: '/aviso-ia' },
        ]}
      />

      {/* Transversal T2: sticky CTA mobile — observa #hero, #oferta y #cta-final */}
      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
    </div>
  );
}
