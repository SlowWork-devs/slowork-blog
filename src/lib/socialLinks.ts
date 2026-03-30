/**
 * Perfiles oficiales SloWork (paridad histórica con la landing legacy `sloworkLanding`).
 */
export const SLOWORK_SOCIAL_LINKS = [
  {
    id: 'instagram',
    href: 'https://www.instagram.com/_slowork/',
  },
  {
    id: 'linkedin',
    href: 'https://www.linkedin.com/company/slow-working/',
  },
  {
    id: 'whatsapp',
    href: 'https://whatsapp.com/channel/0029VayVun62975FMxHhjS0J',
  },
  {
    id: 'tiktok',
    href: 'https://www.tiktok.com/@_slowork?lang=es',
  },
  {
    id: 'youtube',
    href: 'https://www.youtube.com/@Sloworking',
  },
  {
    id: 'x',
    href: 'https://x.com/_Slowork',
  },
  {
    id: 'pinterest',
    href: 'https://es.pinterest.com/sloworkadmin',
  },
] as const;

export type SloworkSocialId = (typeof SLOWORK_SOCIAL_LINKS)[number]['id'];
