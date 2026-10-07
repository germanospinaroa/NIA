import { LegalPage } from '@/components/funnel/LegalPage';
import Link from 'next/link';

export const metadata = { title: 'Términos — NIA', description: 'Condiciones de uso del servicio NIA.' };

export default function TermsPage() {
  return <LegalPage eyebrow="INFORMACIÓN" title="Términos" intro="Estos términos explican, en lenguaje sencillo, qué es NIA y qué puedes esperar al usarla.">
    <section><h2>Qué es NIA</h2><p>NIA es un servicio digital que ofrece apoyo personalizado e informativo para ayudarte a observar lo que quieres trabajar y practicar respuestas más alineadas con tu propio criterio. NIA no es terapia, diagnóstico ni atención de emergencia de salud mental. Si estás en una emergencia, busca ayuda local inmediata.</p></section>
    <section><h2>Tu responsabilidad</h2><p>NIA puede ofrecer preguntas, ideas, distinciones o acciones concretas para probar. Tú decides qué hacer y eres responsable de tus decisiones y acciones. No debes usar NIA como sustituto de atención profesional o de servicios de emergencia.</p></section>
    <section><h2>Cuenta y WhatsApp</h2><p>Debes mantener actualizados tus datos de acceso y usar tu cuenta de forma personal. Los mensajes de WhatsApp dependen de la disponibilidad y funcionamiento de WhatsApp y de los proveedores de mensajería; por eso no se garantiza que cada mensaje llegue en todo momento.</p></section>
    <section><h2>Planes y renovación</h2><p>NIA ofrece un plan mensual de US$4.99 al mes y un plan anual de US$49.99 al año. Ambos incluyen una prueba gratuita de 7 días según la oferta activa. Si no cancelas antes de que termine la prueba, el plan se renueva automáticamente con la periodicidad elegida. El pago y la suscripción se gestionan a través de Hotmart.</p></section>
    <section><h2>Cancelación y disponibilidad</h2><p>Puedes solicitar la cancelación desde tu cuenta. Consulta <Link href="/cancelacion">Cómo cancelar</Link> para ver los pasos y cómo se muestra tu fecha de acceso. El servicio puede tener interrupciones, mantenimiento o cambios necesarios para mantenerlo seguro y útil.</p></section>
    <section><h2>Uso aceptable y cambios</h2><p>No uses NIA para vulnerar derechos, acosar, intentar acceder a cuentas ajenas o interferir con el servicio. Podemos actualizar funciones o estos términos cuando sea necesario; cuando el cambio sea relevante, lo comunicaremos de una forma razonable.</p></section>
  </LegalPage>;
}
