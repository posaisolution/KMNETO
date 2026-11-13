"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { calcularPeriodo, EntradaPeriodo, ResultadoPeriodo } from "@/lib/calc";
import { savePeriodoAction, updatePeriodoAction } from "@/lib/actions/periodos";
import { messages } from "@/lib/i18n/messages";
import { explicarMetrica, MetricaId } from "@/lib/i18n/explicaciones";
import {
  formatearMoneda,
  formatearPorcentaje,
  redondear,
} from "@/lib/calc/format";

type GasMode = "real" | "estimado";
type Periodo = "dia" | "semana";

/** Snapshot of one calculation: the explanation panel needs the input too. */
type Calculo = {
  entrada: EntradaPeriodo;
  resultado: ResultadoPeriodo;
};

type FieldDef = {
  key: string;
  label: string;
  unit?: string;
  required?: boolean;
};

const PERIOD_FIELDS: FieldDef[] = [
  { key: "viajes", label: messages.labels.viajes, unit: messages.units.viajes, required: true },
  { key: "horasConectado", label: messages.labels.horasConectado, unit: messages.units.horas },
  { key: "km", label: messages.labels.km, unit: messages.units.km, required: true },
  { key: "ingresoPlataforma", label: messages.labels.ingresoPlataforma, unit: messages.units.pesos, required: true },
  { key: "propinasYEfectivo", label: messages.labels.propinasYEfectivo, unit: messages.units.pesos },
];

/**
 * Renta: campo abierto con el monto que el chofer paga en el período.
 * En un día es la renta diaria; en una semana, la semanal. No se deriva.
 */
const RENTA_FIELD: FieldDef = {
  key: "rentaPeriodo",
  label: messages.labels.rentaDia,
  unit: messages.units.pesos,
};

const EXPENSE_FIELDS: FieldDef[] = [
  { key: "celularRecargasPeriodo", label: messages.labels.celularRecargas, unit: messages.units.pesos },
  { key: "imprevistos", label: messages.labels.imprevistos, unit: messages.units.pesos },
  { key: "otrosGastosPeriodo", label: messages.labels.otrosGastosPeriodo, unit: messages.units.pesos },
];

const GAS_REAL_FIELD: FieldDef = {
  key: "gastoRealGasolina",
  label: messages.labels.gastoRealGasolina,
  unit: messages.units.pesos,
  required: true,
};

const GAS_ESTIMATE_FIELDS: FieldDef[] = [
  { key: "rendimientoKmPorLitro", label: messages.labels.rendimientoKmPorLitro, unit: messages.units.kmPorLitro, required: true },
  { key: "precioLitro", label: messages.labels.precioLitro, unit: messages.units.pesosPorLitro, required: true },
];

/** Debe ser mayor a 0 para que sirva de divisor. */
const POSITIVE_KEYS = new Set(["rendimientoKmPorLitro"]);

/** Deja solo dígitos y un único punto decimal. */
function sanitizeNumeric(value: string): string {
  const limpio = value.replace(/[^\d.]/g, "");
  const [entero, ...decimales] = limpio.split(".");
  return decimales.length > 0 ? `${entero}.${decimales.join("")}` : entero;
}

function parseNumber(value: string | undefined | null): number | null {
  if (value == null) return null;
  const trimmed = value.trim().replace(/,/g, "");
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

type CalculadoraClientProps = {
  periodoId?: string;
  initialValues?: Record<string, string>;
  initialTipo?: Periodo;
  initialGasMode?: GasMode;
  initialEntrada?: EntradaPeriodo;
  initialFechaInicio?: string;
  /** A dónde regresa el enlace "Volver": dashboard con sesión, landing sin ella. */
  backHref?: string;
  /** La liga al historial solo tiene sentido con una sesión iniciada. */
  showHistoryLink?: boolean;
};

export default function CalculadoraClient({
  periodoId,
  initialValues,
  initialTipo,
  initialGasMode,
  initialEntrada,
  initialFechaInicio,
  backHref = "/",
  showHistoryLink = false,
}: CalculadoraClientProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues ?? {});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [gasMode, setGasMode] = useState<GasMode>(initialGasMode ?? "real");
  const [periodo, setPeriodo] = useState<Periodo>(initialTipo ?? "dia");
  const [calculo, setCalculo] = useState<Calculo | null>(() =>
    initialEntrada
      ? { entrada: initialEntrada, resultado: calcularPeriodo(initialEntrada) }
      : null,
  );

  const rentaField: FieldDef = {
    ...RENTA_FIELD,
    label:
      periodo === "dia" ? messages.labels.rentaDia : messages.labels.rentaSemana,
  };

  const errors = useMemo(() => {
    const next: Record<string, string> = {};

    const check = ({ key, required }: FieldDef) => {
      const raw = values[key] ?? "";
      if (raw.trim() === "") {
        if (required) next[key] = messages.errors.required;
        return;
      }
      const parsed = parseNumber(raw);
      if (parsed === null) {
        next[key] = messages.errors.invalidNumber;
        return;
      }
      if (parsed < 0) {
        next[key] = messages.errors.negative;
        return;
      }
      if (POSITIVE_KEYS.has(key) && parsed <= 0) next[key] = messages.errors.positive;
    };

    PERIOD_FIELDS.forEach(check);
    EXPENSE_FIELDS.forEach(check);
    check(RENTA_FIELD);

    if (gasMode === "real") {
      check(GAS_REAL_FIELD);
    } else {
      GAS_ESTIMATE_FIELDS.forEach(check);
    }

    return next;
  }, [values, gasMode]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: sanitizeNumeric(value) }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleCalcular = (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched: Record<string, boolean> = {};
    [
      ...PERIOD_FIELDS,
      ...EXPENSE_FIELDS,
      RENTA_FIELD,
      GAS_REAL_FIELD,
      ...GAS_ESTIMATE_FIELDS,
    ].forEach(({ key }) => (allTouched[key] = true));
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) return;

    const entrada: EntradaPeriodo = {
      viajes: parseNumber(values.viajes) ?? 0,
      horasConectado: parseNumber(values.horasConectado) ?? undefined,
      km: parseNumber(values.km) ?? 0,
      ingresoPlataforma: parseNumber(values.ingresoPlataforma) ?? 0,
      propinasYEfectivo: parseNumber(values.propinasYEfectivo) ?? undefined,
      rentaPeriodo: parseNumber(values.rentaPeriodo) ?? undefined,
      celularRecargasPeriodo:
        parseNumber(values.celularRecargasPeriodo) ?? undefined,
      otrosGastosPeriodo: parseNumber(values.otrosGastosPeriodo) ?? undefined,
    };

    if (gasMode === "real") {
      entrada.gastoRealGasolina = parseNumber(values.gastoRealGasolina) ?? undefined;
    } else {
      entrada.rendimientoKmPorLitro = parseNumber(values.rendimientoKmPorLitro) ?? undefined;
      entrada.precioLitro = parseNumber(values.precioLitro) ?? undefined;
    }

    const imprevistoMonto = parseNumber(values.imprevistos);
    if (imprevistoMonto && imprevistoMonto > 0) {
      entrada.imprevistos = [
        { fecha: new Date(), categoria: "Imprevisto", monto: imprevistoMonto },
      ];
    }

    setCalculo({ entrada, resultado: calcularPeriodo(entrada) });
  };

  const handleLimpiar = () => {
    setValues({});
    setTouched({});
    setCalculo(null);
  };

  /** Cambiar de período empieza una captura nueva: los montos no son comparables. */
  const handlePeriodo = (siguiente: Periodo) => {
    if (siguiente === periodo) return;
    setPeriodo(siguiente);
    handleLimpiar();
  };

  const inputClass = (hasError: boolean) =>
    [
      "w-full rounded-xl border bg-surface-2 px-4 py-3.5 text-lg tabular-nums text-fg outline-none transition",
      "focus:border-gain focus:bg-surface focus:ring-2 focus:ring-gain/20",
      hasError ? "border-danger" : "border-line",
    ].join(" ");

  const renderField = ({ key, label, unit, required }: FieldDef) => (
    <div key={key}>
      <label htmlFor={key} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
        {!required && <span className="ml-1 text-dim">({messages.placeholders.optional})</span>}
      </label>
      <div className="relative">
        <input
          id={key}
          name={key}
          inputMode="decimal"
          type="text"
          placeholder={messages.placeholders.number}
          value={values[key] ?? ""}
          onChange={(e) => handleChange(key, e.target.value)}
          className={inputClass(Boolean(touched[key] && errors[key]))}
        />
        {unit && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-dim">
            {unit}
          </span>
        )}
      </div>
      {touched[key] && errors[key] && (
        <p className="mt-1.5 text-xs text-danger">{errors[key]}</p>
      )}
    </div>
  );

  const segmented = (activo: boolean) =>
    `flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
      activo
        ? "bg-fg text-white shadow-sm"
        : "border border-line bg-surface text-fg hover:bg-bg-soft"
    }`;

  return (
    <div className="relative min-h-screen">
      <div className="aurora" aria-hidden="true" />

      <header className="relative z-10 border-b border-line bg-surface/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link
            href={backHref}
            className="text-sm font-semibold text-muted transition hover:text-gain"
          >
            ← Volver
          </Link>
          <span className="text-lg font-bold text-fg">{messages.app.title}</span>
          {showHistoryLink ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-muted transition hover:text-gain"
            >
              {messages.dashboard.title}
            </Link>
          ) : (
            <span aria-hidden="true" className="text-sm font-semibold text-transparent">
              {messages.dashboard.title}
            </span>
          )}
        </div>
      </header>

      <main className="relative z-10 px-5 pb-12 pt-8">
        <div className="mx-auto max-w-xl space-y-6">
          <header className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-fg md:text-4xl">
              {periodoId ? messages.dashboard.detailTitle : messages.app.title}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {periodoId ? messages.dashboard.detailSubtitle : messages.app.subtitle}
            </p>
          </header>

          <form onSubmit={handleCalcular} className="space-y-5">
            <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-fg">{messages.sections.periodo}</h2>

              <div className="mb-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePeriodo("dia")}
                  aria-pressed={periodo === "dia"}
                  className={segmented(periodo === "dia")}
                >
                  {messages.periodo.dia}
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodo("semana")}
                  aria-pressed={periodo === "semana"}
                  className={segmented(periodo === "semana")}
                >
                  {messages.periodo.semana}
                </button>
              </div>

              <div className="space-y-4">{PERIOD_FIELDS.map(renderField)}</div>
            </section>

            <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-fg">{messages.sections.gastos}</h2>

              <div className="mb-5 rounded-2xl border border-line bg-surface-2 p-4">
                <span className="block text-sm font-medium text-fg">Gasolina</span>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGasMode("real")}
                    className={segmented(gasMode === "real")}
                  >
                    Gasto real
                  </button>
                  <button
                    type="button"
                    onClick={() => setGasMode("estimado")}
                    className={segmented(gasMode === "estimado")}
                  >
                    Estimar
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {gasMode === "real" ? (
                    renderField(GAS_REAL_FIELD)
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed text-muted">
                        {messages.hints.gasolinaEstimada}
                      </p>
                      {GAS_ESTIMATE_FIELDS.map(renderField)}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {renderField(rentaField)}
                {EXPENSE_FIELDS.map(renderField)}
              </div>
            </section>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-fg px-4 py-4 text-lg font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
              >
                {messages.buttons.calcular}
              </button>
              <button
                type="button"
                onClick={handleLimpiar}
                className="rounded-xl border border-line-strong bg-surface px-5 py-4 text-lg font-semibold text-fg transition hover:bg-surface-2"
              >
                {messages.buttons.limpiar}
              </button>
            </div>
          </form>

          {calculo && (
            <ResultadosSection
              entrada={calculo.entrada}
              resultado={calculo.resultado}
              tipo={periodo}
              periodoId={periodoId}
              fechaInicio={initialFechaInicio}
            />
          )}
        </div>
      </main>
    </div>
  );
}

type MetricaCard = {
  id: MetricaId;
  label: string;
  value: string;
};

function ResultadosSection({
  entrada,
  resultado,
  tipo,
  periodoId,
  fechaInicio,
}: {
  entrada: EntradaPeriodo;
  resultado: ResultadoPeriodo;
  tipo: Periodo;
  periodoId?: string;
  fechaInicio?: string;
}) {
  const [metricaActiva, setMetricaActiva] = useState<MetricaId | null>(null);

  const metricas: MetricaCard[] = [
    {
      id: "netoPorViaje",
      label: messages.resultados.netoPorViaje,
      value: formatearMoneda(resultado.netoPorViaje),
    },
    {
      id: "puntoEquilibrioViaje",
      label: messages.resultados.puntoEquilibrioViaje,
      value: formatearMoneda(resultado.puntoEquilibrioViaje),
    },
    {
      id: "netoPorKm",
      label: messages.resultados.netoPorKm,
      value: formatearMoneda(resultado.netoPorKm),
    },
    {
      id: "costoPorKm",
      label: messages.resultados.costoPorKm,
      value: formatearMoneda(resultado.costoPorKm),
    },
    {
      id: "margenPct",
      label: messages.resultados.margenPct,
      value: formatearPorcentaje(resultado.margenPct),
    },
  ];

  // Per-hour metrics only make sense when the driver captured hours.
  if ((entrada.horasConectado ?? 0) > 0) {
    metricas.push(
      {
        id: "netoPorHora",
        label: messages.resultados.netoPorHora,
        value: formatearMoneda(resultado.netoPorHora),
      },
      {
        id: "puntoEquilibrioHora",
        label: messages.resultados.puntoEquilibrioHora,
        value: formatearMoneda(resultado.puntoEquilibrioHora),
      }
    );
  }

  const activa = metricas.find((metrica) => metrica.id === metricaActiva);
  const explicacion = metricaActiva
    ? explicarMetrica(metricaActiva, entrada, resultado)
    : null;

  return (
    <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-fg">{messages.sections.resultados}</h2>

      <div
        className={`mb-4 rounded-2xl p-5 ${
          resultado.neto >= 0 ? "bg-gain-soft" : "bg-danger-soft"
        }`}
      >
        <p className="text-sm font-medium text-muted">{messages.resultados.neto}</p>
        <p
          className={`mt-1 text-4xl font-extrabold tabular-nums ${
            resultado.neto >= 0 ? "text-gain" : "text-danger"
          }`}
        >
          {formatearMoneda(resultado.neto)}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {metricas.map((metrica) => (
          <MetricCard
            key={metrica.id}
            metrica={metrica}
            activa={metrica.id === metricaActiva}
            onToggle={() =>
              setMetricaActiva((previa) =>
                previa === metrica.id ? null : metrica.id
              )
            }
          />
        ))}
      </div>

      {activa && explicacion && (
        <div
          id="explicacion-metrica"
          role="region"
          aria-label={activa.label}
          className="mb-4 rounded-2xl border border-line-strong bg-surface p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-dim">
            {messages.resultados.comoSeCalcula}
          </p>
          <p className="mt-2 text-sm text-fg">{explicacion.que}</p>
          <p className="mt-2 rounded-xl bg-surface-2 px-3 py-2 font-mono text-xs text-fg">
            {explicacion.formula}
          </p>
        </div>
      )}

      {resultado.historialInsuficiente && (
        <p className="mb-4 rounded-xl bg-gas-soft px-4 py-3 text-sm text-fg">
          {messages.resultados.historialInsuficiente}
        </p>
      )}

      <div className="rounded-2xl border border-dashed border-line-strong p-4">
        <h3 className="mb-3 text-sm font-semibold text-fg">{messages.resultados.desglose}</h3>
        <div className="space-y-2 text-sm">
          <BreakdownRow tone="gain" label={messages.resultados.ingresoTotal} value={resultado.ingresoTotal} />
          <BreakdownRow tone="cost" label={messages.resultados.gasolina} value={resultado.gasolina} />
          <BreakdownRow tone="cost" label={messages.resultados.renta} value={resultado.renta} />
          <BreakdownRow tone="cost" label={messages.resultados.celularRecargas} value={resultado.celularRecargas} />
          <BreakdownRow tone="cost" label={messages.resultados.imprevistos} value={resultado.imprevistos} />
          <BreakdownRow tone="cost" label={messages.resultados.otrosGastos} value={resultado.otrosGastos} />
          <div className="border-t border-line pt-2">
            <BreakdownRow tone="total" label={messages.resultados.costoTotal} value={resultado.costoTotal} />
          </div>
        </div>
      </div>

      <SavePeriodoButton
        entrada={entrada}
        tipo={tipo}
        periodoId={periodoId}
        fechaInicio={fechaInicio}
      />
    </section>
  );
}

type SaveState = "idle" | "saving" | "saved" | "auth" | "error";

function SavePeriodoButton({
  entrada,
  tipo,
  periodoId,
  fechaInicio,
}: {
  entrada: EntradaPeriodo;
  tipo: Periodo;
  periodoId?: string;
  fechaInicio?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>("idle");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setState("saving");
    startTransition(async () => {
      const payload = {
        tipo,
        fechaInicio: fechaInicio ?? new Date().toISOString(),
        viajes: entrada.viajes,
        horasConectado: entrada.horasConectado,
        km: entrada.km,
        ingresoPlataforma: entrada.ingresoPlataforma,
        propinasYEfectivo: entrada.propinasYEfectivo,
        rentaPeriodo: entrada.rentaPeriodo,
        celularRecargasPeriodo: entrada.celularRecargasPeriodo,
        gastoRealGasolina: entrada.gastoRealGasolina,
        rendimientoKmPorLitro: entrada.rendimientoKmPorLitro,
        precioLitro: entrada.precioLitro,
        otrosGastosPeriodo: entrada.otrosGastosPeriodo,
        imprevistos: entrada.imprevistos?.map((imprevisto) => ({
          fecha: imprevisto.fecha.toISOString(),
          categoria: imprevisto.categoria,
          monto: imprevisto.monto,
        })),
      };

      const result = periodoId
        ? await updatePeriodoAction(periodoId, payload)
        : await savePeriodoAction(payload);

      if (result.ok) {
        if (periodoId) {
          router.push("/dashboard");
          return;
        }
        setState("saved");
      } else if (result.reason === "auth") {
        setState("auth");
      } else {
        setState("error");
      }
    });
  };

  if (state === "saved") {
    return (
      <div className="mt-4 rounded-2xl border border-gain/30 bg-gain-soft px-4 py-3 text-center text-sm font-medium text-gain">
        {messages.dashboard.saved}{" "}
        <Link href="/dashboard" className="underline underline-offset-2">
          {messages.dashboard.title}
        </Link>
      </div>
    );
  }

  if (state === "auth") {
    return (
      <div className="mt-4 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-center text-sm text-muted">
        {messages.dashboard.savePeriodHint}{" "}
        <Link
          href="/registro"
          className="font-semibold text-gain underline underline-offset-2"
        >
          {messages.auth.login.registerLink}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || state === "saving"}
        className="w-full rounded-xl border border-gain bg-gain-soft px-4 py-3.5 text-base font-semibold text-gain transition hover:bg-gain hover:text-white disabled:opacity-60"
      >
        {state === "saving" ? "..." : periodoId ? messages.dashboard.saveChanges : messages.dashboard.savePeriod}
      </button>
      {state === "error" && (
        <p role="alert" className="mt-2 text-center text-sm font-medium text-danger">
          {messages.dashboard.saveError}
        </p>
      )}
    </div>
  );
}

function MetricCard({
  metrica,
  activa,
  onToggle,
}: {
  metrica: MetricaCard;
  activa: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 text-center transition ${
        activa ? "border-fg bg-surface" : "border-line bg-surface-2"
      }`}
    >
      <div className="flex items-start justify-center gap-1">
        <p className="text-xs text-muted">{metrica.label}</p>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={activa}
          aria-controls="explicacion-metrica"
          aria-label={`${messages.resultados.ayudaDe} ${metrica.label}`}
          className="-mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line-strong text-[11px] font-bold text-muted transition hover:border-fg hover:text-fg"
        >
          ?
        </button>
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums text-fg">{metrica.value}</p>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "gain" | "cost" | "total" | "neutral";
}) {
  const valueClass = {
    gain: "text-gain",
    cost: "text-gas",
    total: "text-fg",
    neutral: "text-fg",
  }[tone];

  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-medium tabular-nums ${valueClass}`}>
        ${redondear(value).toLocaleString("es-MX")}
      </span>
    </div>
  );
}
