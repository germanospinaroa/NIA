# REPORTE DE PRUEBA SECA — Conversion v5.5.0

> ⚠️ FE DE ERRATAS (v5.9.0): la línea 'No quedan decisiones comerciales basadas en el antiguo 15-25' era incorrecta en el momento de emitirse — CLAUDE.md conservó ese rango hasta v5.9.0, donde se sincronizó a la doctrina 4-8/9-20 de 02B.

Fecha: 2026-07-21

## Objetivo

Comprobar que el SO toma decisiones correctas en una app nueva y en una app B2C con trafico pero
sin ventas, sin saltar directamente a reescribir copy.

## Escenario A — App nueva onboarding-first

Entrada simulada:
- utilidad B2C con personalizacion ligera;
- Hotmart con plan mensual/anual y trial;
- no se conoce el email antes del checkout;
- trafico principal desde TikTok/Instagram.

Resultado esperado y observado al ejecutar el ruteo/documentos:

| Gate | Resultado |
|---|---|
| CTA de landing | `/onboarding` anonimo, no registro obligatorio |
| Onboarding | 4-8 pasos iniciales; una pregunta por pantalla |
| Paywall | short-form, max 3 beneficios y 2 planes |
| Hotmart | directo, URL `off` + `showOnlyTrial=1` + `sck`; sin email previo |
| Analitica | vista real, checkout, trial y primer cobro separados |
| Operacion | panel de conversion y QA disponibles antes del trafico |

Veredicto: PASA. No quedan decisiones comerciales basadas en el antiguo numero objetivo de 15-25.

## Escenario B — App tipo Abunda con fuga pre-checkout

Entrada simulada (seis sesiones de alta intencion):
- 6 completan onboarding y llegan al resultado;
- 6 renderizan la ruta del paywall, 4 ven realmente la oferta;
- una captura de email aparece antes de Hotmart;
- 1 completa el email y sale al checkout;
- Hotmart confirma 1 trial $0, 0 primeros cobros;
- 2 pruebas internas estan marcadas QA.

Diagnostico que debe producir `/conversion`:
1. Excluir las 2 sesiones QA completas.
2. No usar 6 como denominador de `paywall_visto`; usar las exposiciones reales limpias.
3. Identificar el email previo como primera friccion demostrable de alta intencion.
4. Quitar el peaje y abrir Hotmart directo; no rehacer primero el hero.
5. Contar 1 trial y 0 cobros; nunca presentar el trial $0 como venta.
6. Verificar URL/trial/moneda/webhook y medir el nuevo `checkout_iniciado`.

Veredicto: PASA. La matriz de `60`, el prompt y los contratos de `18`/`36` conducen al mismo arreglo.

## Pruebas estructurales

Ejecutar antes del ZIP:

```bash
bash scripts/audit-so.sh
bash scripts/release.sh /ruta/a/Prompts-complementarios
```

Criterios: AGENTS=CLAUDE, JSON valido, shell valido, referencias/fences/ruteo limpios, comandos
canonicos presentes, hooks sin Python y prompts sin reglas comerciales obsoletas.

## Riesgo residual

El SO reduce errores repetibles, pero no garantiza ventas. Demanda, calidad del trafico, precio,
confianza, medios de pago y valor del producto siguen necesitando evidencia propia.
