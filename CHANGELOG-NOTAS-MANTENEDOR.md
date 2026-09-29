# CHANGELOG — NOTAS DE MANTENEDOR (interno)

> Meta-documentación del mantenimiento del SO. **NO se carga en sesiones normales de construcción** — es historial de cómo se integraron cambios entre documentos. El changelog de cara al usuario es `CHANGELOG.md`.

---

## 2026-08-03 — v5.9.0: el gran pase de sincronización

- Causa raíz confirmada por auditoría externa (5 revisores especializados): la doctrina se replica
  a mano en 15-50 archivos y las fotocopias divergen — en 5.8.0 convivían 3 reglas de onboarding,
  2 doctrinas de color y 2 políticas del revisor, dentro de un ZIP certificado "0 fallos" porque
  los guardianes verificaban estructura, no semántica.
- Remedio estructural: (1) toda contradicción se resolvió con UNA doctrina ganadora declarada antes
  de editar (los editores no deciden — ejecutan); (2) `MAPA-DE-AUTORIDAD.md` deja la precedencia
  escrita; (3) el GUARDIÁN SEMÁNTICO de `audit-so.sh` convierte cada doctrina migrada en un grep —
  regla nueva de mantenimiento: cambio de doctrina sin grep = cambio no propagado (ya cazó 3
  residuos durante esta misma integración).
- Lección de proceso: 36 releases en 6,5 semanas superaron el mantenimiento manual. Congelar la
  cadencia tras este release hasta que el guardián lleve 2-3 versiones estable.
- Verificación de plataforma: los hechos de Hotmart (SWITCH_PLAN, carrito abandonado nativo,
  PIX/boleto sin auto-cobro, formatos aceptados) se verificaron contra la Central de Ayuda y la
  doc de developers — regla para el futuro: toda afirmación sobre una plataforma externa lleva
  verificación con fecha, igual que los números de FICHA-MERCADO.

- Hallazgo causal: una captura obligatoria de email antes de Hotmart puede destruir intencion alta;
  el default ahora es paywall -> checkout directo, con email solo si ya se conoce.
- Corregido el modelo de datos comercial: render no es vista, trial $0 no es venta y un boleto
  pendiente/expirado no es cobro.
- El benchmark deja de convertirse en receta: onboarding y paywall empiezan cortos y se expanden
  con datos propios.
- Release gate ampliado con `scripts/audit-so.sh`; hooks migrados de Python a Node.

---

## 2026-07 — Fase growth del plan de mejora (34/35, prompts de operación recurrente)

- `34`: nueva sección PÍXEL Y CAPI EN HOTMART (gate: sin píxel verificado no se lanza paid), sección WHATSAPP (difusión, click-to-WhatsApp ads, soporte-preventa, src `wa_*`), TikTok SEO + carruseles/photo-mode, rangos CPM/CPC/CPA por país (referencia 2026, verificar), nota de monedas → 39, PASO 6 de gestión de afiliados, comisión alineada al default del 40 (30-40% recurrente, o 50% solo 1ª venta), prerrequisito 46+47 en nurturing.
- `35`: corregida la "pausa en vez de baja" (la facturación la controla Hotmart — un flag en Supabase NO detiene el cobro; ahora ofrece descuento vía cupón / cancelar + cupón de regreso con fecha / pausa solo-de-acceso con aviso honesto), checklist de lanzamiento día-a-día D-14→D+7, prerrequisito 46+47 antes de la secuencia de emails, NOTAS DE INTEGRACIÓN movidas a este archivo (abajo).
- Solape de retención resuelto: `PROMPT-RETENCION.txt` = que VUELVAN a usarla (hábito/gamificación, archivo 24); nuevo `PROMPT-RETENER-INGRESOS.txt` = que no cancelen ni fallen los pagos (cancelación/dunning/win-back/renovación anual, archivo 35). `PROMPT-LANZAMIENTO.txt` ya no cubre ese bloque — remite al nuevo.
- Prompts nuevos del ciclo post-lanzamiento (+ comandos gemelos en `.claude/commands/`): `PROMPT-OPERACION-MENSUAL.txt`, `PROMPT-ITERACION-FEEDBACK.txt`, `PROMPT-SOPORTE.txt`, `PROMPT-CONTENIDO-SEMANAL.txt`, `PROMPT-PRECIOS.txt`, `PROMPT-RETENER-INGRESOS.txt`.
- `PROMPT-NUEVA-APP-FITNESS.txt` reescrito: la imagen "Kalo" (que no viene en el paquete) pasa a referencia OPCIONAL; toda extracción de referencia pasa la Capa Anti-IA del 16 (si la referencia ES el cliché neón+dark, se toma la estructura y se rederiva el color). Comando gemelo `nueva-app-fitness.md` creado.
- Nueva `GUIA-DE-LOS-PROMPTS.md` en `docs/sistema/` (reemplaza la guía Word): diagrama del ciclo de vida, ficha por prompt, tabla situación→botón.
- (RESUELTO) El MENÚ DE PROMPTS de `CLAUDE.md`/`AGENTS.md` ya incluye los comandos nuevos del ciclo post-lanzamiento.

---

## Notas de integración originales de 34/35 (movidas desde `35-LANZAMIENTO-Y-RETENCION.md`)

Esto documenta cómo los dos docs nuevos (`34`, `35`) y los dos bloques se insertaron en el sistema. Es meta-documentación; no se carga en una sesión normal de construcción.

### Anclajes exactos aplicados
```
EN 21-BACKOFFICE.md:
  - Nueva sección "MÉTRICAS DE NEGOCIO — LTV, CAC y la economía que decide la inversión"
    insertada JUSTO ANTES de "## CÓMO SE IMPLEMENTA (resumen técnico)".
    Contenido: LTV, CAC, ratio LTV:CAC, payback, conversión trial→pago, churn voluntario vs
    involuntario, atribución por canal; cómo calcularlas con Hotmart + Supabase; tablas
    acquisition_spend + profiles.source; por qué sin CAC no se decide inversión en ads.
  - Checklist ampliado con 3 líneas (métricas de negocio, churn separado, tablas de soporte).

EN 02-VALIDACION.md:
  - Nuevo "## Paso 0: GATE DE VALIDACIÓN DE DEMANDA" insertado JUSTO ANTES de
    "## Paso 1: Test de Viabilidad (5 preguntas críticas)" — va PRIMERO porque bloquea la
    construcción. Dos rutas: A) fake-door/landing de pre-orden (≥3-5 pagos), B) 5 entrevistas
    JTBD con Van Westendorp ligero (≥4/5 con WTP viable). Incluye Ficha del Gate.
  - "Criterios de Salida de Fase 1" ahora abre con el gate como primer ítem obligatorio.
```

### Qué referencian los docs nuevos hacia 18 y 19 (sin duplicar)
```
- 34 reusa la infraestructura RESEND de 18 (mismo RESEND_API_KEY, dominio verificado, lib/email.ts)
  para el nurturing — NO monta un proveedor de email nuevo. Activa la afiliación sobre el mismo
  producto Hotmart de 18. Manda TODO el tráfico a la landing de 19 (su checklist es prerequisito).
- 35 opera el DUNNING sobre el estado `past_due` y la máquina de estados (past_due→active) del
  webhook de 18; bumps/upsells se procesan por event_id (idempotencia de 18). Oferta de fundadores,
  bumps y prueba social se expresan en la landing/copy de 19 (sin falsa escasez ni dark patterns).
```

### Prompts .txt nuevos que conviene crear (acompañan estos docs, formato de los PROMPT-*.txt existentes)
```
- PROMPT-ADQUISICION.txt  → dispara el archivo 34: activar afiliados + generar el KIT de afiliados,
  el plan de contenido/SEO, los guiones de ads UGC y la secuencia de nurturing. (CREADO.)
- PROMPT-LANZAMIENTO.txt   → dispara el archivo 35: playbook de las 5 fases + emails de lista de
  espera y ventana de carrito + brief de afiliados para la ventana. (CREADO.)
- (Resuelto en jul-2026: el flujo de cancelación/dunning/win-back del archivo 35 vive ahora en
  PROMPT-RETENER-INGRESOS.txt; PROMPT-RETENCION.txt sigue cubriendo la retención del PRODUCTO
  del archivo 24.)
```

### Índices a actualizar (HECHO)
```
- INICIO.md, REFERENCIA-RAPIDA.md, 00-SISTEMA-MAESTRO.md: 34 y 35 YA están en el mapa de archivos
  (fase de venta/post-venta, después de 19 y 21). 34 = motor de adquisición; 35 = picos + retener.
```
