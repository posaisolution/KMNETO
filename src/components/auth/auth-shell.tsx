import Link from 'next/link';
import type { ReactNode } from 'react';

import { messages } from '@/lib/i18n/messages';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-semibold text-fg"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gain" />
          {messages.app.title}
        </Link>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-5 text-center text-sm text-muted">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}
