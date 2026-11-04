import { describe, expect, it } from 'vitest';
import {
  calcularDepreciacionPorKm,
  calcularFijosProrrateados,
  calcularGasolina,
  calcularImprevistos,
  calcularMantenimiento,
  calcularPeriodo,
  sumarImprevistos,
} from './calc';
import { EntradaPeriodo, PerfilAuto } from './types';

const entradaBase: EntradaPeriodo = {
  horasConectado: 10,
  km: 180,
  ingresoPlataforma: 1_400,
  propinasYEfectivo: 0,
  gastoRealGasolina: 360,
  gastosFijosPeriodo: 300,
  imprevistos: [{ fecha: new Date('2026-10-31'), categoria: 'Llanta', monto: 250 }],
  otrosGastosPeriodo: 100,
};

describe('cálculo de gasolina', () => {
  it('usa el gasto real cuando se proporciona', () => {
    expect(
      calcularGasolina({
        ...entradaBase,
        gastoRealGasolina: 400,
      })
    ).toBe(400);
  });

  it('estima por rendimiento y precio cuando no hay gasto real', () => {
    expect(
      calcularGasolina({
        ...entradaBase,
        gastoRealGasolina: undefined,
        rendimientoKmPorLitro: 12,
        precioLitro: 24,
      })
    ).toBeCloseTo(360, 2);
  });

  it('devuelve 0 si no hay datos de gasolina', () => {
    expect(
      calcularGasolina({
        ...entradaBase,
        gastoRealGasolina: undefined,
        rendimientoKmPorLitro: undefined,
        precioLitro: undefined,
      })
    ).toBe(0);
  });
});

describe('sumar imprevistos', () => {
  it('suma los montos de los imprevistos', () => {
    expect(
      sumarImprevistos([
        { fecha: new Date(), categoria: 'Llanta', monto: 250 },
        { fecha: new Date(), categoria: 'Grúa', monto: 350 },
      ])
    ).toBe(600);
  });
});

describe('caso calculado a mano', () => {
  it('calcula el resultado completo con gastos del período', () => {
    const r = calcularPeriodo(entradaBase);

    expect(r.gasolina).toBeCloseTo(360, 2);
    expect(r.gastosFijos).toBeCloseTo(300, 2);
    expect(r.imprevistos).toBeCloseTo(250, 2);
    expect(r.otrosGastos).toBeCloseTo(100, 2);

    expect(r.costoTotal).toBeCloseTo(1_010, 2);
    expect(r.ingresoTotal).toBeCloseTo(1_400, 2);
    expect(r.neto).toBeCloseTo(390, 2);
    expect(r.netoPorHora).toBeCloseTo(39, 2);
    expect(r.netoPorKm).toBeCloseTo(2.17, 2);
    expect(r.costoPorKm).toBeCloseTo(5.61, 2);
    expect(r.margenPct).toBeCloseTo(0.2786, 4);
    expect(r.puntoEquilibrioHora).toBeCloseTo(101, 2);
  });

  it('calcula sin imprevistos ni otros gastos', () => {
    const r = calcularPeriodo({
      ...entradaBase,
      imprevistos: [],
      otrosGastosPeriodo: 0,
    });

    expect(r.costoTotal).toBeCloseTo(660, 2);
    expect(r.neto).toBeCloseTo(740, 2);
    expect(r.netoPorHora).toBeCloseTo(74, 2);
  });
});

describe('protección contra divisiones entre cero', () => {
  it('devuelve null cuando horasConectado es 0', () => {
    const r = calcularPeriodo({ ...entradaBase, horasConectado: 0 });
    expect(r.netoPorHora).toBeNull();
    expect(r.puntoEquilibrioHora).toBeNull();
  });

  it('devuelve null cuando km es 0', () => {
    const r = calcularPeriodo({ ...entradaBase, km: 0 });
    expect(r.netoPorKm).toBeNull();
    expect(r.costoPorKm).toBeNull();
  });

  it('devuelve null cuando ingresoTotal es 0', () => {
    const r = calcularPeriodo({ ...entradaBase, ingresoPlataforma: 0 });
    expect(r.margenPct).toBeNull();
  });
});

/**
 * Perfil del caso del PROMPT_HITO_A.
 * Depreciación por km = (200,000 - 140,000) / 200,000 = $0.30/km
 */
const perfilHitoA: PerfilAuto = {
  rendimientoKmPorLitro: 12,
  precioLitro: 24,
  provisionMantenimientoPorKm: 0.6,
  valorAuto: 200_000,
  valorResidualEstimado: 140_000,
  kmVidaUtilRestante: 200_000,
  gastosFijosMensuales: 3_000,
  diasTrabajadosPorMes: 26,
};

const entradaHitoA: EntradaPeriodo = {
  horasConectado: 10,
  km: 180,
  ingresoPlataforma: 1_400,
  propinasYEfectivo: 0,
  diasTrabajados: 1,
  perfil: perfilHitoA,
  imprevistos: [{ fecha: new Date('2026-10-31'), categoria: 'Llanta', monto: 250 }],
  imprevistosModo: 'reales',
};

describe('caso calculado a mano del Hito A', () => {
  it('descuenta mantenimiento, depreciación y fijos prorrateados', () => {
    const r = calcularPeriodo(entradaHitoA);

    // 180 km / 12 km/l * $24/l
    expect(r.gasolina).toBeCloseTo(360, 2);
    // 180 km * $0.60/km
    expect(r.mantenimiento).toBeCloseTo(108, 2);
    // 180 km * $0.30/km
    expect(r.depreciacion).toBeCloseTo(54, 2);
    // ($3,000 / 26 días) * 1 día
    expect(r.gastosFijos).toBeCloseTo(115.38, 2);
    expect(r.imprevistos).toBeCloseTo(250, 2);

    expect(r.costoTotal).toBeCloseTo(887.38, 2);
    expect(r.neto).toBeCloseTo(512.62, 2);
    expect(r.netoPorHora).toBeCloseTo(51.26, 2);
    expect(r.netoPorKm).toBeCloseTo(2.85, 2);
    expect(r.margenPct).toBeCloseTo(0.366, 3);
    expect(r.puntoEquilibrioHora).toBeCloseTo(88.74, 2);
  });

  it('sube el neto cuando no hay imprevisto', () => {
    const r = calcularPeriodo({ ...entradaHitoA, imprevistos: [] });

    expect(r.costoTotal).toBeCloseTo(637.38, 2);
    expect(r.neto).toBeCloseTo(762.62, 2);
    expect(r.netoPorHora).toBeCloseTo(76.26, 2);
  });
});

describe('mantenimiento y depreciación', () => {
  it('calcula el mantenimiento por kilómetro', () => {
    expect(calcularMantenimiento(180, 0.6)).toBeCloseTo(108, 2);
  });

  it('deriva la depreciación por kilómetro del perfil', () => {
    expect(calcularDepreciacionPorKm(perfilHitoA)).toBeCloseTo(0.3, 4);
  });

  it('no deprecia si al auto no le quedan kilómetros de vida útil', () => {
    expect(
      calcularDepreciacionPorKm({ ...perfilHitoA, kmVidaUtilRestante: 0 })
    ).toBe(0);
  });

  it('no deprecia si el valor residual alcanza el valor del auto', () => {
    expect(
      calcularDepreciacionPorKm({ ...perfilHitoA, valorResidualEstimado: 200_000 })
    ).toBe(0);
  });

  it('no inventa mantenimiento ni depreciación cuando no hay perfil', () => {
    const r = calcularPeriodo({
      ...entradaHitoA,
      perfil: undefined,
      gastoRealGasolina: 350,
    });

    expect(r.mantenimiento).toBe(0);
    expect(r.depreciacion).toBe(0);
    expect(r.gastosFijos).toBe(0);
    expect(r.fijosOrigen).toBe('ninguno');
  });
});

describe('gastos fijos prorrateados', () => {
  it('prorratea el gasto mensual por un día trabajado', () => {
    expect(calcularFijosProrrateados(3_000, 26, 1)).toBeCloseTo(115.38, 2);
  });

  it('prorratea una semana de 6 días', () => {
    expect(calcularFijosProrrateados(3_000, 26, 6)).toBeCloseTo(692.31, 2);
  });

  it('devuelve 0 si los días por mes no sirven de divisor', () => {
    expect(calcularFijosProrrateados(3_000, 0, 1)).toBe(0);
  });

  it('respeta el gasto fijo capturado en lugar de prorratear', () => {
    const r = calcularPeriodo({ ...entradaHitoA, gastosFijosPeriodo: 500 });

    expect(r.gastosFijos).toBe(500);
    expect(r.fijosOrigen).toBe('capturado');
  });

  it('marca el origen prorrateado cuando no hay gasto capturado', () => {
    expect(calcularPeriodo(entradaHitoA).fijosOrigen).toBe('prorrateado');
  });
});

describe('imprevistos suavizados', () => {
  it('reparte la reserva histórica por kilómetro del período', () => {
    const r = calcularPeriodo({
      ...entradaHitoA,
      imprevistosModo: 'suavizados',
      ventanaImprevistos: { montoAcumulado: 2_000, kmAcumulados: 5_000 },
    });

    // ($2,000 / 5,000 km) * 180 km = $72
    expect(r.imprevistos).toBeCloseTo(72, 2);
    expect(r.historialInsuficiente).toBe(false);
  });

  it('usa los reales y avisa cuando no hay historial de kilómetros', () => {
    const r = calcularPeriodo({
      ...entradaHitoA,
      imprevistosModo: 'suavizados',
      ventanaImprevistos: { montoAcumulado: 2_000, kmAcumulados: 0 },
    });

    expect(r.imprevistos).toBeCloseTo(250, 2);
    expect(r.historialInsuficiente).toBe(true);
  });

  it('en modo reales no suaviza ni avisa', () => {
    const r = calcularPeriodo(entradaHitoA);

    expect(r.imprevistos).toBeCloseTo(250, 2);
    expect(r.historialInsuficiente).toBe(false);
  });

  it('expone el modo usado en el resultado', () => {
    expect(calcularPeriodo(entradaHitoA).imprevistosModo).toBe('reales');
    expect(
      calcularPeriodo({
        ...entradaHitoA,
        imprevistosModo: 'suavizados',
        ventanaImprevistos: { montoAcumulado: 2_000, kmAcumulados: 5_000 },
      }).imprevistosModo
    ).toBe('suavizados');
  });

  it('coincide con la suma directa en modo reales', () => {
    expect(
      calcularImprevistos({
        modo: 'reales',
        reales: entradaHitoA.imprevistos,
        km: 180,
      }).monto
    ).toBeCloseTo(250, 2);
  });
});

describe('gasolina con perfil del auto', () => {
  it('usa rendimiento y precio del perfil cuando el período no los trae', () => {
    expect(calcularGasolina(entradaHitoA)).toBeCloseTo(360, 2);
  });

  it('el precio del período manda sobre el del perfil', () => {
    // 180 km / 12 km/l * $30/l
    expect(calcularGasolina({ ...entradaHitoA, precioLitro: 30 })).toBeCloseTo(450, 2);
  });

  it('el gasto real manda sobre el perfil', () => {
    expect(
      calcularGasolina({ ...entradaHitoA, gastoRealGasolina: 350 })
    ).toBeCloseTo(350, 2);
  });
});
