# SETUP-CLAUDE-CODE — Cómo aprovechar el paquete nativo de Claude Code

> Para ti, que NO eres técnico. Este SO ya viene "instalado" para Claude Code: al copiar la
> carpeta del SO a tu proyecto, todo lo de abajo funciona solo. Aquí te explico qué es cada cosa.

## 1. La carpeta `.claude/` — tus "botones"

Dentro del proyecto hay una carpeta oculta llamada `.claude/`. Contiene **slash commands**:
atajos que escribes en el chat de Claude Code empezando con `/`. En vez de pegar un prompt
larguísimo, escribes el comando y listo. Ejemplo: escribe `/arranque` y presiona Enter.

Después de la barra puedes agregar contexto: `/diseno app de hábitos para mamás ocupadas`.
Si no agregas nada, la IA lo deduce sola de ESTADO.md (la memoria del proyecto).

## 2. Los 29 comandos disponibles

| Comando | Qué hace |
|---|---|
| `/arranque` | Inicia todo: retoma el proyecto o arranca uno nuevo con la Primera Pregunta |
| `/retomar` | Vuelve donde quedaste: lee ESTADO.md y te dice el siguiente paso |
| `/auditoria` | Audita tu app completa y la eleva a 10/10 |
| `/diseno` | Sube el diseño a nivel de estudio premium (anti "look de IA") |
| `/onboarding-paywall` | Mejora el onboarding y la pantalla de pago para convertir más |
| `/rescate` | Rescata una app estancada (flujo + UX + seguridad) sin romperla |
| `/retencion` | Implementa rachas, XP y re-enganche para que la gente vuelva |
| `/landing` | Crea la página de ventas de alta conversión |
| `/embudo-chat` | Monta el embudo de chat (página propia que conversa con botones → Hotmart) adaptando la plataforma del curso |
| `/adquisicion` | Activa el motor de tráfico: afiliados Hotmart, ads, contenido, email |
| `/lanzamiento` | Prepara el lanzamiento en 5 fases + dunning y win-back |
| `/backoffice` | Construye tu panel de dueño: ventas, ganancia real, costo de IA |
| `/deploy` | Publica y certifica GitHub→Vercel + Supabase, dominio y actualizaciones sin compartir secretos |
| `/pre-lanzamiento` | Certificación final: veredicto APTO / NO APTO + CERTIFICADO /100 antes de cobrar |
| `/soporte` | Monta el sistema de soporte (email + WhatsApp, plantillas, SLA) que evita reembolsos |
| `/retener-ingresos` | Protege el ingreso que ya entró: cancelación retentiva, dunning, win-back |
| `/operacion-mensual` | Revisión mensual del negocio: diagnostica EL cuello de botella y propone 3 acciones |
| `/iteracion-feedback` | Convierte el feedback de los primeros clientes en máx. 3 mejoras priorizadas |
| `/contenido-semanal` | Genera el lote orgánico de la semana: 3-5 guiones short-form + 1 carrusel |
| `/precios` | Cambio de precio post-fundadores con grandfathering y superficies coordinadas |
| `/critica-expertos` | Panel de 4 expertos critica la app sin piedad (solo diagnóstico; ejecuta tras tu OK) |
| `/emails` | Monta todos los correos del negocio con prueba end-to-end real |
| `/velocidad` | Hace la app rápida en el celular real de LATAM (mide antes y después) |
| `/analitica` | Instrumenta funnel, atribución y retención, y los conecta al backoffice |
| `/legal` | Audita y perfecciona las páginas legales contra el 47 y el código real (pide solo los datos del responsable) |
| `/conversion` | Diagnóstico del funnel hasta el primer cobro (tráfico → onboarding → Hotmart → trial → cobro) |
| `/nueva-app` | Crea una app desde cero en CUALQUIER nicho (respuestas adelantadas, referencia visual opcional) |
| `/auditar-so` | (Uso interno) Revisa la coherencia del propio SO antes de reempacarlo |
| `/integridad-lanzamiento` | Gate binario: claims, auth, pagos, privacidad, IA, dinero y release trazable |

## 3. Los hooks — tus "guardianes automáticos"

En `.claude/hooks/` viven 5 scripts que Claude Code ejecuta SOLO, sin que tú hagas nada:

- **Al empezar cada sesión (o tras un resumen de conversación)**: le INYECTA a la IA el contenido
  de FICHA-ARTE.md (las decisiones de diseño de tu app: colores, fuentes, referencia que diste) y
  la tarjeta PREFLIGHT — así la IA no puede "olvidar" tu identidad visual entre sesiones.
- **Cada vez que edita código**: revisa al instante que el código TypeScript no tenga errores;
  si los hay, la IA los ve y los corrige antes de seguir.
- **Cada vez que edita una pantalla (linter de diseño)**: detecta automáticamente las huellas del
  diseño genérico (colores pegados fuera de los tokens, `transition: all`, Inter/Roboto como
  fuente, espaciados fuera de escala) y obliga a la IA a corregirlas en el momento.
- **Antes de "terminar"**: le impide a la IA declarar el trabajo listo si hay errores de código
  o si lleva horas sin actualizar ESTADO.md (su memoria).
- **Antes de "compactar"** (cuando la conversación se hace muy larga y se resume): le exige
  escribir un checkpoint en ESTADO.md ANTES de que se pierda el detalle.

No tienes que tocarlos. Si un guardián bloquea algo, la IA te lo explicará en simple.

> Nota: los hooks de verificación corren tsc incremental; en proyectos grandes la primera pasada tarda — es normal.

## 3B. El revisor visual — un "inspector independiente" para cada pantalla

En `.claude/agents/revisor-visual.md` vive un inspector con las rúbricas de calidad embebidas.
Cuando la IA termina una pantalla, NO se pone la nota a sí misma: lanza a este inspector, que
solo ve el screenshot a 375px (y tu imagen de referencia, si diste una) y devuelve el puntaje
y los defectos exactos a corregir. Si diste una referencia visual, el inspector además verifica
la FIDELIDAD: que lo construido de verdad se parezca a lo que pediste.

## 3C. EVIDENCIA Y GATES v6 — dónde vive la prueba de calidad

La calidad no se declara: se demuestra con ARCHIVOS que los guardianes verifican. La convención:

- **`docs/revisiones/`** — la evidencia visual del proyecto: por cada pantalla clave, su
  screenshot `docs/revisiones/<pantalla>-375.png` y su veredicto
  `docs/revisiones/<pantalla>-veredicto.md` (lo escribe EL INSPECTOR revisor-visual, nunca
  quien construyó). El screenshot de la comparativa de identidad va en
  `docs/revisiones/direcciones-abc.png`; el HTML `direcciones-abc.html` va en la raíz.
- **`docs/copy/`** — el copy marcado de cada pantalla de venta: `docs/copy/<pantalla>.md`
  (con `[acento]...[/acento]` y `[b]...[b]`), el input desde el que se construye la pantalla.
- En ESTADO.md la evidencia se cita con la línea canónica `revisor-visual: NN/40 · NN/20`.

Qué bloquea cada gate (en el guardián de cierre y en el pre-commit):
- **VEREDICTO**: una pantalla del dinero declarada construida sin su
  `docs/revisiones/<pantalla>-veredicto.md` con `Veredicto: LISTA` y ≥36/40 · ≥16/20 — o con
  un veredicto más viejo que el código de la pantalla (caducado: re-render + re-veredicto).
- **COMPARATIVA**: existe FICHA-ARTE.md sin `direcciones-abc.html` (raíz o historia de git).
- **COPY MARCADO**: landing construida sin `docs/copy/` con al menos un .md.
- **GARANTÍA (fail-closed)**: el copy menciona garantía sin FICHA-MERCADO.md legible con
  "Prueba elegida: N" y "Garantía elegida: M" con M>N — sin ficha, bloquea SIEMPRE.

Una violación solo deja cerrar si está documentada (grepeable) en la sección
"Problemas conocidos" de ESTADO.md.

Instalar el guardián de commits (una sola vez, en la raíz del proyecto):

```
mkdir -p .githooks && cp scripts/pre-commit-gates.sh .githooks/pre-commit && chmod +x .githooks/pre-commit && git config core.hooksPath .githooks
```

## 4. El MCP de Playwright — para que la IA VEA tus pantallas

La Regla de Oro 7 exige que la IA MIRE cada pantalla renderizada antes de declararla lista.
Para eso el proyecto incluye el archivo `.mcp.json`, que conecta un "navegador para la IA"
(Playwright): con él, la IA abre tu app, la ve a tamaño celular (375px), toma screenshots y
puntúa el diseño sobre lo que VE.

Cómo activarlo: la primera vez que abras Claude Code en el proyecto, te preguntará si apruebas
el servidor MCP "playwright". Di que sí. Eso es todo (necesita internet la primera vez para
descargarse).

⚠️ Importante: si NO apruebas o no funciona el MCP, el control visual queda **degradado** — la
IA solo podrá verificar el código, no cómo se ve la app, y te avisará que la verificación
visual quedó pendiente. Con el MCP activo, el ciclo de diseño es mucho más confiable.

## 5. Los scripts de `scripts/` (opcional, para mantenimiento)

- `scripts/audit-diseno.sh /ruta/de/tu/app` — revisión mecánica de diseño del proyecto ENTERO
  (colores fuera de tokens, espaciados fuera de escala, fuentes prohibidas, console.log).
  El linter automático del punto 3 revisa archivo por archivo al editarlo; este script hace
  la pasada completa (la IA lo corre en las auditorías y antes de vender).
- `scripts/release.sh` — solo para quien mantiene el SO: verifica la coherencia antes de reempacar.

## 5B. Conectores y secretos — qué sí autorizar

Los conectores de GitHub, Supabase y Vercel usan autorización del proveedor. Autorízalos cuando el
navegador muestre la cuenta y repositorio correctos; concede el mínimo acceso necesario. Conectar las tres
cuentas NO conecta automáticamente un repo GitHub con un proyecto Vercel: `/deploy` comprueba además
`Settings → Git → Connected Git Repository` y lo prueba con un segundo push.

Nunca pegues API keys, tokens, passwords, cookies, HOTTOK o connection strings en Claude/Codex. Cuando
`/deploy` necesite una variable, te indicará el panel exacto para introducirla y tú responderás solo
`configurada`. Si alguna clave se compartió, el agente debe detenerse y guiar su rotación.

## 5C. ¿Te alcanza tu plan? (el ritmo con un plan económico)

Si usas un plan mensual de ~$20 (con ventanas de uso que se renuevan solas), **sí te alcanza para
crear tu app completa** — trabajando por sesiones, no de un tirón. Las reglas simples:

```
· Haz UNA sesión del sistema por ventana de uso (la propia IA te va guiando sesión por sesión).
· Si aparece el aviso de que se acerca el límite: dile a la IA "cierra la sesión y guarda el
  avance". Ella deja todo anotado y NO SE PIERDE NADA.
· Cuando la ventana se renueve (unas horas después), escribe /retomar y sigues exactamente
  donde quedaste.
· Una app completa lista para vender toma varias sesiones repartidas en 1-2 semanas. Eso es
  lo normal — no es que "vayas lento".
· No le pidas a la IA "hazlo más rápido/simple para gastar menos": sale más caro, porque lo
  que sale a medias hay que rehacerlo. El sistema ya está optimizado para gastar donde importa.
```

(El detalle técnico del presupuesto — qué cuesta cada cosa y dónde ahorra la IA sin perder
calidad — vive en `12-FLUJO-AGENTICO.md`, «PRESUPUESTO DE TOKENS» y «EL RITMO DEL PLAN DE 20».)

## 6. ¿Y si algo no funciona?

Escríbele a Claude Code en el chat, en tus palabras: "el comando /diseno no aparece" o
"me salió un aviso raro al cerrar". La IA diagnostica y lo arregla — para eso está.
