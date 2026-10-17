# Auditoría del funnel NIA y base de `emotional_v3`

Fecha del corte: 2026-10-17 · Production consultada: `https://nia.gritlab.pro` · variante pública observada: `emotional_v2`.

## A. Diagnóstico actual

### Comercial

- La secuencia actual es larga y narrativa: reconocimiento abstracto → reencuadre → deseo → nombre → demo → testimonios → planes.
- La primera pantalla pide identificarse con una tesis amplia (“puede con todo”) antes de mostrar una situación concreta. Eso puede retrasar el reconocimiento inmediato.
- La demo actual muestra un mensaje valioso, pero llega después de varias pantallas sin una elección explícita de la usuaria. La nueva variante debe demostrar adaptación a una respuesta real.
- Los testimonios actuales son imágenes de conversaciones; el código no contiene metadatos de autorización o distinción entre experiencia real y ejemplo ilustrativo. `emotional_v3` usa explicación transparente del servicio hasta contar con evidencia auditable.
- La oferta actual comunica precios reales de Production: mensual US$4.99 con referencia US$6.99 y anual US$49.99, ambos con 7 días gratis. La variante no inventa descuentos, escasez ni garantías.

### Visual y UX

- Production se siente editorial y coherente con la Ficha de Arte, pero la primera pantalla tiene mucho copy antes de la primera decisión.
- La maqueta de WhatsApp es legible y consistente, pero debe etiquetarse explícitamente como ejemplo para no sugerir una captura real ni conversación ilimitada.
- La pantalla de planes existente tiene transparencia razonable, aunque la decisión de compra aparece tarde y el CTA no expresa todavía el beneficio diferencial de continuidad.
- La dirección visual aprobada se conserva: marfil/carbón/copper, Fraunces + Instrument Sans, transición clara/oscura y movimiento sobrio.

### Técnica

- `/` sirve `PremiumDiscover` con `PUBLIC_DISCOVER_FUNNEL_VERSION = emotional_v2`.
- El estado durable y el estado de navegación de v2 están mezclados con su contrato histórico; no se reutilizan para v3.
- `emotional_v3` ahora tiene estado y tracking propios en `lib/funnel-v3.ts`, y rutas aisladas en `/descubre/v3` y `/descubre/v3/planes`.
- El checkout sigue siendo el oficial de `lib/hotmart-checkout.ts`; ningún secreto ni habilitación de acceso se mueve al navegador.

### Medición

- La línea base histórica entregada por el equipo es: 81 sesiones, 72 recognition, 30 pattern, 28 desire, 24 personalize, 18 demo, 16 testimonials, 17 plans y 2 checkout.
- No fue posible leer el agregado actual de `funnel_events` desde este workspace sin credencial/conector de consulta a Production. Por eso esos números se conservan como línea base histórica y no se presentan como corte actualizado.
- La consulta pública del 2026-10-17 confirmó HTML 200, raíz `emotional_v2`, `/descubre` 200, `/descubre/planes` 200 y `/api/funnel/events` protegido para GET (405).
- QA de navegador read-only en Production, 375×812 y 1440×900: sin errores de consola ni fallos de red en la raíz; las seis pantallas v2 se recorren. El clic final necesita una espera de navegación específica y no se usó ningún checkout mutante.

## Riesgos que bloquean una conclusión comercial

1. No hay compras confirmadas disponibles en este corte; el KPI principal sigue sin medirse en este entorno.
2. El proveedor de pagos sigue siendo la fuente de verdad de compra; el navegador solo puede registrar `checkout_started`.
3. `emotional_v3` todavía no debe exponerse a tráfico real ni considerarse ganador sin preview, QA y activación controlada.
