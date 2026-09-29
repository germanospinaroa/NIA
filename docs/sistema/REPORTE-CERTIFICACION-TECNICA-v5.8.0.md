# REPORTE DE CERTIFICACIÓN TÉCNICA — SO v5.8.0

> Evidencia de que el paquete v5.8.0 es coherente, no rompe lo anterior y se reconstruye desde el
> ZIP. Se genera ejecutando `scripts/test-integridad.mjs` contra la versión anterior como línea base.
>
> **Cómo se reproduce:**
> ```bash
> SO_BASELINE=<ruta a SO-apps-v5.7.0> \
> SO_BASELINE_ZIP=<ruta al ZIP de v5.7.0> \
> SO_ZIP=<ruta al ZIP de v5.8.0> \
> node scripts/test-integridad.mjs
> ```

## Qué certifica esta versión

**Alcance:** v5.8.0 convierte los hallazgos de una construcción real end-to-end (app educativa con
IA, tráfico pago, primera venta) en reglas universales, **sin cambiar el flujo del SO**.

**Restricción de diseño auto-impuesta y verificada:** todo entra dentro de los archivos que ya
existían. No se reordenan fases, no se renombran comandos, no se tocan las 7 Reglas de Oro y no se
elimina ningún archivo. Un único archivo nuevo: `PLANTILLA-FICHA-MERCADO.md`.

## Resultados

| Bloque | Resultado |
|---|---|
| Auditoría estructural de la versión anterior (línea base) | OK |
| Release check de la línea base | OK |
| ZIP de la línea base extrae y pasa su auditoría | OK |
| v5.8.0 pasa auditoría estructural | OK |
| **v5.8.0 no elimina ningún archivo de la versión anterior** | OK |
| Mutaciones deliberadas rechazadas (fences, referencias, ruteo, comandos, secretos) | OK |
| ZIP sin metadatos `__MACOSX` | OK |
| ZIP contiene los archivos obligatorios | OK |
| ZIP extrae y el SO extraído pasa su propia auditoría | OK |

## Verificaciones adicionales de esta versión

Además de la suite, se comprobó a mano contra el paquete anterior:

```
[x] Ningún archivo borrado (comparación de árbol completo)
[x] Ninguna sección eliminada: las únicas líneas reescritas son las 7 de la Regla de Oro 3
[x] Las 7 Reglas de Oro siguen siendo 7 y en el mismo orden
[x] CLAUDE.md y AGENTS.md idénticos entre sí (regla del sistema)
[x] Los 5 hooks con sintaxis de shell válida
[x] Bloques de código balanceados en los 116 .md
[x] Cero encabezados perdidos en los 12 documentos modificados
[x] Todas las referencias entre documentos resuelven
```

## Cambios en los propios scripts de certificación

- `scripts/audit-so.sh`: `FICHA-MERCADO.md` se registra como **artefacto generado por la app**, igual
  que `ESTADO.md`, `FICHA-ARTE.md` y `FICHA-AVATAR.md`. Sin esto, el release check la reportaba como
  referencia rota — correctamente, porque no existe dentro del paquete: la crea el alumno en su
  proyecto.
- `scripts/test-integridad.mjs`: reapuntado para certificar v5.8.0 contra v5.7.0.

## Un defecto encontrado y corregido durante la certificación

Durante la verificación se detectó que una de las inserciones había **degradado un encabezado de
nivel 3 a nivel 2** en `06-TESTING.md`, alterando la jerarquía del documento. Se restauró y se
añadió la comparación de encabezados contra la versión anterior como comprobación permanente.

Queda anotado a propósito: la certificación sirve precisamente para encontrar este tipo de cosas, y
un reporte que solo dice "todo bien" no demuestra que se haya buscado.
