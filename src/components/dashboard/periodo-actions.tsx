'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { deletePeriodoAction } from '@/lib/actions/periodos';
import { messages } from '@/lib/i18n/messages';

export function PeriodoActions({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const result = await deletePeriodoAction(id);

      if (result.ok) {
        setConfirming(false);
        router.refresh();
        return;
      }

      setError(messages.dashboard.deleteError);
    });
  };

  if (confirming) {
    return (
      <div className="mt-3 border-t border-line pt-3">
        <p className="text-xs leading-relaxed text-muted">
          {messages.dashboard.deleteConfirm}
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-60"
          >
            {isPending ? '...' : messages.dashboard.deleteYes}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-fg transition hover:bg-surface-2"
          >
            {messages.dashboard.deleteNo}
          </button>
        </div>
        {error ? (
          <p role="alert" className="mt-2 text-xs font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-4 border-t border-line pt-3">
      <Link
        href={`/dashboard/periodos/${id}`}
        className="text-xs font-semibold text-muted underline-offset-2 transition hover:text-fg hover:underline"
      >
        {messages.dashboard.editPeriod}
      </Link>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-semibold text-muted underline-offset-2 transition hover:text-danger hover:underline"
      >
        {messages.dashboard.deletePeriod}
      </button>
      {error ? (
        <span role="alert" className="text-xs font-medium text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}
