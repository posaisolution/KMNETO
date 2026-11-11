import type { Metadata } from 'next';

import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { messages } from '@/lib/i18n/messages';

export const metadata: Metadata = {
  title: `${messages.auth.register.title} · ${messages.app.title}`,
};

export default function RegisterPage() {
  return (
    <AuthShell title={messages.auth.register.title} subtitle={messages.auth.register.subtitle}>
      <RegisterForm />
    </AuthShell>
  );
}
