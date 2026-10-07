import { LegalPage } from '@/components/funnel/LegalPage';
import Link from 'next/link';

export const metadata = { title: 'Cancelación — NIA', description: 'Cómo cancelar tu suscripción de NIA.' };

export default function CancellationPage() {
  return <LegalPage eyebrow="TU SUSCRIPCIÓN" title="¿Cómo cancelo?" intro="Puedes gestionar la cancelación directamente desde tu cuenta de NIA.">
    <section><h2>Pasos</h2><ol><li>Entra a <Link href="https://nia.gritlab.pro/app/tu">nia.gritlab.pro/app/tu</Link>.</li><li>Abre la sección <strong>Tú</strong>.</li><li>En <strong>Tu plan</strong>, selecciona <strong>Cancelar suscripción</strong>.</li></ol></section>
    <section><h2>Qué ocurre después</h2><p>La prueba gratuita se renueva automáticamente si no la cancelas antes de que termine. El plan mensual se renueva cada mes y el anual cada año. Si cancelas durante la prueba antes del primer cobro, no debería producirse ese primer cobro recurrente según las condiciones de la oferta activa.</p><p>Después de solicitar la cancelación, conservarás el acceso hasta la fecha de acceso que aparezca en tu cuenta. Esa fecha refleja el estado real de tu suscripción.</p></section>
    <section><h2>¿Necesitas ayuda?</h2><p>Si algo no funciona como esperas, entra a <Link href="/app/tu#soporte">Tú → Soporte</Link> y envíanos un mensaje.</p></section>
  </LegalPage>;
}
