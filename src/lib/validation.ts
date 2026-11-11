import { z } from 'zod';

import { messages } from './i18n/messages';

const authErrors = messages.auth.errors;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, authErrors.invalidEmail)
  .email(authErrors.invalidEmail);

export const passwordSchema = z
  .string()
  .min(8, authErrors.shortPassword)
  .max(72, authErrors.longPassword);

export const registerSchema = z.object({
  name: z.string().trim().max(60, authErrors.longName).optional(),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, authErrors.required),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, authErrors.invalidToken),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
