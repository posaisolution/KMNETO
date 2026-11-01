import { EntradaPeriodo, Imprevisto, ResultadoPeriodo } from './types';

export function calcularGasolina(entrada: EntradaPeriodo): number {
  if (entrada.gastoRealGasolina !== undefined) {
    return entrada.gastoRealGasolina;
  }

  if (
    entrada.rendimientoKmPorLitro !== undefined &&
    entrada.precioLitro !== undefined
  ) {
    const litros = entrada.km / entrada.rendimientoKmPorLitro;
    return litros * entrada.precioLitro;
  }

  return 0;
}

export function sumarImprevistos(imprevistos: Imprevisto[] = []): number {
  return imprevistos.reduce((total, imp) => total + imp.monto, 0);
}

export function calcularPeriodo(entrada: EntradaPeriodo): ResultadoPeriodo {
  const gasolina = calcularGasolina(entrada);
  const gastosFijos = entrada.gastosFijosPeriodo ?? 0;
  const imprevistos = sumarImprevistos(entrada.imprevistos);
  const otrosGastos = entrada.otrosGastosPeriodo ?? 0;

  const costoTotal = gasolina + gastosFijos + imprevistos + otrosGastos;
  const ingresoTotal =
    entrada.ingresoPlataforma + (entrada.propinasYEfectivo ?? 0);
  const neto = ingresoTotal - costoTotal;

  return {
    gasolina,
    gastosFijos,
    imprevistos,
    otrosGastos,
    costoTotal,
    ingresoTotal,
    neto,
    netoPorHora:
      entrada.horasConectado === 0 ? null : neto / entrada.horasConectado,
    netoPorKm: entrada.km === 0 ? null : neto / entrada.km,
    costoPorKm: entrada.km === 0 ? null : costoTotal / entrada.km,
    margenPct: ingresoTotal === 0 ? null : neto / ingresoTotal,
    puntoEquilibrioHora:
      entrada.horasConectado === 0 ? null : costoTotal / entrada.horasConectado,
  };
}
