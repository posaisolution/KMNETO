import {
  formatearCantidad,
  formatearMoneda,
  formatearPorcentaje,
} from '../calc/format';
import { EntradaPeriodo, ResultadoPeriodo } from '../calc/types';
import { messages } from './messages';

export type MetricaId =
  | 'netoPorViaje'
  | 'puntoEquilibrioViaje'
  | 'netoPorHora'
  | 'puntoEquilibrioHora'
  | 'netoPorKm'
  | 'costoPorKm'
  | 'margenPct';

export type Explicacion = {
  /** What the metric means, in driver language. */
  que: string;
  /** The formula with the real numbers of this calculation. */
  formula: string;
};

/**
 * Builds the human explanation for one result metric, using the exact numbers
 * the driver entered. Formulas must mirror src/lib/calc/calc.ts.
 */
export function explicarMetrica(
  metrica: MetricaId,
  entrada: EntradaPeriodo,
  resultado: ResultadoPeriodo
): Explicacion {
  const neto = formatearMoneda(resultado.neto);
  const costo = formatearMoneda(resultado.costoTotal);
  const horas = formatearCantidad(entrada.horasConectado ?? 0);
  const viajes = formatearCantidad(entrada.viajes);
  const km = formatearCantidad(entrada.km);

  switch (metrica) {
    case 'netoPorViaje':
      return {
        que: messages.explicaciones.netoPorViaje,
        formula: `Ganancia neta ÷ viajes = ${neto} ÷ ${viajes} = ${formatearMoneda(
          resultado.netoPorViaje
        )}`,
      };
    case 'puntoEquilibrioViaje':
      return {
        que: messages.explicaciones.puntoEquilibrioViaje,
        formula: `Costo total ÷ viajes = ${costo} ÷ ${viajes} = ${formatearMoneda(
          resultado.puntoEquilibrioViaje
        )}`,
      };
    case 'netoPorHora':
      return {
        que: messages.explicaciones.netoPorHora,
        formula: `Ganancia neta ÷ horas conectado = ${neto} ÷ ${horas} = ${formatearMoneda(
          resultado.netoPorHora
        )}`,
      };
    case 'puntoEquilibrioHora':
      return {
        que: messages.explicaciones.puntoEquilibrioHora,
        formula: `Costo total ÷ horas conectado = ${costo} ÷ ${horas} = ${formatearMoneda(
          resultado.puntoEquilibrioHora
        )}`,
      };
    case 'netoPorKm':
      return {
        que: messages.explicaciones.netoPorKm,
        formula: `Ganancia neta ÷ km = ${neto} ÷ ${km} = ${formatearMoneda(
          resultado.netoPorKm
        )}`,
      };
    case 'costoPorKm':
      return {
        que: messages.explicaciones.costoPorKm,
        formula: `Costo total ÷ km = ${costo} ÷ ${km} = ${formatearMoneda(
          resultado.costoPorKm
        )}`,
      };
    case 'margenPct':
      return {
        que: messages.explicaciones.margenPct,
        formula: `Ganancia neta ÷ ingreso total = ${neto} ÷ ${formatearMoneda(
          resultado.ingresoTotal
        )} = ${formatearPorcentaje(resultado.margenPct)}`,
      };
  }
}
