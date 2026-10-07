import { LegalPage } from '@/components/funnel/LegalPage';
import Link from 'next/link';

export const metadata = { title: 'Privacidad — NIA', description: 'Cómo NIA trata la información necesaria para prestar el servicio.' };

export default function PrivacyPage() {
  return <LegalPage eyebrow="INFORMACIÓN" title="Privacidad" intro="NIA trata la información necesaria para darte el servicio, personalizarlo y mantener tu cuenta funcionando con claridad y seguridad.">
    <section><h2>Qué información podemos tratar</h2><p>Podemos tratar los datos de tu cuenta, como tu nombre, apellido, nombre preferido y correo electrónico; tu número de WhatsApp cuando decides conectarlo; tus respuestas de onboarding; tus preferencias y configuración; el estado de tu suscripción y acceso que recibimos de Hotmart; y registros operativos necesarios para prestar el servicio, atender soporte, prevenir errores y mantener la seguridad.</p></section>
    <section><h2>Para qué la usamos</h2><p>Usamos esta información para darte acceso a NIA, recordar lo que quieres trabajar, adaptar la experiencia, enviarte los mensajes de WhatsApp que solicitas, administrar tu cuenta y suscripción, responder soporte y mantener la fiabilidad operativa del servicio.</p></section>
    <section><h2>Pagos y proveedores</h2><p>Hotmart procesa el pago y la información de tarjeta. NIA recibe información de suscripción y acceso necesaria para administrar tu cuenta, pero no pretende almacenar los datos completos de tu tarjeta. La aplicación se apoya en servicios técnicos de alojamiento, autenticación, base de datos, mensajería y generación de contenido para operar las funciones que solicitas.</p></section>
    <section><h2>Tu control</h2><p>Puedes revisar o cambiar la información de tu cuenta desde <Link href="/app/tu">Tú</Link>. Si necesitas ayuda con tu cuenta, puedes escribirnos desde <Link href="/app/tu#soporte">Soporte</Link>. No incluimos tus respuestas psicológicas, intervenciones ni historial privado en una solicitud de soporte automáticamente.</p></section>
    <section><h2>Cambios</h2><p>Podemos actualizar esta información cuando cambie el servicio o sea necesario explicar mejor cómo funciona. La versión publicada en esta página es la vigente.</p></section>
  </LegalPage>;
}
