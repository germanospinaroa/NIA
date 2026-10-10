'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const TESTIMONIAL_ASSETS = [
  { src: '/images/nia/testimonials/test-01-decision.png', width: 420, height: 172, alt: 'Mensaje sobre dejar de buscar confirmación externa antes de decidir.' },
  { src: '/images/nia/testimonials/test-02-conversation.png', width: 2152, height: 731, alt: 'Mensaje sobre separar lo que necesita expresar de la reacción de su jefe.' },
  { src: '/images/nia/testimonials/test-04-meeting.png', width: 1891, height: 831, alt: 'Mensaje sobre llegar a una reunión después de dejar de darle vueltas.' },
  { src: '/images/nia/testimonials/test-03-knowing.png', width: 2164, height: 727, alt: 'Mensaje sobre descubrir que muchas veces ya sabía lo que quería.' },
  { src: '/images/nia/testimonials/test-05-independent.png', width: 2159, height: 728, alt: 'Mensaje sobre recibir una idea concreta y decidir por sí misma qué hacer.' },
  { src: '/images/nia/testimonials/test-06-continuity.png', width: 2001, height: 786, alt: 'Mensaje sobre notar un hilo entre los días de trabajo con NIA.' },
] as const;

const AUTOPLAY_MS = 12_000;
const MANUAL_PAUSE_MS = 20_000;

export function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [trackOffset, setTrackOffset] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pauseTimer = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number; pointerId: number } | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const firstSlide = track?.querySelector<HTMLElement>('.premium-testimonial-slide');
    if (!root || !track || !firstSlide) return;

    const updateOffset = () => {
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const slideWidth = firstSlide.getBoundingClientRect().width;
      setTrackOffset((root.clientWidth - slideWidth) / 2 - active * (slideWidth + gap));
    };
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(root);
    observer.observe(firstSlide);
    return () => observer.disconnect();
  }, [active]);

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
    pointerStart.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!isDragging) {
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragOffset(dx);
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (event.currentTarget.hasPointerCapture(start.pointerId)) event.currentTarget.releasePointerCapture(start.pointerId);
    setIsDragging(false);
    setDragOffset(0);
    if (Math.abs(dx) < 42 || Math.abs(dx) <= Math.abs(event.clientY - start.y)) return;
    move(dx < 0 ? 1 : -1);
  }

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
    onPointerMove={handlePointerMove}
    onPointerUp={handlePointerEnd}
    onPointerCancel={handlePointerEnd}
  >
    <div className="premium-testimonial-viewport" aria-live="polite">
      <div ref={trackRef} className={`premium-testimonial-track${isDragging ? ' is-dragging' : ''}`} style={{ transform: `translate3d(${trackOffset + dragOffset}px, 0, 0)` }}>
        {TESTIMONIAL_ASSETS.map((item, index) => <div key={item.src} className={`premium-testimonial-slide${index === active ? ' is-active' : ''}`} aria-hidden={index !== active}>
          <Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="(max-width: 700px) 84vw, min(62vw, 760px)" className="premium-testimonial-image" unoptimized />
        </div>)}
      </div>
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
