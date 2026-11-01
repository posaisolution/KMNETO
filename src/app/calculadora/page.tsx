"use client";

import { useMemo, useState } from "react";
import {
  calcularPeriodo,
  EntradaPeriodo,
  PerfilAuto,
  ResultadoPeriodo,
} from "@/lib/calc";
import { messages } from "@/lib/i18n/messages";
import { formatearMoneda, formatearPorcentaje, redondear } from "@/lib/calc/format";

const REQUIRED_FIELDS: { key: keyof PerfilAuto | keyof EntradaPeriodo; label: string; unit?: string }[] = [
  { key: "rendimientoKmPorLitro", label: messages.labels.rendimientoKmPorLitro, unit: messages.units.kmPorLitro },
  { key: "precioLitro", label: messages.labels.precioLitro, unit: messages.units.pesosPorLitro },
  { key: "provisionMantenimientoPorKm", label: messages.labels.provisionMantenimientoPorKm, unit: messages.units.pesosPorKm },
  { key: "valorAuto", label: messages.labels.valorAuto, unit: messages.units.pesos },
  { key: "valorResidualEstimado", label: messages.labels.valorResidualEstimado, unit: messages.units.pesos },
  { key: "kmVidaUtilRestante", label: messages.labels.kmVidaUtilRestante, unit: messages.units.km },
  { key: "gastosFijosMensuales", label: messages.labels.gastosFijosMensuales, unit: messages.units.pesos },
  { key: "diasTrabajadosPorMes", label: messages.labels.diasTrabajadosPorMes, unit: messages.units.dias },
  { key: "horasConectado", label: messages.labels.horasConectado, unit: messages.units.horas },
  { key: "km", label: messages.labels.km, unit: messages.units.km },
  { key: "ingresoPlataforma", label: messages.labels.ingresoPlataforma, unit: messages.units.pesos },
  { key: "diasTrabajados", label: messages.labels.diasTrabajados, unit: messages.units.dias },
];

const OPTIONAL_FIELDS: { key: keyof EntradaPeriodo; label: string; unit?: string }[] = [
  { key: "propinasYEfectivo", label: messages.labels.propinasYEfectivo, unit: messages.units.pesos },
];

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

export default function Home() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [resultado, setResultado] = useState<ResultadoPeriodo | null>(null);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].forEach(({ key }) => {
      const raw = values[key] ?? "";
      if (raw === "") {
        if (REQUIRED_FIELDS.some((f) => f.key === key)) {
          next[key] = messages.errors.required;
        }
        return;
      }
      const parsed = parseNumber(raw);
      if (parsed === null) {
        next[key] = messages.errors.invalidNumber;
        return;
      }
      if (parsed < 0) {
        next[key] = messages.errors.negative;
      }
    });
    return next;
  }, [values]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleCalcular = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Record<string, boolean> = {};
    [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].forEach(({ key }) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    const hasErrors = REQUIRED_FIELDS.some(({ key }) => errors[key]);
    if (hasErrors) return;

    const perfil: PerfilAuto = {
      rendimientoKmPorLitro: parseNumber(values.rendimientoKmPorLitro) ?? 0,
      precioLitro: parseNumber(values.precioLitro) ?? 0,
      provisionMantenimientoPorKm: parseNumber(values.provisionMantenimientoPorKm) ?? 0,
      valorAuto: parseNumber(values.valorAuto) ?? 0,
      valorResidualEstimado: parseNumber(values.valorResidualEstimado) ?? 0,
      kmVidaUtilRestante: parseNumber(values.kmVidaUtilRestante) ?? 0,
      gastosFijosMensuales: parseNumber(values.gastosFijosMensuales) ?? 0,
      diasTrabajadosPorMes: parseNumber(values.diasTrabajadosPorMes) ?? 0,
    };

    const entrada: EntradaPeriodo = {
      horasConectado: parseNumber(values.horasConectado) ?? 0,
      km: parseNumber(values.km) ?? 0,
      ingresoPlataforma: parseNumber(values.ingresoPlataforma) ?? 0,
      propinasYEfectivo: parseNumber(values.propinasYEfectivo) ?? undefined,
      diasTrabajados: parseNumber(values.diasTrabajados) ?? 0,
    };

    setResultado(calcularPeriodo(entrada, perfil));
  };

  const handleLimpiar = () => {
    setValues({});
    setTouched({});
    setResultado(null);
  };

  const inputClass = (hasError: boolean) =>
    [
      "w-full rounded-lg border bg-white px-4 py-3 text-lg text-black shadow-sm outline-none transition",
      "focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
      hasError ? "border-red-500" : "border-gray-300",
    ].join(" ");

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900">
      <div className="mx-auto max-w-md space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">{messages.app.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{messages.app.subtitle}</p>
        </header>

        <form onSubmit={handleCalcular} className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{messages.sections.auto}</h2>
            <div className="space-y-4">
              {REQUIRED_FIELDS.slice(0, 8).map(({ key, label, unit }) => (
                <div key={key}>
                  <label htmlFor={key} className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
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
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        {unit}
                      </span>
                    )}
                  </div>
                  {touched[key] && errors[key] && (
                    <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{messages.sections.periodo}</h2>
            <div className="space-y-4">
              {REQUIRED_FIELDS.slice(8).map(({ key, label, unit }) => (
                <div key={key}>
                  <label htmlFor={key} className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
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
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        {unit}
                      </span>
                    )}
                  </div>
                  {touched[key] && errors[key] && (
                    <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
                  )}
                </div>
              ))}
              {OPTIONAL_FIELDS.map(({ key, label, unit }) => (
                <div key={key}>
                  <label htmlFor={key} className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      id={key}
                      name={key}
                      inputMode="decimal"
                      type="text"
                      placeholder={messages.placeholders.optional}
                      value={values[key] ?? ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className={inputClass(Boolean(touched[key] && errors[key]))}
                    />
                    {unit && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        {unit}
                      </span>
                    )}
                  </div>
                  {touched[key] && errors[key] && (
                    <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 px-4 py-4 text-lg font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800"
            >
              {messages.buttons.calcular}
            </button>
            <button
              type="button"
              onClick={handleLimpiar}
              className="rounded-xl bg-gray-200 px-4 py-4 text-lg font-semibold text-gray-700 shadow hover:bg-gray-300 active:bg-gray-400"
            >
              {messages.buttons.limpiar}
            </button>
          </div>
        </form>

        {resultado && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{messages.sections.resultados}</h2>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <ResultCard
                label={messages.resultados.neto}
                value={formatearMoneda(resultado.neto)}
                highlight
              />
              <ResultCard
                label={messages.resultados.netoPorHora}
                value={formatearMoneda(resultado.netoPorHora)}
                highlight
              />
              <ResultCard
                label={messages.resultados.netoPorKm}
                value={formatearMoneda(resultado.netoPorKm)}
              />
              <ResultCard
                label={messages.resultados.costoPorKm}
                value={formatearMoneda(resultado.costoPorKm)}
              />
              <ResultCard
                label={messages.resultados.margenPct}
                value={formatearPorcentaje(resultado.margenPct)}
              />
              <ResultCard
                label={messages.resultados.puntoEquilibrioHora}
                value={formatearMoneda(resultado.puntoEquilibrioHora)}
              />
            </div>

            <div className="rounded-xl bg-gray-100 p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                {messages.resultados.desglose}
              </h3>
              <div className="space-y-1 text-sm">
                <BreakdownRow label={messages.resultados.ingresoTotal} value={resultado.ingresoTotal} />
                <BreakdownRow label={messages.resultados.gasolina} value={resultado.gasolina} />
                <BreakdownRow label={messages.resultados.mantenimiento} value={resultado.mantenimiento} />
                <BreakdownRow label={messages.resultados.depreciacion} value={resultado.depreciacion} />
                <BreakdownRow label={messages.resultados.fijosProrrateados} value={resultado.fijosProrrateados} />
                <BreakdownRow label={messages.resultados.costoTotal} value={resultado.costoTotal} />
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ResultCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl p-3 text-center",
        highlight ? "bg-blue-50" : "bg-gray-50",
      ].join(" ")}
    >
      <p className="text-xs text-gray-600">{label}</p>
      <p className={`mt-1 font-bold ${highlight ? "text-blue-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">${redondear(value).toLocaleString("es-MX")}</span>
    </div>
  );
}
