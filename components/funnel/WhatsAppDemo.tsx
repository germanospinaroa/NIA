'use client';
import type { ReactNode } from 'react';

type WhatsAppDemoProps = { name: string; context: string; message: ReactNode };

export function WhatsAppDemo({ name, context, message }: WhatsAppDemoProps) {
  return <div className="whatsapp-demo" data-demo-context={context} aria-label="Ejemplo de conversación de NIA por WhatsApp">
    <div className="whatsapp-topbar"><span className="whatsapp-avatar">N</span><span><strong>NIA</strong><small>mensaje de hoy</small></span><span className="whatsapp-dots">•••</span></div>
    <div className="whatsapp-thread"><div className="whatsapp-bubble">Hola, {name || 'mucho gusto'}.</div><div className="whatsapp-bubble">{message}</div><span className="whatsapp-time">09:12 · ✓✓</span></div>
  </div>;
}
