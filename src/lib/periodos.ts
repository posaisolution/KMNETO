import type {
  Imprevisto as ImprevistoRow,
  Periodo as PeriodoRow,
} from '@/generated/prisma/client';

import {
  calcularPeriodo,
  type EntradaPeriodo,
  type ResultadoPeriodo,
} from './calc';

export type PeriodoConImprevistos = PeriodoRow & { imprevistos: ImprevistoRow[] };

/**
 * Maps a stored period back into the pure calculation input.
 * Stored rows keep only inputs: the result is always recomputed so the
 * engine stays the single source of truth.
 */
export function aEntrada(periodo: PeriodoConImprevistos): EntradaPeriodo {
  return {
    viajes: periodo.viajes,
    horasConectado: periodo.horasConectado ?? undefined,
    km: periodo.km,
    ingresoPlataforma: periodo.ingresoPlataforma,
    propinasYEfectivo: periodo.propinasYEfectivo ?? undefined,
    rentaPeriodo: periodo.rentaPeriodo ?? undefined,
    celularRecargasPeriodo: periodo.celularRecargasPeriodo ?? undefined,
    gastoRealGasolina: periodo.gastoRealGasolina ?? undefined,
    rendimientoKmPorLitro: periodo.rendimientoKmPorLitro ?? undefined,
    precioLitro: periodo.precioLitro ?? undefined,
    imprevistos: periodo.imprevistos.map((imprevisto) => ({
      fecha: imprevisto.fecha,
      categoria: imprevisto.categoria,
      monto: imprevisto.monto,
    })),
    imprevistosModo:
      periodo.imprevistosModo === 'suavizados' ? 'suavizados' : 'reales',
    otrosGastosPeriodo: periodo.otrosGastosPeriodo ?? undefined,
  };
}

export function resultadoDe(periodo: PeriodoConImprevistos): ResultadoPeriodo {
  return calcularPeriodo(aEntrada(periodo));
}
