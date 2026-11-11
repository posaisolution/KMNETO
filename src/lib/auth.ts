import { compare } from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from './auth.config';
import { prisma } from './prisma';
import { loginSchema } from './validation';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

async function registerFailedLogin(userId: string, failedLogins: number): Promise<void> {
  const attempts = failedLogins + 1;
  const locked = attempts >= MAX_FAILED_LOGINS;

  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLogins: locked ? 0 : attempts,
      lockedUntil: locked ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null,
    },
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: { email, deletedAt: null },
        });

        if (!user) {
          return null;
        }

        if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
          return null;
        }

        const passwordMatches = await compare(password, user.passwordHash);
        if (!passwordMatches) {
          await registerFailedLogin(user.id, user.failedLogins);
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLogins: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
});
