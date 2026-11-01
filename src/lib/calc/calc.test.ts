import { describe, expect, it } from 'vitest';
import {
  calcularGasolina,
  calcularMantenimiento,
  calcularDepreciacion,
  calcularFijosProrrateados,
  calcularImprevistosSuavizados,
  calcularPeriodo,
  sumarImprevistosReales,
} from './calc';
import { EntradaPeriodo, PerfilAuto } from './types';

const perfilBase: PerfilAuto = {
  rendimientoKmPorLitro: 12,
  precioLitro: 24,
  provisionMantenimientoPorKm: 0.6,
  valorAuto: 100_000,
  valorResidualEstimado: 46_000,
  kmVidaUtilRestante: 180_000,
  gastosFijosMensuales: 3_000,
  diasTrabajadosPorMes: 26,
};

const entradaBase: EntradaPeriodo = {
  horasConectado: 10,
  km: 180,
  ingresoPlataforma: 1_400,
  propinasYEfectivo: 0,
  diasTrabajados: 1,
};

describe('cálculo de gasolina', () => {
  it('calcula por rendimiento cuando no hay gasto real', () => {
    expect(calcularGasolina(180, perfilBase)).toBeCloseTo(360, 2);
  });

  it('usa el gasto real cuando se proporciona', () => {
    expect(calcularGasolina(180, perfilBase, 400)).toBe(400);
  });
});

describe('cálculo de mantenimiento', () => {
  it('multiplica km por la provisión', () => {
    expect(calcularMantenimiento(180, perfilBase)).toBeCloseTo(108, 2);
  });
});

describe('cálculo de depreciación', () => {
  it('calcula depreciación por km', () => {
    expect(calcularDepreciacion(180, perfilBase)).toBeCloseTo(54, 2);
  });
});

describe('cálculo de gastos fijos prorrateados', () => {
  it('prorratea los fijos mensuales por días trabajados', () => {
    expect(calcularFijosProrrateados(1, perfilBase)).toBeCloseTo(115.38, 2);
  });
});

describe('imprevistos reales', () => {
  it('suma los imprevistos del período', () => {
    const imprevistos = [
      { fecha: new Date('2026-10-31'), categoria: 'Llanta', monto: 250 },
    ];
    expect(sumarImprevistosReales(imprevistos)).toBe(250);
  });
});

describe('imprevistos suavizados', () => {
  it('usa solo los reales cuando el historial es insuficiente', () => {
    const imprevistos = [
      { fecha: new Date('2026-10-31'), categoria: 'Llanta', monto: 250 },
    ];
    const historial = { imprevistos, kmTotal: 500 };
    const resultado = calcularImprevistosSuavizados(
      180,
      imprevistos,
      historial,
      1_000
    );
    expect(resultado.monto).toBe(250);
    expect(resultado.historialInsuficiente).toBe(true);
  });

  it('calcula la reserva suavizada con historial suficiente', () => {
    const imprevistos = [
      { fecha: new Date('2026-10-31'), categoria: 'Llanta', monto: 250 },
    ];
    const historial = {
      imprevistos: [
        { fecha: new Date('2026-09-01'), categoria: 'Frenos', monto: 1_000 },
        { fecha: new Date('2026-09-15'), categoria: 'Batería', monto: 1_500 },
      ],
      kmTotal: 5_000,
    };
    const resultado = calcularImprevistosSuavizados(
      180,
      imprevistos,
      historial,
      1_000
    );
    // tasa = 2500 / 5000 = 0.5 por km
    expect(resultado.monto).toBeCloseTo(90, 2);
    expect(resultado.historialInsuficiente).toBe(false);
  });
});

describe('caso calculado a mano: con imprevisto real', () => {
  it('produce los valores esperados', () => {
    const imprevistos = [
      { fecha: new Date('2026-10-31'), categoria: 'Llanta', monto: 250 },
    ];
    const resultado = calcularPeriodo(entradaBase, perfilBase, {
      imprevistos,
      modoImprevistos: 'reales',
    });

    expect(resultado.gasolina).toBeCloseTo(360.0, 2);
    expect(resultado.mantenimiento).toBeCloseTo(108.0, 2);
    expect(resultado.depreciacion).toBeCloseTo(54.0, 2);
    expect(resultado.fijosProrrateados).toBeCloseTo(115.38, 2);
    expect(resultado.imprevistos).toBeCloseTo(250.0, 2);
    expect(resultado.costoTotal).toBeCloseTo(887.38, 2);
    expect(resultado.ingresoTotal).toBeCloseTo(1_400.0, 2);
    expect(resultado.neto).toBeCloseTo(512.62, 2);
    expect(resultado.netoPorHora).toBeCloseTo(51.26, 2);
    expect(resultado.netoPorKm).toBeCloseTo(2.85, 2);
    expect(resultado.margenPct).toBeCloseTo(0.366, 3);
    expect(resultado.costoPorKm).toBeCloseTo(4.93, 2);
    expect(resultado.puntoEquilibrioHora).toBeCloseTo(88.74, 2);
    expect(resultado.modoImprevistos).toBe('reales');
    expect(resultado.imprevistosHistorialInsuficiente).toBe(false);
  });
});

describe('caso calculado a mano: sin imprevisto', () => {
  it('produce los valores esperados', () => {
    const resultado = calcularPeriodo(entradaBase, perfilBase);

    expect(resultado.costoTotal).toBeCloseTo(637.38, 2);
    expect(resultado.neto).toBeCloseTo(762.62, 2);
    expect(resultado.netoPorHora).toBeCloseTo(76.26, 2);
  });
});

describe('protección contra divisiones entre cero', () => {
  it('devuelve null cuando horasConectado es 0', () => {
    const resultado = calcularPeriodo(
      { ...entradaBase, horasConectado: 0 },
      perfilBase
    );
    expect(resultado.netoPorHora).toBeNull();
    expect(resultado.puntoEquilibrioHora).toBeNull();
  });

  it('devuelve null cuando km es 0', () => {
    const resultado = calcularPeriodo({ ...entradaBase, km: 0 }, perfilBase);
    expect(resultado.netoPorKm).toBeNull();
    expect(resultado.costoPorKm).toBeNull();
  });

  it('devuelve null cuando ingresoTotal es 0', () => {
    const resultado = calcularPeriodo(
      { ...entradaBase, ingresoPlataforma: 0 },
      perfilBase
    );
    expect(resultado.margenPct).toBeNull();
  });
});

describe('modo suavizado integrado', () => {
  it('reporta historial insuficiente en el resultado final', () => {
    const imprevistos = [
      { fecha: new Date('2026-10-31'), categoria: 'Llanta', monto: 250 },
    ];
    const resultado = calcularPeriodo(entradaBase, perfilBase, {
      imprevistos,
      modoImprevistos: 'suavizados',
      historialImprevistos: { imprevistos, kmTotal: 500 },
    });

    expect(resultado.imprevistos).toBe(250);
    expect(resultado.imprevistosHistorialInsuficiente).toBe(true);
  });

  it('usa reserva suavizada cuando hay historial suficiente', () => {
    const imprevistos = [
      { fecha: new Date('2026-10-31'), categoria: 'Llanta', monto: 250 },
    ];
    const historial = {
      imprevistos: [
        { fecha: new Date('2026-09-01'), categoria: 'Frenos', monto: 1_000 },
      ],
      kmTotal: 2_000,
    };
    const resultado = calcularPeriodo(entradaBase, perfilBase, {
      imprevistos,
      modoImprevistos: 'suavizados',
      historialImprevistos: historial,
      umbralKmHistorico: 1_000,
    });

    // tasa = 1000 / 2000 = 0.5 por km -> 180 * 0.5 = 90
    expect(resultado.imprevistos).toBeCloseTo(90, 2);
    expect(resultado.imprevistosHistorialInsuficiente).toBe(false);
  });
});

describe('gasto real de gasolina', () => {
  it('reemplaza el cálculo estimado en el resultado final', () => {
    const resultado = calcularPeriodo(
      { ...entradaBase, gastoRealGasolina: 400 },
      perfilBase
    );
    expect(resultado.gasolina).toBe(400);
    expect(resultado.costoTotal).toBeCloseTo(
      400 + 108 + 54 + 115.38461538461539,
      2
    );
  });
});
