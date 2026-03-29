import { z } from 'zod';

const messages = {
  es: {
    nameRequired: 'El nombre es obligatorio',
    emailInvalid: 'Introduce un correo válido',
    subjectRequired: 'El asunto es obligatorio',
    messageMin: 'El mensaje debe tener al menos 10 caracteres',
  },
  en: {
    nameRequired: 'Name is required',
    emailInvalid: 'Enter a valid email',
    subjectRequired: 'Subject is required',
    messageMin: 'Message must be at least 10 characters',
  },
} as const;

export function getContactFormBodySchema(lang: 'es' | 'en') {
  const m = messages[lang];
  return z.object({
    name: z.string().trim().min(1, m.nameRequired),
    email: z.string().trim().email(m.emailInvalid),
    subject: z.string().trim().min(1, m.subjectRequired),
    message: z.string().trim().min(10, m.messageMin),
    lang: z.enum(['es', 'en']),
  });
}

export type ContactFormPayload = z.infer<ReturnType<typeof getContactFormBodySchema>>;
