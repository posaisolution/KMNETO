'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { loginAction, type AuthFormState } from '@/lib/actions/auth';
import { messages } from '@/lib/i18n/messages';

const initialState: AuthFormState = null;

export function LoginForm({ resetDone }: { resetDone: boolean }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const labels = messages.auth;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {resetDone ? (
        <p
          role="status"
          className="rounded-xl border border-gain/30 bg-gain-soft px-4 py-3 text-sm text-gain"
        >
          {labels.reset.success}
        </p>
      ) : null}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-fg">
          {labels.fields.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={labels.placeholders.email}
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-base text-fg placeholder:text-dim focus:border-gain focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-fg">
          {labels.fields.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-base text-fg placeholder:text-dim focus:border-gain focus:outline-none"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-gain px-4 py-3 text-base font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? '...' : labels.login.submit}
      </button>

      <div className="flex flex-col gap-2 text-center text-sm">
        <Link href="/recuperar" className="font-medium text-muted underline-offset-2 hover:underline">
          {labels.login.forgotLink}
        </Link>
        <p className="text-muted">
          {labels.login.noAccount}{' '}
          <Link href="/registro" className="font-semibold text-gain underline-offset-2 hover:underline">
            {labels.login.registerLink}
          </Link>
        </p>
      </div>
    </form>
  );
}
