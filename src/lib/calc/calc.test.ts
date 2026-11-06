import { describe, expect, it } from 'vitest';
import { calcularGasolina, calcularImprevistos, calcularPeriodo, sumarImprevistos } from './calc';
import { EntradaPeriodo } from './types';

const entradaBase: EntradaPeriodo = {
  viajes: 40,
  horasConectado: 10,
  km: 180,
  ingresoPlataforma: 1_400,
  propinasYEfectivo: 0,
  gastoRealGasolina: 350,
  rentaPeriodo: 400,
  celularRecargasPeriodo: 100,
  imprevistos: [{ fecha: new Date('2026-10-31'), categoria: 'Llanta', monto: 250 }],
  otrosGastosPeriodo: 50,
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

  it('devuelve 0 si el rendimiento no sirve de divisor', () => {
    expect(
      calcularGasolina({
        ...entradaBase,
        gastoRealGasolina: undefined,
        rendimientoKmPorLitro: 0,
        precioLitro: 24,
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
  it('descuenta renta, celular, imprevistos y otros gastos', () => {
    const r = calcularPeriodo(entradaBase);

    expect(r.gasolina).toBeCloseTo(350, 2);
    expect(r.renta).toBeCloseTo(400, 2);
    expect(r.celularRecargas).toBeCloseTo(100, 2);
    expect(r.imprevistos).toBeCloseTo(250, 2);
    expect(r.otrosGastos).toBeCloseTo(50, 2);

    // 350 + 400 + 100 + 250 + 50
    expect(r.costoTotal).toBeCloseTo(1_150, 2);
    expect(r.ingresoTotal).toBeCloseTo(1_400, 2);
    expect(r.neto).toBeCloseTo(250, 2);
    // 250 neto / 40 viajes
    expect(r.netoPorViaje).toBeCloseTo(6.25, 2);
    // 1,150 costo / 40 viajes
    expect(r.puntoEquilibrioViaje).toBeCloseTo(28.75, 2);
    expect(r.netoPorHora).toBeCloseTo(25, 2);
    expect(r.netoPorKm).toBeCloseTo(1.39, 2);
    expect(r.costoPorKm).toBeCloseTo(6.39, 2);
    expect(r.margenPct).toBeCloseTo(0.1786, 4);
    expect(r.puntoEquilibrioHora).toBeCloseTo(115, 2);
  });

  it('no cobra gastos que el chofer no captura', () => {
    const r = calcularPeriodo({
      ...entradaBase,
      rentaPeriodo: undefined,
      celularRecargasPeriodo: undefined,
      imprevistos: [],
      otrosGastosPeriodo: 0,
    });

    expect(r.renta).toBe(0);
    expect(r.celularRecargas).toBe(0);
    expect(r.costoTotal).toBeCloseTo(350, 2);
    expect(r.neto).toBeCloseTo(1_050, 2);
    expect(r.netoPorViaje).toBeCloseTo(26.25, 2);
  });

  it('toma la renta del período tal cual, sin prorratearla', () => {
    const dia = calcularPeriodo({ ...entradaBase, rentaPeriodo: 400 });
    const semana = calcularPeriodo({ ...entradaBase, rentaPeriodo: 2_400 });

    expect(dia.renta).toBeCloseTo(400, 2);
    expect(semana.renta).toBeCloseTo(2_400, 2);
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
    expect(r.netoPorViaje).toBeCloseTo(250, 2);
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
    expect(r.netoPorViaje).toBeCloseTo(6.25, 2);
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

describe('imprevistos suavizados', () => {
  it('reparte la reserva histórica por kilómetro del período', () => {
    const r = calcularPeriodo({
      ...entradaBase,
      imprevistosModo: 'suavizados',
      ventanaImprevistos: { montoAcumulado: 2_000, kmAcumulados: 5_000 },
    });

    // ($2,000 / 5,000 km) * 180 km = $72
    expect(r.imprevistos).toBeCloseTo(72, 2);
    expect(r.historialInsuficiente).toBe(false);
  });

  it('usa los reales y avisa cuando no hay historial de kilómetros', () => {
    const r = calcularPeriodo({
      ...entradaBase,
      imprevistosModo: 'suavizados',
      ventanaImprevistos: { montoAcumulado: 2_000, kmAcumulados: 0 },
    });

    expect(r.imprevistos).toBeCloseTo(250, 2);
    expect(r.historialInsuficiente).toBe(true);
  });

  it('en modo reales no suaviza ni avisa', () => {
    const r = calcularPeriodo(entradaBase);

    expect(r.imprevistos).toBeCloseTo(250, 2);
    expect(r.historialInsuficiente).toBe(false);
  });

  it('expone el modo usado en el resultado', () => {
    expect(calcularPeriodo(entradaBase).imprevistosModo).toBe('reales');
    expect(
      calcularPeriodo({
        ...entradaBase,
        imprevistosModo: 'suavizados',
        ventanaImprevistos: { montoAcumulado: 2_000, kmAcumulados: 5_000 },
      }).imprevistosModo
    ).toBe('suavizados');
  });

  it('coincide con la suma directa en modo reales', () => {
    expect(
      calcularImprevistos({
        modo: 'reales',
        reales: entradaBase.imprevistos,
        km: 180,
      }).monto
    ).toBeCloseTo(250, 2);
  });
});
