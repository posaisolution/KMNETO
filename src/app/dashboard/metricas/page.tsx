import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { RetoSemanal } from '@/components/dashboard/reto-semanal';
import { auth } from '@/lib/auth';
import { formatearCantidad, formatearMoneda } from '@/lib/calc/format';
import { messages } from '@/lib/i18n/messages';
import {
  mejoresDias,
  resumir,
  ultimaSemana,
  type RegistroDia,
} from '@/lib/metricas';
import { resultadoDe } from '@/lib/periodos';
import { prisma } from '@/lib/prisma';

export const instant = false;

export const metadata: Metadata = {
  title: `${messages.metricas.title} · ${messages.app.title}`,
};

const copys = messages.metricas;

export default async function MetricasPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const periodos = await prisma.periodo.findMany({
    where: { userId: session.user.id, tipo: 'dia', deletedAt: null },
    include: { imprevistos: true },
    orderBy: { fechaInicio: 'desc' },
    take: 60,
  });

  const registros: RegistroDia[] = periodos.map((periodo) => ({
    fecha: periodo.fechaInicio,
    neto: resultadoDe(periodo).neto,
    viajes: periodo.viajes,
    km: periodo.km,
    horas: periodo.horasConectado,
  }));

  const resumen = resumir(ultimaSemana(registros));
  const dias = mejoresDias(registros);

  return (
    <div className="relative min-h-screen">
      <div className="aurora" aria-hidden="true" />

      <header className="relative z-10 border-b border-line bg-surface/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-fg">
            {messages.app.title}
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted transition hover:text-fg"
          >
            {copys.back}
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-5 pb-16 pt-8">
        <div className="mx-auto max-w-xl space-y-6">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-fg">
              {copys.title}
            </h1>
            <p className="mt-1 text-sm text-muted">{copys.subtitle}</p>
          </header>

          {registros.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-line-strong bg-surface p-8 text-center">
              <h2 className="text-base font-semibold text-fg">{copys.empty.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {copys.empty.body}
              </p>
              <Link
                href="/calculadora"
                className="mt-5 inline-block rounded-2xl bg-gain px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                {copys.empty.cta}
              </Link>
            </section>
          ) : (
            <>
              {resumen === null ? (
                <section className="rounded-3xl border border-dashed border-line-strong bg-surface p-6 text-center">
                  <p className="text-sm text-muted">
                    {copys.mejoresDias.sinDatos}
                  </p>
                </section>
              ) : (
                <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-fg">
                    {copys.semana.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted">{copys.semana.hint}</p>

                  <p
                    className={`mt-4 text-3xl font-extrabold tabular-nums ${
                      resumen.neto >= 0 ? 'text-gain' : 'text-danger'
                    }`}
                  >
                    {formatearMoneda(resumen.neto, 0)}
                  </p>
                  <p className="text-xs text-dim">{copys.semana.neto}</p>

                  <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-xl bg-surface-2 px-1 py-2">
                      <dt className="text-[11px] text-dim">{copys.semana.jornadas}</dt>
                      <dd className="text-sm font-semibold tabular-nums text-fg">
                        {resumen.jornadas}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-surface-2 px-1 py-2">
                      <dt className="text-[11px] text-dim">{copys.semana.viajes}</dt>
                      <dd className="text-sm font-semibold tabular-nums text-fg">
                        {resumen.viajes}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-surface-2 px-1 py-2">
                      <dt className="text-[11px] text-dim">{copys.semana.km}</dt>
                      <dd className="text-sm font-semibold tabular-nums text-fg">
                        {formatearCantidad(resumen.km, 0)}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-surface-2 px-1 py-2">
                      <dt className="text-[11px] text-dim">{copys.semana.horas}</dt>
                      <dd className="text-sm font-semibold tabular-nums text-fg">
                        {resumen.horas === null ? '—' : formatearCantidad(resumen.horas, 1)}
                      </dd>
                    </div>
                  </dl>
                </section>
              )}

              {resumen === null ? null : (
                <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-fg">
                    {copys.promedios.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted">{copys.promedios.hint}</p>

                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-surface-2 px-1 py-3">
                      <dt className="text-[11px] text-dim">
                        {copys.promedios.netoPorJornada}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold tabular-nums text-fg">
                        {formatearMoneda(resumen.netoPorJornada)}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-surface-2 px-1 py-3">
                      <dt className="text-[11px] text-dim">
                        {copys.promedios.netoPorViaje}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold tabular-nums text-fg">
                        {formatearMoneda(resumen.netoPorViaje)}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-surface-2 px-1 py-3">
                      <dt className="text-[11px] text-dim">
                        {copys.promedios.netoPorHora}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold tabular-nums text-fg">
                        {formatearMoneda(resumen.netoPorHora)}
                      </dd>
                    </div>
                  </dl>

                  {resumen.netoPorHora === null ? (
                    <p className="mt-3 text-xs leading-relaxed text-muted">
                      {copys.promedios.sinHoras}
                    </p>
                  ) : null}
                </section>
              )}

              <RetoSemanal
                netoPorViaje={resumen?.netoPorViaje ?? null}
                netoPorHora={resumen?.netoPorHora ?? null}
                jornadas={resumen?.jornadas ?? 0}
              />

              <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
                <h2 className="text-base font-semibold text-fg">
                  {copys.mejoresDias.title}
                </h2>
                <p className="mt-1 text-xs text-muted">{copys.mejoresDias.hint}</p>

                {dias.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">
                    {copys.mejoresDias.sinDatos}
                  </p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {dias.map((dia) => (
                      <li
                        key={dia.dia}
                        className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-fg">
                            {copys.dias[String(dia.dia) as keyof typeof copys.dias]}
                          </p>
                          <p className="text-[11px] text-dim">
                            {dia.jornadas}{' '}
                            {dia.jornadas === 1
                              ? copys.mejoresDias.unaJornada
                              : copys.mejoresDias.jornadas}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-bold tabular-nums ${
                            dia.promedioNeto >= 0 ? 'text-gain' : 'text-danger'
                          }`}
                        >
                          {formatearMoneda(dia.promedioNeto)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
