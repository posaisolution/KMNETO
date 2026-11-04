export type Imprevisto = {
  fecha: Date;
  categoria: string;
  monto: number;
};

/**
 * Datos del auto. Se captura una vez y se puede editar.
 *
 * `precioLitro` es el valor por defecto: si el período trae uno propio, ese manda.
 */
export type PerfilAuto = {
  rendimientoKmPorLitro: number;
  precioLitro: number;
  /** Provisión de mantenimiento por km: aceite, frenos, llantas. */
  provisionMantenimientoPorKm: number;
  valorAuto: number;
  valorResidualEstimado: number;
  /** Kilómetros de vida útil que le quedan al auto. */
  kmVidaUtilRestante: number;
  /** Seguro, financiamiento o renta, verificación, datos, lavado... al mes. */
  gastosFijosMensuales: number;
  /** Divisor del prorrateo de los gastos fijos. Debe ser mayor a 0. */
  diasTrabajadosPorMes: number;
};

/**
 * Cómo se contabilizan los imprevistos.
 * - `reales`: se restan en el período en que ocurrieron.
 * - `suavizados`: se reserva (imprevistos acumulados / km acumulados) * km del período.
 */
export type ModoImprevistos = 'reales' | 'suavizados';

/** Ventana histórica que alimenta el modo suavizado. */
export type VentanaImprevistos = {
  montoAcumulado: number;
  kmAcumulados: number;
};

/** De dónde salió el gasto fijo del resultado. */
export type OrigenGastosFijos = 'capturado' | 'prorrateado' | 'ninguno';

export type EntradaPeriodo = {
  horasConectado: number;
  km: number;
  ingresoPlataforma: number;
  propinasYEfectivo?: number;

  /** Días trabajados dentro del período. Un día suelto es 1. */
  diasTrabajados?: number;

  /** Perfil del auto. Sin perfil no hay mantenimiento, depreciación ni prorrateo. */
  perfil?: PerfilAuto;

  /**
   * Real fuel expense for the period.
   * If provided, it overrides the estimation from rendimiento + precio.
   */
  gastoRealGasolina?: number;

  /** Fuel efficiency (km/l). Falls back to the profile when omitted. */
  rendimientoKmPorLitro?: number;

  /** Fuel price (MXN/l). Falls back to the profile when omitted. */
  precioLitro?: number;

  /**
   * Fixed costs already prorated by the caller for this exact period.
   * When provided it wins over the profile prorating.
   */
  gastosFijosPeriodo?: number;

  /** Unexpected expenses that happened in the period (flat tire, tow, fine...). */
  imprevistos?: Imprevisto[];

  /** Defaults to `reales`. */
  imprevistosModo?: ModoImprevistos;

  /** Historical window for the smoothed mode. Without km history it falls back to `reales`. */
  ventanaImprevistos?: VentanaImprevistos;

  /** Other period expenses (food, cell recharge, etc.). */
  otrosGastosPeriodo?: number;
};

export type ResultadoPeriodo = {
  gasolina: number;
  mantenimiento: number;
  depreciacion: number;
  /** Gasto fijo efectivo: capturado tal cual o prorrateado desde el perfil. */
  gastosFijos: number;
  /** De dónde salió `gastosFijos`. */
  fijosOrigen: OrigenGastosFijos;
  imprevistos: number;
  /** Modo realmente aplicado (en suavizados sin historial se usa `reales`). */
  imprevistosModo: ModoImprevistos;
  /** true cuando se pidió suavizar y no había km de historial: se usaron los reales. */
  historialInsuficiente: boolean;
  otrosGastos: number;
  costoTotal: number;
  ingresoTotal: number;
  neto: number;
  netoPorHora: number | null;
  netoPorKm: number | null;
  costoPorKm: number | null;
  margenPct: number | null;
  puntoEquilibrioHora: number | null;
};
