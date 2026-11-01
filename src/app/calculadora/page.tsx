"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calcularPeriodo, EntradaPeriodo, ResultadoPeriodo } from "@/lib/calc";
import { messages } from "@/lib/i18n/messages";
import {
  formatearMoneda,
  formatearPorcentaje,
  redondear,
} from "@/lib/calc/format";

type GasMode = "real" | "estimado";

type FieldDef = {
  key: string;
  label: string;
  unit?: string;
  required?: boolean;
};

const PERIOD_FIELDS: FieldDef[] = [
  { key: "horasConectado", label: messages.labels.horasConectado, unit: messages.units.horas, required: true },
  { key: "km", label: messages.labels.km, unit: messages.units.km, required: true },
  { key: "ingresoPlataforma", label: messages.labels.ingresoPlataforma, unit: messages.units.pesos, required: true },
  { key: "propinasYEfectivo", label: messages.labels.propinasYEfectivo, unit: messages.units.pesos },
];

const EXPENSE_FIELDS: FieldDef[] = [
  { key: "gastosFijosPeriodo", label: messages.labels.gastosFijosPeriodo, unit: messages.units.pesos },
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

function parseNumber(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

export default function CalculadoraPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [gasMode, setGasMode] = useState<GasMode>("real");
  const [resultado, setResultado] = useState<ResultadoPeriodo | null>(null);

  const allFields = useMemo(
    () => [
      ...PERIOD_FIELDS,
      ...EXPENSE_FIELDS,
      GAS_REAL_FIELD,
      ...GAS_ESTIMATE_FIELDS,
    ],
    []
  );

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    const check = ({ key, required }: FieldDef) => {
      const raw = values[key] ?? "";
      if (raw === "") {
        if (required) next[key] = messages.errors.required;
        return;
      }
      const parsed = parseNumber(raw);
      if (parsed === null) {
        next[key] = messages.errors.invalidNumber;
        return;
      }
      if (parsed < 0) next[key] = messages.errors.negative;
    };

    PERIOD_FIELDS.forEach(check);
    EXPENSE_FIELDS.forEach(check);

    if (gasMode === "real") {
      check(GAS_REAL_FIELD);
    } else {
      GAS_ESTIMATE_FIELDS.forEach(check);
    }

    return next;
  }, [values, gasMode]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleCalcular = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Record<string, boolean> = {};
    allFields.forEach(({ key }) => (allTouched[key] = true));
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) return;

    const entrada: EntradaPeriodo = {
      horasConectado: parseNumber(values.horasConectado) ?? 0,
      km: parseNumber(values.km) ?? 0,
      ingresoPlataforma: parseNumber(values.ingresoPlataforma) ?? 0,
      propinasYEfectivo: parseNumber(values.propinasYEfectivo) ?? undefined,
      gastosFijosPeriodo: parseNumber(values.gastosFijosPeriodo) ?? undefined,
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

    setResultado(calcularPeriodo(entrada));
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

  const renderField = ({ key, label, unit, required }: FieldDef) => (
    <div key={key}>
      <label htmlFor={key} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {!required && <span className="ml-1 text-gray-400">({messages.placeholders.optional})</span>}
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
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-6 pt-4 text-gray-900">
      <header className="mx-auto mb-4 flex max-w-md items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-blue-700 hover:underline">
          ← Volver
        </Link>
        <span className="text-lg font-bold text-blue-700">{messages.app.title}</span>
        <span className="w-12" aria-hidden="true" />
      </header>

      <div className="mx-auto max-w-md space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            {messages.app.title}
          </h1>
          <p className="mt-2 text-sm text-gray-600">{messages.app.subtitle}</p>
        </header>

        <form onSubmit={handleCalcular} className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{messages.sections.periodo}</h2>
            <div className="space-y-4">{PERIOD_FIELDS.map(renderField)}</div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{messages.sections.gastos}</h2>

            <div className="mb-4 rounded-lg bg-gray-100 p-3">
              <span className="block text-sm font-medium text-gray-700">Gasolina</span>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setGasMode("real")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                    gasMode === "real"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  Gasto real
                </button>
                <button
                  type="button"
                  onClick={() => setGasMode("estimado")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                    gasMode === "estimado"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  Estimar
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {gasMode === "real"
                  ? renderField(GAS_REAL_FIELD)
                  : GAS_ESTIMATE_FIELDS.map(renderField)}
              </div>
            </div>

            <div className="space-y-4">{EXPENSE_FIELDS.map(renderField)}</div>
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
              <ResultCard label={messages.resultados.neto} value={formatearMoneda(resultado.neto)} highlight />
              <ResultCard label={messages.resultados.netoPorHora} value={formatearMoneda(resultado.netoPorHora)} highlight />
              <ResultCard label={messages.resultados.netoPorKm} value={formatearMoneda(resultado.netoPorKm)} />
              <ResultCard label={messages.resultados.costoPorKm} value={formatearMoneda(resultado.costoPorKm)} />
              <ResultCard label={messages.resultados.margenPct} value={formatearPorcentaje(resultado.margenPct)} />
              <ResultCard label={messages.resultados.puntoEquilibrioHora} value={formatearMoneda(resultado.puntoEquilibrioHora)} />
            </div>

            <div className="rounded-xl bg-gray-100 p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                {messages.resultados.desglose}
              </h3>
              <div className="space-y-1 text-sm">
                <BreakdownRow label={messages.resultados.ingresoTotal} value={resultado.ingresoTotal} />
                <BreakdownRow label={messages.resultados.gasolina} value={resultado.gasolina} />
                <BreakdownRow label={messages.resultados.gastosFijos} value={resultado.gastosFijos} />
                <BreakdownRow label={messages.resultados.imprevistos} value={resultado.imprevistos} />
                <BreakdownRow label={messages.resultados.otrosGastos} value={resultado.otrosGastos} />
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
    <div className={`rounded-xl p-3 text-center ${highlight ? "bg-blue-50" : "bg-gray-50"}`}>
      <p className="text-xs text-gray-600">{label}</p>
      <p className={`mt-1 font-bold ${highlight ? "text-blue-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">
        ${redondear(value).toLocaleString("es-MX")}
      </span>
    </div>
  );
}
