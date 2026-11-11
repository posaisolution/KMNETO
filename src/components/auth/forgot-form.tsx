'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { forgotPasswordAction, type AuthFormState } from '@/lib/actions/auth';
import { messages } from '@/lib/i18n/messages';

const initialState: AuthFormState = null;

export function ForgotForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);
  const labels = messages.auth;

  if (state?.success) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-fg">{labels.forgot.sentTitle}</h2>
        <p role="status" className="text-sm leading-relaxed text-muted">
          {state.success}
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-semibold text-gain underline-offset-2 hover:underline"
        >
          {labels.forgot.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
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
        {isPending ? '...' : labels.forgot.submit}
      </button>

      <p className="text-center text-sm">
        <Link
          href="/login"
          className="font-medium text-muted underline-offset-2 hover:underline"
        >
          {labels.forgot.backToLogin}
        </Link>
      </p>
    </form>
  );
}
