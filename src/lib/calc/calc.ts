import {
  EntradaPeriodo,
  Imprevisto,
  ModoImprevistos,
  ResultadoPeriodo,
  VentanaImprevistos,
} from './types';

export function calcularGasolina(entrada: EntradaPeriodo): number {
  if (entrada.gastoRealGasolina !== undefined) {
    return entrada.gastoRealGasolina;
  }

  const rendimiento = entrada.rendimientoKmPorLitro;
  const precio = entrada.precioLitro;

  if (rendimiento !== undefined && precio !== undefined && rendimiento > 0) {
    const litros = entrada.km / rendimiento;
    return litros * precio;
  }

  return 0;
}

export function sumarImprevistos(imprevistos: Imprevisto[] = []): number {
  return imprevistos.reduce((total, imp) => total + imp.monto, 0);
}

/**
 * Imprevistos según el modo pedido.
 *
 * Sin historial de kilómetros no hay denominador posible: se usan los reales
 * y se avisa, como pide la especificación.
 */
export function calcularImprevistos({
  modo,
  reales,
  ventana,
  km,
}: {
  modo: ModoImprevistos;
  reales?: Imprevisto[];
  ventana?: VentanaImprevistos;
  km: number;
}): { monto: number; modo: ModoImprevistos; historialInsuficiente: boolean } {
  const realesTotal = sumarImprevistos(reales);

  if (modo === 'reales') {
    return { monto: realesTotal, modo: 'reales', historialInsuficiente: false };
  }

  if (!ventana || ventana.kmAcumulados <= 0) {
    return { monto: realesTotal, modo: 'reales', historialInsuficiente: true };
  }

  const reservaPorKm = ventana.montoAcumulado / ventana.kmAcumulados;
  return {
    monto: reservaPorKm * km,
    modo: 'suavizados',
    historialInsuficiente: false,
  };
}

export function calcularPeriodo(entrada: EntradaPeriodo): ResultadoPeriodo {
  const gasolina = calcularGasolina(entrada);
  const renta = entrada.rentaPeriodo ?? 0;
  const celularRecargas = entrada.celularRecargasPeriodo ?? 0;

  const imprevistosCalculados = calcularImprevistos({
    modo: entrada.imprevistosModo ?? 'reales',
    reales: entrada.imprevistos,
    ventana: entrada.ventanaImprevistos,
    km: entrada.km,
  });
  const imprevistos = imprevistosCalculados.monto;

  const otrosGastos = entrada.otrosGastosPeriodo ?? 0;

  const costoTotal = gasolina + renta + celularRecargas + imprevistos + otrosGastos;
  const ingresoTotal =
    entrada.ingresoPlataforma + (entrada.propinasYEfectivo ?? 0);
  const neto = ingresoTotal - costoTotal;

  const viajes = entrada.viajes;
  const horas = entrada.horasConectado ?? 0;

  return {
    gasolina,
    renta,
    celularRecargas,
    imprevistos,
    imprevistosModo: imprevistosCalculados.modo,
    historialInsuficiente: imprevistosCalculados.historialInsuficiente,
    otrosGastos,
    costoTotal,
    ingresoTotal,
    neto,
    netoPorViaje: viajes === 0 ? null : neto / viajes,
    puntoEquilibrioViaje: viajes === 0 ? null : costoTotal / viajes,
    netoPorHora: horas === 0 ? null : neto / horas,
    netoPorKm: entrada.km === 0 ? null : neto / entrada.km,
    costoPorKm: entrada.km === 0 ? null : costoTotal / entrada.km,
    margenPct: ingresoTotal === 0 ? null : neto / ingresoTotal,
    puntoEquilibrioHora: horas === 0 ? null : costoTotal / horas,
  };
}
