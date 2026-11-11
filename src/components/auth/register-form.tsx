'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { registerAction, type AuthFormState } from '@/lib/actions/auth';
import { messages } from '@/lib/i18n/messages';

const initialState: AuthFormState = null;

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const labels = messages.auth;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-fg">
          {labels.fields.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={60}
          placeholder={labels.placeholders.name}
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-base text-fg placeholder:text-dim focus:border-gain focus:outline-none"
        />
      </div>

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
          autoComplete="new-password"
          minLength={8}
          required
          placeholder={labels.placeholders.password}
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
        {isPending ? '...' : labels.register.submit}
      </button>

      <p className="text-xs leading-relaxed text-dim">{labels.register.privacy}</p>

      <p className="text-center text-sm text-muted">
        {labels.register.hasAccount}{' '}
        <Link href="/login" className="font-semibold text-gain underline-offset-2 hover:underline">
          {labels.register.loginLink}
        </Link>
      </p>
    </form>
  );
}
