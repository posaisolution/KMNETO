export type Imprevisto = {
  fecha: Date;
  categoria: string;
  monto: number;
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
   * Renta del período. Campo abierto: el chofer escribe el monto que paga.
   * En un día es la renta diaria; en una semana, la renta semanal.
   * No se deriva ni se prorratea.
   */
  rentaPeriodo?: number;

  /** Celular y recargas del período. */
  celularRecargasPeriodo?: number;

  /**
   * Real fuel expense for the period.
   * If provided, it overrides the estimation from rendimiento + precio.
   */
  gastoRealGasolina?: number;

  /** Fuel efficiency (km/l). Used only when gastoRealGasolina is not provided. */
  rendimientoKmPorLitro?: number;

  /** Fuel price (MXN/l). Used only when gastoRealGasolina is not provided. */
  precioLitro?: number;

  /** Unexpected expenses that happened in the period (flat tire, tow, fine...). */
  imprevistos?: Imprevisto[];

  /** Defaults to `reales`. */
  imprevistosModo?: ModoImprevistos;

  /** Historical window for the smoothed mode. Without km history it falls back to `reales`. */
  ventanaImprevistos?: VentanaImprevistos;

  /** Other period expenses (food, etc.). */
  otrosGastosPeriodo?: number;
};

export type ResultadoPeriodo = {
  gasolina: number;
  renta: number;
  celularRecargas: number;
  imprevistos: number;
  /** Modo realmente aplicado (en suavizados sin historial se usa `reales`). */
  imprevistosModo: ModoImprevistos;
  /** true cuando se pidió suavizar y no había km de historial: se usaron los reales. */
  historialInsuficiente: boolean;
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
