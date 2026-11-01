import {
  EntradaPeriodo,
  HistorialImprevistos,
  Imprevisto,
  ModoImprevistos,
  PerfilAuto,
  ResultadoPeriodo,
} from './types';

export const KM_MINIMOS_HISTORICO_SUFICIENTE = 1_000;

export function calcularGasolina(
  km: number,
  perfil: PerfilAuto,
  gastoRealGasolina?: number
): number {
  if (gastoRealGasolina !== undefined) {
    return gastoRealGasolina;
  }
  const litros = km / perfil.rendimientoKmPorLitro;
  return litros * perfil.precioLitro;
}

export function calcularMantenimiento(
  km: number,
  perfil: PerfilAuto
): number {
  return km * perfil.provisionMantenimientoPorKm;
}

export function calcularDepreciacion(
  km: number,
  perfil: PerfilAuto
): number {
  const depreciacionPorKm =
    (perfil.valorAuto - perfil.valorResidualEstimado) /
    perfil.kmVidaUtilRestante;
  return km * depreciacionPorKm;
}

export function calcularFijosProrrateados(
  diasTrabajados: number,
  perfil: PerfilAuto
): number {
  return (perfil.gastosFijosMensuales / perfil.diasTrabajadosPorMes) * diasTrabajados;
}

export function sumarImprevistosReales(imprevistos: Imprevisto[]): number {
  return imprevistos.reduce((total, imp) => total + imp.monto, 0);
}

export function calcularImprevistosSuavizados(
  km: number,
  imprevistosPeriodo: Imprevisto[],
  historial: HistorialImprevistos,
  umbralKmHistorico: number = KM_MINIMOS_HISTORICO_SUFICIENTE
): { monto: number; historialInsuficiente: boolean } {
  if (historial.kmTotal < umbralKmHistorico) {
    return {
      monto: sumarImprevistosReales(imprevistosPeriodo),
      historialInsuficiente: true,
    };
  }

  const totalImprevistosHistoricos = sumarImprevistosReales(historial.imprevistos);
  const tasaImprevistosPorKm = totalImprevistosHistoricos / historial.kmTotal;
  return {
    monto: km * tasaImprevistosPorKm,
    historialInsuficiente: false,
  };
}

export function calcularPeriodo(
  entrada: EntradaPeriodo,
  perfil: PerfilAuto,
  opciones: {
    imprevistos?: Imprevisto[];
    modoImprevistos?: ModoImprevistos;
    historialImprevistos?: HistorialImprevistos;
    umbralKmHistorico?: number;
  } = {}
): ResultadoPeriodo {
  const {
    imprevistos = [],
    modoImprevistos = 'reales',
    historialImprevistos = { imprevistos: [], kmTotal: 0 },
    umbralKmHistorico = KM_MINIMOS_HISTORICO_SUFICIENTE,
  } = opciones;

  const gasolina = calcularGasolina(
    entrada.km,
    perfil,
    entrada.gastoRealGasolina
  );
  const mantenimiento = calcularMantenimiento(entrada.km, perfil);
  const depreciacion = calcularDepreciacion(entrada.km, perfil);
  const fijosProrrateados = calcularFijosProrrateados(
    entrada.diasTrabajados,
    perfil
  );

  let montoImprevistos: number;
  let historialInsuficiente = false;

  if (modoImprevistos === 'suavizados') {
    const suavizado = calcularImprevistosSuavizados(
      entrada.km,
      imprevistos,
      historialImprevistos,
      umbralKmHistorico
    );
    montoImprevistos = suavizado.monto;
    historialInsuficiente = suavizado.historialInsuficiente;
  } else {
    montoImprevistos = sumarImprevistosReales(imprevistos);
  }

  const costoTotal =
    gasolina + mantenimiento + depreciacion + fijosProrrateados + montoImprevistos;

  const ingresoTotal =
    entrada.ingresoPlataforma + (entrada.propinasYEfectivo ?? 0);

  const neto = ingresoTotal - costoTotal;

  const netoPorHora =
    entrada.horasConectado === 0 ? null : neto / entrada.horasConectado;
  const netoPorKm = entrada.km === 0 ? null : neto / entrada.km;
  const costoPorKm = entrada.km === 0 ? null : costoTotal / entrada.km;
  const margenPct = ingresoTotal === 0 ? null : neto / ingresoTotal;
  const puntoEquilibrioHora =
    entrada.horasConectado === 0 ? null : costoTotal / entrada.horasConectado;

  return {
    gasolina,
    mantenimiento,
    depreciacion,
    fijosProrrateados,
    imprevistos: montoImprevistos,
    costoTotal,
    ingresoTotal,
    neto,
    netoPorHora,
    netoPorKm,
    costoPorKm,
    margenPct,
    puntoEquilibrioHora,
    modoImprevistos,
    imprevistosHistorialInsuficiente: historialInsuficiente,
  };
}
