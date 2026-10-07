import type { ReactNode } from 'react';
import Link from 'next/link';

export function LegalPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <main className="legal-shell"><header className="legal-header"><Link href="/" className="nia-mark" aria-label="NIA inicio"><span />NIA</Link><Link href="/descubre/planes" className="legal-back">Volver a planes</Link></header><article className="legal-content"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="legal-intro">{intro}</p><div className="legal-body">{children}</div><nav className="legal-nav" aria-label="Información legal"><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link><Link href="/cancelacion">Cancelación</Link></nav></article></main>;
}
