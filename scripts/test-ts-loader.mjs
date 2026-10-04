import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const target = path.join(root, specifier.slice(2));
    return { url: pathToFileURL(target.endsWith('.ts') ? target : `${target}.ts`).href, shortCircuit: true };
  }
  if (specifier.startsWith('../') || specifier.startsWith('./')) {
    try { return await nextResolve(specifier, context); } catch (error) {
      if (context.parentURL?.startsWith(pathToFileURL(root).href)) {
        const target = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
        return { url: pathToFileURL(target.endsWith('.ts') ? target : `${target}.ts`).href, shortCircuit: true };
      }
      throw error;
    }
  }
  return nextResolve(specifier, context);
}
