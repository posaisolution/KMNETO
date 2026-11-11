'use server';

import { hash } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

import { signIn, signOut } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { env } from '@/lib/env';
import { messages } from '@/lib/i18n/messages';
import { prisma } from '@/lib/prisma';
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/lib/validation';

const authErrors = messages.auth.errors;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export type AuthFormState = {
  error?: string;
  success?: string;
} | null;

function firstIssue(result: { error: { issues: { message: string }[] } }): string {
  return result.error.issues[0]?.message ?? authErrors.generic;
}

async function signInWithCredentials(email: string, password: string): Promise<never> {
  await signIn('credentials', {
    email,
    password,
    redirectTo: '/dashboard',
  });

  redirect('/dashboard');
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name') || undefined,
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed) };
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: authErrors.emailTaken };
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name && name.length > 0 ? name : null,
    },
  });

  return signInWithCredentials(email, password);
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: authErrors.invalidCredentials };
    }
    throw error;
  }

  return null;
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}

export async function forgotPasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed) };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });

  if (user) {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${env.APP_URL}/restablecer?token=${rawToken}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return { success: messages.auth.forgot.sentBody };
}

export async function resetPasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed) };
  }

  const { token, password } = parsed.data;
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { error: authErrors.expiredToken };
  }

  const passwordHash = await hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        failedLogins: 0,
        lockedUntil: null,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect('/login?reset=1');
}
