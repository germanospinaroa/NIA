// KIT DE LANDING — MarkedCopy.tsx
// Parser mínimo del COPY MARCADO de docs/copy/landing.md (regla "QUÉ PALABRA SE
// RESALTA" de 52): el redactor entrega [acento]…[/acento] y [b]…[/b]; el diseño
// ejecuta, no adivina. Aquí también vive el presupuesto de copy auto-auditable
// (warnCopy) que las secciones del kit aplican en dev.
// Sin 'use client': no usa hooks — funciona en server y client components.

import type { ReactNode } from 'react';
import { Accent } from './ui';

const MARCADOR = /\[\/?(?:acento|b)\]/g;

/** Quita los marcadores [acento]/[b] — para contar palabras o para alt/aria. */
export function stripMarkers(texto: string): string {
  return texto.replace(MARCADOR, '');
}

export function contarPalabras(texto: string): number {
  return stripMarkers(texto).trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Presupuesto de copy de 52 como regla EJECUTABLE: si la pieza excede el máximo,
 * warn en dev con el conteo real. La corrección es recortar el copy en
 * docs/copy/landing.md — nunca agrandar el límite en el componente.
 */
export function warnCopy(origen: string, texto: string, maxPalabras: number): void {
  if (process.env.NODE_ENV === 'production') return;
  const n = contarPalabras(texto);
  if (n > maxPalabras) {
    console.warn(
      `[kit-landing] ${origen}: ${n} palabras (presupuesto: ${maxPalabras} — tabla de 52-COPY). ` +
        'Recorta el copy en docs/copy/landing.md; el límite no se negocia en el componente.'
    );
  }
}

/** Warn en dev cuando una lista sale del rango canónico (p.ej. 3-5 preguntas). */
export function warnRango(origen: string, cantidad: number, min: number, max: number): void {
  if (process.env.NODE_ENV === 'production') return;
  if (cantidad < min || cantidad > max) {
    console.warn(`[kit-landing] ${origen}: ${cantidad} ítems (rango canónico: ${min}-${max}).`);
  }
}

/**
 * Trunca copy marcado por PALABRAS conservando los marcadores balanceados.
 * Lo usa el Hero para el subtítulo (>14 palabras → warn + truncado en dev y prod:
 * el límite es estructural, no cosmético).
 */
export function truncarMarcado(texto: string, maxPalabras: number): string {
  const tokens = texto.split(/(\[\/?(?:acento|b)\])/);
  const abiertos: string[] = [];
  let palabras = 0;
  let salida = '';
  for (const token of tokens) {
    if (token === '') continue;
    const marca = token.match(/^\[(\/?)(acento|b)\]$/);
    if (marca) {
      const tipo = marca[2];
      if (marca[1] === '/') abiertos.pop();
      else if (tipo) abiertos.push(tipo);
      salida += token;
      continue;
    }
    for (const parte of token.split(/(\s+)/)) {
      if (parte === '' || /^\s+$/.test(parte)) {
        salida += parte;
        continue;
      }
      if (palabras >= maxPalabras) {
        let cierre = '';
        for (let i = abiertos.length - 1; i >= 0; i--) cierre += `[/${abiertos[i]}]`;
        return `${salida.trimEnd()}${cierre}…`;
      }
      salida += parte;
      palabras += 1;
    }
  }
  return salida;
}

/** Convierte el copy marcado en nodos React: [acento] → <Accent>, [b] → <strong>. */
export function parseMarkedCopy(texto: string): ReactNode[] {
  const tokens = texto.split(/(\[\/?(?:acento|b)\])/).filter((t) => t !== '');
  let key = 0;
  const parse = (hasta?: string): ReactNode[] => {
    const nodos: ReactNode[] = [];
    while (tokens.length > 0) {
      const token = tokens.shift();
      if (token === undefined) break;
      const cierre = token.match(/^\[\/(acento|b)\]$/);
      if (cierre) {
        if (hasta !== undefined && cierre[1] === hasta) return nodos;
        continue; // cierre huérfano: se ignora sin romper el render
      }
      const apertura = token.match(/^\[(acento|b)\]$/);
      if (apertura) {
        const tipo = apertura[1] === 'acento' ? 'acento' : 'b';
        const hijos = parse(tipo);
        nodos.push(
          tipo === 'acento' ? (
            <Accent key={key++}>{hijos}</Accent>
          ) : (
            <strong key={key++} className="font-semibold">
              {hijos}
            </strong>
          )
        );
        continue;
      }
      nodos.push(token);
    }
    return nodos;
  };
  return parse();
}

/** Uso: <h1><MarkedCopy text={h1DeDocsCopy} /></h1> */
export function MarkedCopy({ text }: { text: string }) {
  return <>{parseMarkedCopy(text)}</>;
}
