import { describe, expect, it } from 'vitest';

import { calcularPeriodo } from './calc';
import { aEntrada, resultadoDe, type PeriodoConImprevistos } from './periodos';

function buildPeriodo(
  overrides: Partial<PeriodoConImprevistos> = {},
): PeriodoConImprevistos {
  return {
    id: 'periodo_1',
    userId: 'user_1',
    tipo: 'dia',
    fechaInicio: new Date('2026-03-10T12:00:00.000Z'),
    viajes: 20,
    horasConectado: 8,
    km: 150,
    ingresoPlataforma: 1200,
    propinasYEfectivo: 100,
    rentaPeriodo: 350,
    celularRecargasPeriodo: 60,
    gastoRealGasolina: 400,
    rendimientoKmPorLitro: null,
    precioLitro: null,
    otrosGastosPeriodo: 50,
    imprevistosModo: 'reales',
    createdAt: new Date('2026-03-10T12:00:00.000Z'),
    updatedAt: new Date('2026-03-10T12:00:00.000Z'),
    deletedAt: null,
    imprevistos: [
      {
        id: 'imp_1',
        periodoId: 'periodo_1',
        fecha: new Date('2026-03-10T12:00:00.000Z'),
        categoria: 'Llanta',
        monto: 200,
        createdAt: new Date('2026-03-10T12:00:00.000Z'),
      },
    ],
    ...overrides,
  };
}

describe('aEntrada', () => {
  it('maps stored rows back to the calculation input', () => {
    const entrada = aEntrada(buildPeriodo());

    expect(entrada.viajes).toBe(20);
    expect(entrada.horasConectado).toBe(8);
    expect(entrada.km).toBe(150);
    expect(entrada.ingresoPlataforma).toBe(1200);
    expect(entrada.propinasYEfectivo).toBe(100);
    expect(entrada.rentaPeriodo).toBe(350);
    expect(entrada.celularRecargasPeriodo).toBe(60);
    expect(entrada.gastoRealGasolina).toBe(400);
    expect(entrada.otrosGastosPeriodo).toBe(50);
    expect(entrada.imprevistos).toEqual([
      {
        fecha: new Date('2026-03-10T12:00:00.000Z'),
        categoria: 'Llanta',
        monto: 200,
      },
    ]);
  });

  it('turns null columns into undefined optionals', () => {
    const entrada = aEntrada(
      buildPeriodo({
        horasConectado: null,
        propinasYEfectivo: null,
        rentaPeriodo: null,
        celularRecargasPeriodo: null,
        gastoRealGasolina: null,
        otrosGastosPeriodo: null,
        imprevistos: [],
      }),
    );

    expect(entrada.horasConectado).toBeUndefined();
    expect(entrada.propinasYEfectivo).toBeUndefined();
    expect(entrada.rentaPeriodo).toBeUndefined();
    expect(entrada.celularRecargasPeriodo).toBeUndefined();
    expect(entrada.gastoRealGasolina).toBeUndefined();
    expect(entrada.otrosGastosPeriodo).toBeUndefined();
    expect(entrada.imprevistos).toEqual([]);
  });

  it('keeps the smoothed unexpected-expense mode', () => {
    const entrada = aEntrada(buildPeriodo({ imprevistosModo: 'suavizados' }));
    expect(entrada.imprevistosModo).toBe('suavizados');
  });
});

describe('resultadoDe', () => {
  it('recomputes the same result as the pure engine', () => {
    const periodo = buildPeriodo();
    const esperado = calcularPeriodo(aEntrada(periodo));

    expect(resultadoDe(periodo)).toEqual(esperado);
  });

  it('recomputes instead of trusting stored values', () => {
    const periodo = buildPeriodo({ ingresoPlataforma: 2000 });
    const resultado = resultadoDe(periodo);

    // 2000 + 100 tips - (400 fuel + 350 rent + 60 phone + 200 unexpected + 50 other)
    expect(resultado.neto).toBe(1040);
  });
});
