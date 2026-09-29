# REPORTE DE PRUEBA SECA DEL SO

Fecha: 2026-07-02
Objetivo: verificar que el Sistema Operativo ya no empuja al agente a construir una app interna
prematura y que obliga la secuencia vendible correcta.

---

## Veredicto

APTO con correcciones aplicadas.

El SO ahora tiene una regla canonica y varios puntos de control que fuerzan:

```
pagina de ventas -> onboarding -> paywall -> login/auth -> app interna -> servicios externos
```

La app no debe retomarse desde dashboard ni desde IA/Supabase/Vercel. Debe retomarse desde pagina
de ventas.

---

## Escenarios simulados

### Escenario 1 - Usuario dice: "procede con la primera version"

Respuesta esperada del agente:
- Lee `SECUENCIA-MAESTRA-CONSTRUCCION.md`.
- No crea `/app` ni dashboard.
- Presenta/ejecuta primero la pagina de ventas.
- Explica que onboarding, paywall y login vienen antes de la app interna.

Resultado: pasa.

### Escenario 2 - Usuario dice: "crea el MVP"

Respuesta esperada del agente:
- Traduce MVP como camino completo de venta y activacion.
- No interpreta MVP como una pantalla con input + resultado.
- Verifica landing/onboarding/paywall/login antes de app interna.

Resultado: pasa.

### Escenario 3 - Usuario pide: "conecta Supabase y Vercel"

Respuesta esperada del agente:
- Si la experiencia aun no esta aprobada, avisa que servicios externos vienen despues.
- No conecta Supabase/Vercel/Hotmart antes de ventas/onboarding/paywall/login/app interna.
- Solo avanza a integraciones en la Sesion 6 nueva.

Resultado: pasa.

### Escenario 4 - Agente intenta construir una pestaña Plan con muchas cosas

Respuesta esperada del SO:
- `DESIGN-CORE.md` y `SECUENCIA-MAESTRA` frenan la densidad.
- Cada seccion debe tener 1 protagonista y maximo 2 secundarios.
- Historial y Semana no pueden repetir el mismo trabajo.

Resultado: pasa.

### Escenario 5 - Compactacion de contexto / nueva sesion

Respuesta esperada del agente:
- Lee `ESTADO.md`.
- Ve que la app esta pausada.
- Retoma desde pagina de ventas, no desde IA real ni Supabase.

Resultado: pasa.

---

## Fugas detectadas durante la prueba

1. `12-FLUJO-AGENTICO.md` aun usaba "pantalla core" como paso generico.
   - Correccion: ahora divide por secuencia maestra y habla de "pantalla de la etapa".

2. `06-TESTING.md` aun tenia checklist de primer uso con "pantalla core".
   - Correccion: ahora prueba landing, onboarding, preview, paywall, login y app interna.

3. `04-ARQUITECTURA.md` aun mostraba mapa con "pantalla core".
   - Correccion: ahora define app interna con secciones y protagonistas.

4. `05-CREACION.md` aun cerraba fase con "pantalla core genera resultados".
   - Correccion: ahora exige la secuencia completa.

5. `36-ANALITICA-Y-EVENTOS.md` tenia referencias de sesion viejas.
   - Correccion: ahora habla de instrumentar donde nace la accion de valor, sin amarrarlo a sesion vieja.

6. `38-PERFORMANCE-BUDGET.md` hablaba de "pantalla core" como primer valor.
   - Correccion: ahora habla de promesa, onboarding y primera pantalla de valor.

---

## Checks ejecutados

- `CLAUDE.md` y `AGENTS.md` identicos: OK.
- Referencias a docs/prompts: OK.
- Fences Markdown balanceados: OK.
- Docs numerados en tabla de ruteo: OK.
- Busqueda de frases viejas de plan: OK.
- Busqueda de "pantalla core": solo quedan menciones como anti-patron explicito.

---

## Riesgo residual

El SO ahora esta mucho mas blindado, pero aun depende de que el agente obedezca la regla de leer
los archivos correctos antes de actuar. Para reducir ese riesgo se agrego:

- Regla Cero en `CLAUDE.md` y `AGENTS.md`.
- Gate de secuencia en `CHECKLIST-CIERRE.md`.
- Campos de secuencia en `PLANTILLA-ESTADO.md`.
- Nueva fuente canonica `SECUENCIA-MAESTRA-CONSTRUCCION.md`.

---

## Siguiente paso recomendado

Retomar el producto solo desde la nueva Sesion 3:

```
Pagina de ventas de Foco Diario AI
```

No conectar servicios externos todavia.
