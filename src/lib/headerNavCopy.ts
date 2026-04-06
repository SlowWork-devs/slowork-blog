import type { HeaderNavTranslations } from '@/models/headerNav';
import type { SupportedLang } from '@/lib/seo';

const es: HeaderNavTranslations = {
  blog: 'BLOG',
  about: 'ABOUT',
  impact: 'IMPACT PROGRAM',
  join: 'Join the waitlist',
  menu: 'Abrir menú',
  close: 'Cerrar menú',
  mobileEarlyAccessWaitlist: 'Consigue Acceso Anticipado: Únete a la Waitlist',
};

const en: HeaderNavTranslations = {
  blog: 'BLOG',
  about: 'ABOUT',
  impact: 'IMPACT PROGRAM',
  join: 'Join the waitlist',
  menu: 'Open menu',
  close: 'Close menu',
  mobileEarlyAccessWaitlist: 'Get Early Access: Join the Waitlist',
};

export function getHeaderNav(lang: SupportedLang): HeaderNavTranslations {
  return lang === 'es' ? es : en;
}
