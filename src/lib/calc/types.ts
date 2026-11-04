export type Imprevisto = {
  fecha: Date;
  categoria: string;
  monto: number;
};

/**
 * Optional vehicle profile for future features (e.g. detailed depreciation).
 * Not used in the simplified MVP calculator.
 */
export type PerfilAuto = {
  rendimientoKmPorLitro: number;
  precioLitro: number;
  provisionMantenimientoPorKm: number;
  valorAuto: number;
  valorResidualEstimado: number;
  kmVidaUtilRestante: number;
  gastosFijosMensuales: number;
  diasTrabajadosPorMes: number;
};

export type EntradaPeriodo = {
  /**
   * Trips completed in the period. Primary denominator for per-trip metrics.
   */
  viajes: number;

  /**
   * Hours online. Optional: per-hour metrics are only reported when provided.
   */
  horasConectado?: number;

  km: number;
  ingresoPlataforma: number;
  propinasYEfectivo?: number;

  /**
   * Real fuel expense for the period.
   * If provided, it overrides the estimation from rendimiento + precio.
   */
  gastoRealGasolina?: number;

  /** Fuel efficiency (km/l). Used only when gastoRealGasolina is not provided. */
  rendimientoKmPorLitro?: number;

  /** Fuel price (MXN/l). Used only when gastoRealGasolina is not provided. */
  precioLitro?: number;

  /** Fixed costs for the period, e.g. car rent, insurance prorated, etc. */
  gastosFijosPeriodo?: number;

  /** Unexpected expenses that happened in the period (flat tire, tow, fine...). */
  imprevistos?: Imprevisto[];

  /** Other period expenses (food, cell recharge, etc.). */
  otrosGastosPeriodo?: number;
};

export type ResultadoPeriodo = {
  gasolina: number;
  gastosFijos: number;
  imprevistos: number;
  otrosGastos: number;
  costoTotal: number;
  ingresoTotal: number;
  neto: number;
  netoPorViaje: number | null;
  puntoEquilibrioViaje: number | null;
  netoPorHora: number | null;
  netoPorKm: number | null;
  costoPorKm: number | null;
  margenPct: number | null;
  puntoEquilibrioHora: number | null;
};
