import { z } from 'zod';

/** Espacios fuera; útil con inputs de teléfono o pegados desde UI con separadores. */
export const normalizeWaitlistPhoneInput = (raw: string): string => raw.trim().replace(/\s/g, '');

/**
 * ITU-T E.164: prefijo `+` y entre 2 y 15 dígitos en total (primer dígito tras + en 1–9).
 * Compatible con salidas típicas de selectores de país / libphonenumber.
 */
export const WAITLIST_PHONE_E164_REGEX = /^\+[1-9]\d{1,14}$/;

const trimmedNullable = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null) return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  });

const waitlistPhoneNullable = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null) return null;
    const t = normalizeWaitlistPhoneInput(String(v));
    return t.length > 0 ? t : null;
  });

/** Payload JSON válido para POST /api/waitlist (alineado con columnas de negocio en `waitlists`). */
export const waitlistCreateBodySchema = z
  .object({
    email: z.string().trim().min(1, 'Email requerido'),
    firstName: trimmedNullable,
    phone: waitlistPhoneNullable,
    instagram: trimmedNullable,
    linkedin: trimmedNullable,
    preferredContact: trimmedNullable,
    communityInterest: trimmedNullable,
  })
  .superRefine((data, ctx) => {
    if (data.phone !== null && !WAITLIST_PHONE_E164_REGEX.test(data.phone)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid phone format; expected E.164 (e.g. +34600000000)',
        path: ['phone'],
      });
    }
  });

export type WaitlistCreateInput = z.infer<typeof waitlistCreateBodySchema>;

/** Alias explícito: payload de alta = campos de negocio persistidos (sin metadata de servidor). */
export type WaitlistRegistrationPayload = WaitlistCreateInput;

/** Mensajes i18n inyectados desde la capa de UI (`waitlistFormCopy`). */
export type WaitlistFormValidationMessages = {
  emailRequired: string;
  emailInvalid: string;
  firstNameRequired: string;
  phoneRequired: string;
  phoneInvalid: string;
  instagramInvalid: string;
  linkedinInvalid: string;
  preferredContactRequired: string;
  communityRequired: string;
  termsRequired: string;
};

const preferredContactValues = ['Sloworker', 'Host', 'Bussines'] as const;

/** Campos del formulario validados en cliente (onBlur + submit). */
export const WAITLIST_FORM_FIELD_NAMES = [
  'firstName',
  'email',
  'phone',
  'instagram',
  'linkedin',
  'preferredContact',
  'communityInterest',
] as const;

export type WaitlistFormFieldName = (typeof WAITLIST_FORM_FIELD_NAMES)[number];

/**
 * Esquema estricto de envío: mismas claves que `waitlistCreateBodySchema`, con reglas de UX
 * (obligatorios, URL LinkedIn, patrón Instagram opcional). El resultado es válido para la API.
 */
export const createWaitlistFormSchema = (m: WaitlistFormValidationMessages) =>
  z.object({
    email: z.string().trim().min(1, m.emailRequired).email(m.emailInvalid),
    firstName: z.string().trim().min(1, m.firstNameRequired),
    phone: z
      .string()
      .transform((s) => normalizeWaitlistPhoneInput(s))
      .superRefine((val, ctx) => {
        if (val.length === 0) {
          ctx.addIssue({ code: 'custom', message: m.phoneRequired });
          return;
        }
        if (!WAITLIST_PHONE_E164_REGEX.test(val)) {
          ctx.addIssue({ code: 'custom', message: m.phoneInvalid });
        }
      }),
    instagram: z
      .string()
      .transform((s) => s.trim())
      .refine(
        (s) => s === '' || /^@?[a-zA-Z0-9._]{1,64}$/.test(s),
        m.instagramInvalid,
      )
      .transform((s) => (s.length === 0 ? null : s)),
    linkedin: z
      .string()
      .transform((s) => s.trim())
      .superRefine((val, ctx) => {
        if (val.length === 0) return;
        const urlOk = z.string().url().safeParse(val).success;
        if (!urlOk) ctx.addIssue({ code: 'custom', message: m.linkedinInvalid });
      })
      .transform((s) => (s.trim().length === 0 ? null : s.trim())),
    preferredContact: z
      .string()
      .trim()
      .min(1, m.preferredContactRequired)
      .refine(
        (v): v is (typeof preferredContactValues)[number] =>
          (preferredContactValues as readonly string[]).includes(v),
        m.preferredContactRequired,
      ),
    communityInterest: z.string().trim().min(1, m.communityRequired),
  });

export type WaitlistFormClientValues = z.infer<
  ReturnType<typeof createWaitlistFormSchema>
>;

/**
 * Esquemas por campo para validación onBlur (misma lógica que `createWaitlistFormSchema`).
 */
export const createWaitlistFormFieldSchemas = (m: WaitlistFormValidationMessages) => {
  const full = createWaitlistFormSchema(m);
  return WAITLIST_FORM_FIELD_NAMES.reduce(
    (acc, key) => ({ ...acc, [key]: full.shape[key] }),
    {} as Record<WaitlistFormFieldName, z.ZodType<unknown>>,
  );
};
