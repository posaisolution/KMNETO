'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { resetPasswordAction, type AuthFormState } from '@/lib/actions/auth';
import { messages } from '@/lib/i18n/messages';

const initialState: AuthFormState = null;

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);
  const labels = messages.auth;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />

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
          {state.error}{' '}
          <Link href="/recuperar" className="font-semibold underline underline-offset-2">
            {labels.reset.requestNew}
          </Link>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-gain px-4 py-3 text-base font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? '...' : labels.reset.submit}
      </button>
    </form>
  );
}
