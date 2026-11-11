import type { EntradaPeriodo } from './calc';

export type GasMode = 'real' | 'estimado';

/** Which fuel mode the stored period used. */
export function modoGasolina(entrada: EntradaPeriodo): GasMode {
  return entrada.gastoRealGasolina !== undefined ? 'real' : 'estimado';
}

/**
 * Turns a stored period back into the calculator's form values.
 * Only used to prefill the edit form; the calculation always recomputes.
 */
export function entradaAValores(entrada: EntradaPeriodo): Record<string, string> {
  const values: Record<string, string> = {};

  const set = (key: string, value: number | undefined) => {
    if (value !== undefined) {
      values[key] = String(value);
    }
  };

  set('viajes', entrada.viajes);
  set('horasConectado', entrada.horasConectado);
  set('km', entrada.km);
  set('ingresoPlataforma', entrada.ingresoPlataforma);
  set('propinasYEfectivo', entrada.propinasYEfectivo);
  set('rentaPeriodo', entrada.rentaPeriodo);
  set('celularRecargasPeriodo', entrada.celularRecargasPeriodo);
  set('otrosGastosPeriodo', entrada.otrosGastosPeriodo);

  if (entrada.gastoRealGasolina !== undefined) {
    set('gastoRealGasolina', entrada.gastoRealGasolina);
  } else {
    set('rendimientoKmPorLitro', entrada.rendimientoKmPorLitro);
    set('precioLitro', entrada.precioLitro);
  }

  const totalImprevistos = (entrada.imprevistos ?? []).reduce(
    (total, imprevisto) => total + imprevisto.monto,
    0,
  );

  if (totalImprevistos > 0) {
    values.imprevistos = String(totalImprevistos);
  }

  return values;
}
