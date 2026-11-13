'use client';

import { useState } from 'react';

import { formatearCantidad, formatearMoneda } from '@/lib/calc/format';
import { messages } from '@/lib/i18n/messages';
import { estimarMeta } from '@/lib/metricas';

type Props = {
  netoPorViaje: number | null;
  netoPorHora: number | null;
  jornadas: number;
};

export function RetoSemanal({ netoPorViaje, netoPorHora, jornadas }: Props) {
  const [meta, setMeta] = useState('');
  const copys = messages.metricas.reto;

  const metaNumerica = Number(meta);
  const hayPromedios = netoPorViaje !== null || netoPorHora !== null;

  const estimacion =
    hayPromedios && Number.isFinite(metaNumerica) && metaNumerica > 0
      ? estimarMeta({ metaSemanal: metaNumerica, netoPorViaje, netoPorHora })
      : null;

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
      <h2 className="text-base font-semibold text-fg">{copys.title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{copys.subtitle}</p>

      <label
        htmlFor="meta-semanal"
        className="mt-4 block text-xs font-semibold uppercase tracking-wide text-dim"
      >
        {copys.label}
      </label>
      <input
        id="meta-semanal"
        type="number"
        inputMode="numeric"
        min={0}
        step={100}
        value={meta}
        onChange={(event) => setMeta(event.target.value)}
        placeholder={copys.placeholder}
        className="mt-1 w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-base tabular-nums text-fg placeholder:text-dim focus:border-gain focus:outline-none"
      />

      {!hayPromedios ? (
        <p className="mt-4 rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed text-muted">
          {copys.sinEstimacion}
        </p>
      ) : null}

      {estimacion ? (
        <div className="mt-4 space-y-3" aria-live="polite">
          <p className="text-sm font-medium text-fg">
            Para ganar {formatearMoneda(estimacion.meta, 0)} a la semana:
          </p>
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-surface-2 px-3 py-3 text-center">
              <dt className="text-[11px] text-dim">{copys.viajes}</dt>
              <dd className="mt-1 text-2xl font-extrabold tabular-nums text-gain">
                {estimacion.viajes === null ? '—' : estimacion.viajes}
              </dd>
            </div>
            <div className="rounded-2xl bg-surface-2 px-3 py-3 text-center">
              <dt className="text-[11px] text-dim">{copys.horas}</dt>
              <dd className="mt-1 text-2xl font-extrabold tabular-nums text-gain">
                {estimacion.horas === null ? '—' : formatearCantidad(estimacion.horas, 1)}
              </dd>
            </div>
          </dl>
          <p className="text-xs leading-relaxed text-muted">{copys.hint}</p>
        </div>
      ) : null}

      {hayPromedios ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-[11px] uppercase tracking-wide text-dim">{copys.base}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {jornadas} {jornadas === 1 ? copys.baseJornada : copys.baseJornadas}
          </p>
          <p className="mt-1 text-xs tabular-nums text-muted">
            {copys.baseViaje}: {formatearMoneda(netoPorViaje)} · {copys.baseHora}:{' '}
            {formatearMoneda(netoPorHora)}
          </p>
        </div>
      ) : null}
    </section>
  );
}
