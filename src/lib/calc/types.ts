export type Imprevisto = {
  fecha: Date;
  categoria: string;
  monto: number;
};

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
  horasConectado: number;
  km: number;
  ingresoPlataforma: number;
  propinasYEfectivo?: number;
  diasTrabajados: number;
  gastoRealGasolina?: number;
};

export type HistorialImprevistos = {
  imprevistos: Imprevisto[];
  kmTotal: number;
};

export type ModoImprevistos = 'reales' | 'suavizados';

export type ResultadoPeriodo = {
  gasolina: number;
  mantenimiento: number;
  depreciacion: number;
  fijosProrrateados: number;
  imprevistos: number;
  costoTotal: number;
  ingresoTotal: number;
  neto: number;
  netoPorHora: number | null;
  netoPorKm: number | null;
  costoPorKm: number | null;
  margenPct: number | null;
  puntoEquilibrioHora: number | null;
  modoImprevistos: ModoImprevistos;
  imprevistosHistorialInsuficiente: boolean;
};
