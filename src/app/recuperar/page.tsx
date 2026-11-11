import type { Metadata } from 'next';

import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotForm } from '@/components/auth/forgot-form';
import { messages } from '@/lib/i18n/messages';

export const metadata: Metadata = {
  title: `${messages.auth.forgot.title} · ${messages.app.title}`,
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell title={messages.auth.forgot.title} subtitle={messages.auth.forgot.subtitle}>
      <ForgotForm />
    </AuthShell>
  );
}
