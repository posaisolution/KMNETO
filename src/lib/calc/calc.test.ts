import { describe, expect, it } from 'vitest';
import { calcularGasolina, calcularPeriodo, sumarImprevistos } from './calc';
import { EntradaPeriodo } from './types';

const entradaBase: EntradaPeriodo = {
  viajes: 40,
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
    // 390 neto / 40 viajes
    expect(r.netoPorViaje).toBeCloseTo(9.75, 2);
    // 1,010 costo / 40 viajes
    expect(r.puntoEquilibrioViaje).toBeCloseTo(25.25, 2);
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
    // 740 neto / 40 viajes
    expect(r.netoPorViaje).toBeCloseTo(18.5, 2);
    expect(r.netoPorHora).toBeCloseTo(74, 2);
  });
});

describe('división entre viajes', () => {
  it('devuelve null cuando viajes es 0', () => {
    const r = calcularPeriodo({ ...entradaBase, viajes: 0 });
    expect(r.netoPorViaje).toBeNull();
    expect(r.puntoEquilibrioViaje).toBeNull();
  });

  it('calcula el neto por viaje con un solo viaje', () => {
    const r = calcularPeriodo({ ...entradaBase, viajes: 1 });
    expect(r.netoPorViaje).toBeCloseTo(390, 2);
  });
});

describe('protección contra divisiones entre cero', () => {
  it('devuelve null cuando horasConectado es 0', () => {
    const r = calcularPeriodo({ ...entradaBase, horasConectado: 0 });
    expect(r.netoPorHora).toBeNull();
    expect(r.puntoEquilibrioHora).toBeNull();
  });

  it('devuelve null en métricas por hora cuando no se capturan horas', () => {
    const r = calcularPeriodo({ ...entradaBase, horasConectado: undefined });
    expect(r.netoPorHora).toBeNull();
    expect(r.puntoEquilibrioHora).toBeNull();
    // Las métricas por viaje no dependen de las horas.
    expect(r.netoPorViaje).toBeCloseTo(9.75, 2);
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
