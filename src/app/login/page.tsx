import type { Metadata } from 'next';

import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { messages } from '@/lib/i18n/messages';

export const instant = false;

export const metadata: Metadata = {
  title: `${messages.auth.login.title} · ${messages.app.title}`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell title={messages.auth.login.title} subtitle={messages.auth.login.subtitle}>
      <LoginForm resetDone={params.reset === '1'} />
    </AuthShell>
  );
}
