# SKILLS DE LA COMUNIDAD — Potenciadores de Diseño (Opcional pero Recomendado)

> **Cuándo usar este archivo:**
> - Una sola vez, al configurar tu entorno de Claude Code o Codex
> - Complementa el sistema; no lo reemplaza
>
> **Qué son las skills:** módulos `SKILL.md` que la comunidad y Anthropic crearon, que se instalan en el agente y se activan automáticamente para tareas específicas. Para diseño existen skills excelentes y probadas por miles de personas. Combinarlas con este sistema operativo sube el piso estético todavía más. Son compatibles con Claude Code, Codex, Cursor y otros (formato universal SKILL.md).

---

## LAS SKILLS DE DISEÑO QUE VALEN LA PENA (verificadas, 2026)

### 1. frontend-design (oficial de Anthropic) — la más importante
La skill oficial que ataca exactamente el "AI slop". Fuerza a la IA a tomar una dirección estética deliberada ANTES de escribir código, y prohíbe explícitamente las fuentes genéricas (Inter, Roboto, Arial, Space Grotesk). Se activa sola cuando el agente trabaja en UI.
```
Instalar en Claude Code:  claude plugin add anthropic/frontend-design
Referencia:               skills.sh/anthropics/skills/frontend-design
```
Es la que más sinergia tiene con nuestros archivos 14 y 16 — refuerza lo mismo desde dentro del agente.

### 2. UI/UX Pro Max (comunidad — la más completa)
La skill de diseño más popular (decenas de miles de estrellas). Es una base de datos de diseño que la IA consulta: 50+ estilos de UI (glassmorphism, brutalism, swiss, etc.), ~160 paletas alineadas a categorías de producto, ~57 combinaciones de fuentes, y guías de UX. Le dices "dashboard fintech" y arma un sistema de diseño coherente con el sector.
```
Instalar:  /plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
```
Resuelve directo tu problema de paletas genéricas: en vez de "negro + naranja", elige una paleta pensada para el nicho.

### 3. Distinctive Frontend / Taste (comunidad)
Aplica un enfoque de 4 dimensiones: tipografía (pesos extremos 100-200 vs 800-900), color por referencia cultural, movimiento (animaciones de carga escalonadas), y fondos en capas (gradientes, texturas, profundidad atmosférica). Muy alineada con nuestro archivo 22.
```
Buscar en:  skills.sh  (directorio de skills de Vercel, buscable por categoría)
Repos:      github.com/Koomook/claude-frontend-skills
```

---

## CÓMO COMBINARLAS CON ESTE SISTEMA

```
1. Las skills se activan AUTOMÁTICAMENTE en el agente (no hay que invocarlas).
2. Nuestro sistema (CLAUDE.md + docs/sistema/) aporta TODO lo demás: estrategia, validación,
   flujo agéntico, UX con datos, venta por Hotmart, backoffice, escalabilidad — cosas que las
   skills de diseño NO cubren.
3. Cuando ambas coexisten, se refuerzan: la skill empuja el diseño audaz desde dentro del
   modelo; nuestros archivos 14/16/22 dan las especificaciones exactas y el resto del negocio.
4. Si hay conflicto (raro), nuestros archivos mandan en estrategia/negocio; la skill puede
   mandar en detalle estético puro. En la práctica apuntan al mismo lugar.
```

---

## DIRECTORIO PARA EXPLORAR MÁS

```
skills.sh                         → directorio buscable de skills (Vercel)
github.com/travisvn/awesome-claude-skills   → lista curada de skills
github.com/rohitg00/awesome-claude-design   → archivos DESIGN.md por familia estética
```

---

## NOTA DE SEGURIDAD

Instalar solo skills de fuentes reconocidas (Anthropic oficial, repos con muchas estrellas y mantenimiento activo, auditadas). Una skill es código/instrucciones que el agente ejecuta — el mismo criterio que con cualquier dependencia. Cuidado con typo-squats (repos que imitan nombres oficiales).

---

## ¿Y SI NO QUIERO INSTALAR NADA?

Perfecto también. Este sistema operativo es completo por sí solo — los archivos 14 (leyes de diseño), 16 (dirección de arte) y 22 (librerías y craft) ya contienen lo esencial de lo que estas skills aportan. Las skills son un acelerador opcional, no un requisito.
