'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const TESTIMONIAL_ASSETS = [
  { src: '/images/nia/testimonials/test-01-decision.png', alt: 'Mensaje sobre dejar de buscar confirmación externa antes de decidir.' },
  { src: '/images/nia/testimonials/test-02-conversation.png', alt: 'Mensaje sobre separar lo que necesita expresar de la reacción de su jefe.' },
  { src: '/images/nia/testimonials/test-04-meeting.png', alt: 'Mensaje sobre llegar a una reunión después de dejar de darle vueltas.' },
  { src: '/images/nia/testimonials/test-03-knowing.png', alt: 'Mensaje sobre descubrir que muchas veces ya sabía lo que quería.' },
  { src: '/images/nia/testimonials/test-05-independent.png', alt: 'Mensaje sobre recibir una idea concreta y decidir por sí misma qué hacer.' },
  { src: '/images/nia/testimonials/test-06-continuity.png', alt: 'Mensaje sobre notar un hilo entre los días de trabajo con NIA.' },
] as const;

const AUTOPLAY_MS = 12_000;
const MANUAL_PAUSE_MS = 20_000;

export function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const pauseTimer = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion || isHovered || manualPaused || !isVisible) return;
    const timer = window.setInterval(() => {
      setActive(value => (value + 1) % TESTIMONIAL_ASSETS.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [isHovered, isVisible, manualPaused, reduceMotion]);

  function move(delta: number) {
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current);
    setManualPaused(true);
    pauseTimer.current = window.setTimeout(() => setManualPaused(false), MANUAL_PAUSE_MS);
    setActive(value => (value + delta + TESTIMONIAL_ASSETS.length) % TESTIMONIAL_ASSETS.length);
  }

  function choose(index: number) {
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current);
    setManualPaused(true);
    pauseTimer.current = window.setTimeout(() => setManualPaused(false), MANUAL_PAUSE_MS);
    setActive(index);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 42 || Math.abs(dx) <= Math.abs(dy)) return;
    move(dx < 0 ? 1 : -1);
  }

  const testimonial = TESTIMONIAL_ASSETS[active];
  return <div
    ref={rootRef}
    className="premium-testimonials-carousel"
    role="region"
    aria-roledescription="carrusel"
    aria-label="Mensajes compartidos por mujeres que viven NIA"
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    onFocus={() => setIsHovered(true)}
    onBlur={() => setIsHovered(false)}
    onPointerDown={handlePointerDown}
    onPointerUp={handlePointerUp}
  >
    <div className="premium-testimonial-frame" aria-live="polite">
      <Image key={testimonial.src} src={testimonial.src} alt={testimonial.alt} fill sizes="(max-width: 700px) calc(100vw - 44px), 560px" className="premium-testimonial-image" unoptimized />
    </div>
    <div className="premium-testimonial-controls">
      <button type="button" aria-label="Testimonio anterior" onClick={() => move(-1)}><ChevronLeft size={18} aria-hidden="true" /></button>
      <div className="premium-testimonial-indicators" aria-label="Seleccionar testimonio">
        {TESTIMONIAL_ASSETS.map((item, index) => <button key={item.src} type="button" className={index === active ? 'is-active' : ''} aria-label={`Mostrar testimonio ${index + 1}`} aria-pressed={index === active} onClick={() => choose(index)} />)}
      </div>
      <button type="button" aria-label="Siguiente testimonio" onClick={() => move(1)}><ChevronRight size={18} aria-hidden="true" /></button>
    </div>
  </div>;
}

export { AUTOPLAY_MS };
