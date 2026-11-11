import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth/auth-shell';
import { ResetForm } from '@/components/auth/reset-form';
import { messages } from '@/lib/i18n/messages';

export const instant = false;

export const metadata: Metadata = {
  title: `${messages.auth.reset.title} · ${messages.app.title}`,
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const labels = messages.auth;

  if (!token) {
    return (
      <AuthShell title={labels.reset.invalidTitle} subtitle={labels.reset.invalidBody}>
        <Link
          href="/recuperar"
          className="inline-block rounded-xl bg-gain px-4 py-3 text-base font-semibold text-white"
        >
          {labels.reset.requestNew}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={labels.reset.title} subtitle={labels.reset.subtitle}>
      <ResetForm token={token} />
    </AuthShell>
  );
}
