# PLANTILLA DE REVISIÓN DE PANTALLA

> Usar esta plantilla antes de aprobar cualquier pantalla. El agente la completa internamente para cada pantalla nueva; el usuario la revisa para las pantallas clave. Obliga a razonar en términos de propósito, fricción, claridad y control — no solo en términos de si "se ve bien".

```markdown
## Revisión: [Nombre de la pantalla]

**Usuario y momento del flujo:**
[Quién llega aquí y desde dónde / cuándo en el journey]

**Misión principal de la pantalla (1 frase):**
[Qué vine a hacer aquí]

**Acción principal:**
[El CTA dominante — debe ser obvio en <3 segundos]

**Acciones secundarias:**
[Máximo 2, menos prominentes]

**Marca y regreso:**
[Logo/nombre visible; a dónde lleva; qué pasa si el usuario cierra o vuelve]

**Información necesaria para decidir:**
[Qué datos necesita el usuario para tomar la acción — ni más ni menos]

**Si es landing/paywall/upgrade — argumento de conversión:**
- Creencia que debe instalar: [...]
- Pérdida honesta si no actúa: [...]
- Resultado que desbloquea: [...]
- Headline <=10 palabras: [sí/no]
- Subheadline <=2 líneas en mobile: [sí/no]
- Visual principal vende: [contraste / pérdida / desbloqueo / progreso / prueba]
- Palabras clave resaltadas: [...]
- Garantía/confianza concreta: [política real o "no mostrar aún"]

**Elementos visibles y propósito de cada uno:**
- [Elemento]: [Para qué ayuda — entender / decidir / actuar / confiar / sentir progreso]
- [Elemento]: [...]
(Si un elemento no entra en esas 5 categorías → eliminarlo)

**Estados necesarios:**
[ ] Empty    [ ] Loading    [ ] Success    [ ] Error    [ ] Disabled    [ ] Offline

**Verificación visual — RENDERIZADA (obligatorio, archivo 32):**
[ ] Abierta a 375px y MIRADA (screenshot)   [ ] Nav al fondo, sin vacío muerto (min-h-dvh)
[ ] Fondo con profundidad (no plano)   [ ] Pantalla llena de valor (no vacía)   [ ] CTA vivo
[ ] Veredicto del SUBAGENTE `revisor-visual`: ≥36/40 Y ≥16/20 (autoevaluarse es inválido) —
    obligatorio en las 4 del dinero + la primera de cada tipo; en secundarias: medición +
    checklist anotando "sin revisor (pantalla secundaria)"
[ ] Si hubo referencia visual del usuario: veredicto FIEL (test de fidelidad del 16)

**Riesgos de confusión:**
[Qué podría malinterpretar un usuario nuevo]

**Riesgos de accesibilidad:**
[Contraste, tamaño táctil, labels, navegación teclado]

**Riesgos de confianza o privacidad:**
[¿Pide algo antes de demostrar valor? ¿Usa datos del usuario de forma visible?]

**Cómo se reduce fricción:**
[Qué pasos, campos o decisiones se eliminan o simplifican]

**Cómo aparece la personalidad sin distraer:**
[Copy, micro-interacción, celebración — con propósito]

**Funciones de IA en esta pantalla (si aplica):**
[ ] Declara qué puede y no puede
[ ] Permite editar / rechazar / regenerar
[ ] No aplica cambios de alto impacto sin confirmación

**Qué se elimina por no aportar valor:**
[Lista de cosas que se cortaron y por qué]

**Criterios de aceptación (la pantalla está lista cuando):**
1. Una persona nueva entiende su misión en <3 segundos
2. El usuario puede avanzar sin instrucciones externas
3. Todos los estados están implementados
4. Screenshot a 375px verificado. El `revisor-visual` es OBLIGATORIO en las 4 pantallas que deciden
   el dinero (landing, onboarding, paywall, pantalla principal) y en la PRIMERA de cada plantilla/tipo
   nuevo: ≥36/40 y ≥16/20 (+ fidelidad si hubo referencia), pasándole SIEMPRE screenshot + ARCHIVO DE
   CÓDIGO + FICHA-ARTE.md + referencia si existe. En las demás (ajustes, perfil, legales, variantes de
   un tipo ya aprobado): medición + checklist, anotando "sin revisor (pantalla secundaria)"
5. El checklist de cierre de CLAUDE.md pasa completo
6. [Criterio específico de esta pantalla]
7. Si vende/cobra/desbloquea, pasa `52-COPY-VISUALES-CONVERSION.md`
```

---

## Cuándo usar esta plantilla

**Obligatorio para:** pantallas de onboarding, la home/dashboard, cualquier pantalla que involucre IA, pantallas de pago/Hotmart, el estado vacío principal.

**Recomendado para:** toda pantalla nueva que no sea una variante directa de otra ya aprobada.

**Cómo la usa el agente:** antes de escribir el código de una pantalla nueva, el agente completa esta plantilla internamente y presenta los campos más importantes al usuario para aprobación — especialmente "Misión principal", "Elementos visibles" y "Criterios de aceptación". No presenta el código hasta que la pantalla tiene propósito claro.
