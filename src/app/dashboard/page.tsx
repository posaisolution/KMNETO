import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { PeriodoActions } from '@/components/dashboard/periodo-actions';
import { logoutAction } from '@/lib/actions/auth';
import { auth } from '@/lib/auth';
import { formatearMoneda } from '@/lib/calc/format';
import { formatearFecha } from '@/lib/format-date';
import { messages } from '@/lib/i18n/messages';
import { resultadoDe } from '@/lib/periodos';
import { prisma } from '@/lib/prisma';

export const instant = false;

export const metadata: Metadata = {
  title: `${messages.dashboard.title} · ${messages.app.title}`,
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const periodos = await prisma.periodo.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: { imprevistos: true },
    orderBy: { fechaInicio: 'desc' },
    take: 50,
  });

  const nombre = session.user.name?.split(' ')[0] ?? session.user.email ?? '';

  return (
    <div className="relative min-h-screen">
      <div className="aurora" aria-hidden="true" />

      <header className="relative z-10 border-b border-line bg-surface/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-fg">
            {messages.app.title}
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-muted transition hover:text-danger"
            >
              {messages.dashboard.logout}
            </button>
          </form>
        </div>
      </header>

      <main className="relative z-10 px-5 pb-16 pt-8">
        <div className="mx-auto max-w-xl space-y-6">
          <header>
            <p className="text-sm text-muted">
              {messages.dashboard.greeting}
              {nombre ? `, ${nombre}` : ''}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-fg">
              {messages.dashboard.title}
            </h1>
            <p className="mt-1 text-sm text-muted">{messages.dashboard.subtitle}</p>
          </header>

          <Link
            href="/calculadora"
            className="block rounded-2xl bg-gain px-5 py-4 text-center text-base font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            {messages.dashboard.empty.cta}
          </Link>

          <Link
            href="/dashboard/metricas"
            className="block rounded-2xl border border-line bg-surface px-5 py-3 text-center text-sm font-semibold text-fg shadow-sm transition hover:bg-surface-2"
          >
            {messages.dashboard.metricsLink}
          </Link>

          {periodos.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-line-strong bg-surface p-8 text-center">
              <h2 className="text-base font-semibold text-fg">
                {messages.dashboard.empty.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{messages.dashboard.empty.body}</p>
            </section>
          ) : (
            <ul className="space-y-3">
              {periodos.map((periodo) => {
                const resultado = resultadoDe(periodo);

                return (
                  <li
                    key={periodo.id}
                    className="rounded-2xl border border-line bg-surface p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-dim">
                          {periodo.tipo === 'dia'
                            ? messages.periodo.dia
                            : messages.periodo.semana}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-fg">
                          {formatearFecha(periodo.fechaInicio)}
                        </p>
                      </div>
                      <p
                        className={`text-xl font-extrabold tabular-nums ${
                          resultado.neto >= 0 ? 'text-gain' : 'text-danger'
                        }`}
                      >
                        {formatearMoneda(resultado.neto)}
                      </p>
                    </div>

                    <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-surface-2 px-2 py-2">
                        <dt className="text-[11px] text-dim">{messages.labels.viajes}</dt>
                        <dd className="text-sm font-semibold tabular-nums text-fg">
                          {periodo.viajes}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-surface-2 px-2 py-2">
                        <dt className="text-[11px] text-dim">{messages.units.km}</dt>
                        <dd className="text-sm font-semibold tabular-nums text-fg">
                          {periodo.km}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-surface-2 px-2 py-2">
                        <dt className="text-[11px] text-dim">
                          {messages.resultados.netoPorHora}
                        </dt>
                        <dd className="text-sm font-semibold tabular-nums text-fg">
                          {formatearMoneda(resultado.netoPorHora)}
                        </dd>
                      </div>
                    </dl>

                    <PeriodoActions id={periodo.id} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
