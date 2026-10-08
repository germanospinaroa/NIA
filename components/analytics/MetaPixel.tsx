'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const FUNNEL_STEP_KEYS = ['hook', 'possibility', 'evidence', 'origin', 'presentation', 'preferred_name', 'whatsapp_demo', 'continuity', 'closing'] as const;
const PUBLIC_PATHS = ['/admin', '/app'];

type MetaArguments = [string, ...unknown[]];
type MetaFunction = ((...args: MetaArguments) => void) & {
  callMethod?: (...args: MetaArguments) => void;
  queue?: MetaArguments[];
  loaded?: boolean;
  version?: string;
  push?: (...args: MetaArguments) => void;
};

type MetaWindow = Window & {
  fbq?: MetaFunction;
  _fbq?: MetaFunction;
  __niaMetaPixelInitialized?: boolean;
  __niaMetaPixelScriptPromise?: Promise<void>;
  __niaMetaForwardedEvents?: Set<string>;
  __niaFunnelEvents?: unknown[];
};

type FunnelEvent = {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
  path?: string;
};

function isPublicPath(pathname: string) {
  return !PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
}

function asFunnelEvent(value: unknown): FunnelEvent | null {
  if (!value || typeof value !== 'object') return null;
  const event = value as Partial<FunnelEvent>;
  return typeof event.name === 'string' ? event as FunnelEvent : null;
}

function numberProperty(properties: Record<string, unknown>, key: string) {
  const value = Number(properties[key]);
  return Number.isInteger(value) ? value : null;
}

function stepProperties(properties: Record<string, unknown>) {
  const stepNumber = numberProperty(properties, 'screen');
  if (!stepNumber || stepNumber < 1 || stepNumber > FUNNEL_STEP_KEYS.length) return null;
  return { step_number: stepNumber, step_key: FUNNEL_STEP_KEYS[stepNumber - 1] };
}

function ensureMetaPixel() {
  if (typeof window === 'undefined' || !PIXEL_ID) return null;
  const win = window as MetaWindow;
  if (!win.fbq) {
    const fbq = ((...args: MetaArguments) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue?.push(args);
    }) as MetaFunction;
    fbq.push = (...args: MetaArguments) => fbq(...args);
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    win.fbq = fbq;
    win._fbq = fbq;
  }
  if (!document.querySelector('script[data-nia-meta-pixel="true"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.dataset.niaMetaPixel = 'true';
    document.head.appendChild(script);
  }
  if (!win.__niaMetaPixelInitialized) {
    win.__niaMetaPixelInitialized = true;
    win.fbq?.('init', PIXEL_ID);
    win.fbq?.('track', 'PageView');
  }
  return win.fbq;
}

function sendCustom(name: string, properties: Record<string, string | number> = {}) {
  const fbq = ensureMetaPixel();
  fbq?.('trackCustom', name, properties);
}

function forwardFunnelEvent(value: unknown) {
  const event = asFunnelEvent(value);
  if (!event || (event.path && !isPublicPath(event.path))) return;
  const properties = event.properties ?? {};
  const key = `${event.timestamp ?? ''}:${event.name}:${JSON.stringify(properties)}`;
  const win = window as MetaWindow;
  const forwarded = win.__niaMetaForwardedEvents ??= new Set<string>();
  if (forwarded.has(key)) return;
  forwarded.add(key);

  switch (event.name) {
    case 'discover_started': sendCustom('NIA_FunnelStart'); break;
    case 'discover_screen_viewed': {
      const step = stepProperties(properties);
      if (step) sendCustom('NIA_FunnelStepView', step);
      break;
    }
    case 'discover_screen_completed': {
      const step = stepProperties(properties);
      if (step) sendCustom('NIA_FunnelStepComplete', step);
      break;
    }
    case 'discover_preferred_name_entered': sendCustom('NIA_PreferredNameSubmitted'); break;
    case 'premium_funnel_completed': sendCustom('NIA_FunnelComplete'); break;
    case 'plans_viewed': sendCustom('NIA_PlansView'); break;
    case 'plan_selected': {
      const plan = properties.plan === 'annual' ? 'annual' : properties.plan === 'monthly' ? 'monthly' : null;
      if (plan) sendCustom('NIA_PlanSelected', { plan, value: plan === 'annual' ? 49.99 : 4.99, currency: 'USD' });
      break;
    }
    case 'checkout_started': {
      const plan = properties.plan === 'annual' ? 'annual' : properties.plan === 'monthly' ? 'monthly' : null;
      if (plan) sendCustom('NIA_CheckoutClick', { plan, value: plan === 'annual' ? 49.99 : 4.99, currency: 'USD', provider: 'hotmart' });
      break;
    }
    case 'thank_you_viewed': {
      const status = properties.status;
      if (status === 'approved' || status === 'pending' || status === 'analysis') sendCustom('NIA_ThankYouView', { status });
      break;
    }
    case 'account_activated': {
      const fbq = ensureMetaPixel();
      fbq?.('track', 'CompleteRegistration');
      sendCustom('NIA_AccountActivated');
      break;
    }
    case 'onboarding_started': sendCustom('NIA_OnboardingStart'); break;
    case 'onboarding_step_viewed': {
      const stage = typeof properties.stage === 'string' ? properties.stage.replace(/[^a-z0-9_]/gi, '').slice(0, 40) : '';
      if (stage) sendCustom('NIA_OnboardingStepView', { stage });
      break;
    }
    case 'whatsapp_connected': sendCustom('NIA_WhatsAppConnected'); break;
    case 'onboarding_completed': sendCustom('NIA_OnboardingComplete'); break;
  }
}

export function MetaPixel() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isPublicPath(pathname)) {
      previousPath.current = pathname;
      return;
    }
    const wasInitialized = Boolean((window as MetaWindow).__niaMetaPixelInitialized);
    ensureMetaPixel();
    if (wasInitialized && previousPath.current !== null && previousPath.current !== pathname) {
      (window as MetaWindow).fbq?.('track', 'PageView');
    }
    previousPath.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!isPublicPath(pathname)) return;
    const win = window as MetaWindow;
    ensureMetaPixel();
    const handleFunnelEvent = (event: Event) => forwardFunnelEvent((event as CustomEvent<unknown>).detail);
    window.addEventListener('nia:funnel', handleFunnelEvent);
    win.__niaFunnelEvents?.forEach(forwardFunnelEvent);
    return () => window.removeEventListener('nia:funnel', handleFunnelEvent);
  }, [pathname]);

  return null;
}
