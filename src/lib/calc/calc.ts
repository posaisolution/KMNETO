import {
  EntradaPeriodo,
  Imprevisto,
  ModoImprevistos,
  PerfilAuto,
  ResultadoPeriodo,
  VentanaImprevistos,
} from './types';

export function calcularGasolina(entrada: EntradaPeriodo): number {
  if (entrada.gastoRealGasolina !== undefined) {
    return entrada.gastoRealGasolina;
  }

  // El período manda sobre el perfil: el precio del litro cambia seguido.
  const rendimiento =
    entrada.rendimientoKmPorLitro ?? entrada.perfil?.rendimientoKmPorLitro;
  const precio = entrada.precioLitro ?? entrada.perfil?.precioLitro;

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
 * Desgaste esperado: aceite, filtros, frenos, llantas.
 * Complementa a los imprevistos, no los duplica (AGENTS.md §4).
 */
export function calcularMantenimiento(
  km: number,
  provisionMantenimientoPorKm: number
): number {
  return km * provisionMantenimientoPorKm;
}

/**
 * Depreciación por kilómetro: (valor - residual) / km de vida útil restante.
 *
 * Sin vida útil restante no hay más valor que perder, y si el residual alcanza
 * el valor del auto la depreciación es 0 en lugar de negativa.
 */
export function calcularDepreciacionPorKm(perfil: PerfilAuto): number {
  if (perfil.kmVidaUtilRestante <= 0) return 0;

  const valorDepreciable = perfil.valorAuto - perfil.valorResidualEstimado;
  if (valorDepreciable <= 0) return 0;

  return valorDepreciable / perfil.kmVidaUtilRestante;
}

/**
 * Prorrateo de gastos fijos mensuales sobre los días trabajados del período.
 *
 * La renta se paga completa aunque se trabaje menos, así que el costo por día
 * es (gasto mensual / días trabajados al mes). Es la única base de prorrateo:
 * no mezclar días por semana con días por mes.
 */
export function calcularFijosProrrateados(
  gastosFijosMensuales: number,
  diasTrabajadosPorMes: number,
  diasTrabajados: number
): number {
  if (diasTrabajadosPorMes <= 0) return 0;
  return (gastosFijosMensuales / diasTrabajadosPorMes) * diasTrabajados;
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
  const diasTrabajados = entrada.diasTrabajados ?? 1;
  const perfil = entrada.perfil;

  const gasolina = calcularGasolina(entrada);

  const mantenimiento = perfil
    ? calcularMantenimiento(entrada.km, perfil.provisionMantenimientoPorKm)
    : 0;

  const depreciacion = perfil
    ? entrada.km * calcularDepreciacionPorKm(perfil)
    : 0;

  let gastosFijos: number;
  let fijosOrigen: ResultadoPeriodo['fijosOrigen'];

  if (entrada.gastosFijosPeriodo !== undefined) {
    gastosFijos = entrada.gastosFijosPeriodo;
    fijosOrigen = 'capturado';
  } else if (perfil) {
    gastosFijos = calcularFijosProrrateados(
      perfil.gastosFijosMensuales,
      perfil.diasTrabajadosPorMes,
      diasTrabajados
    );
    fijosOrigen = 'prorrateado';
  } else {
    gastosFijos = 0;
    fijosOrigen = 'ninguno';
  }

  const imprevistosCalculados = calcularImprevistos({
    modo: entrada.imprevistosModo ?? 'reales',
    reales: entrada.imprevistos,
    ventana: entrada.ventanaImprevistos,
    km: entrada.km,
  });
  const imprevistos = imprevistosCalculados.monto;

  const otrosGastos = entrada.otrosGastosPeriodo ?? 0;

  const costoTotal =
    gasolina + mantenimiento + depreciacion + gastosFijos + imprevistos + otrosGastos;
  const ingresoTotal =
    entrada.ingresoPlataforma + (entrada.propinasYEfectivo ?? 0);
  const neto = ingresoTotal - costoTotal;

  const viajes = entrada.viajes;
  const horas = entrada.horasConectado ?? 0;

  return {
    gasolina,
    mantenimiento,
    depreciacion,
    gastosFijos,
    fijosOrigen,
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
