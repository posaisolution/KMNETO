import { describe, expect, it } from 'vitest';

import type { EntradaPeriodo } from './calc';
import { entradaAValores, modoGasolina } from './periodo-form';

const base: EntradaPeriodo = {
  viajes: 20,
  horasConectado: 8,
  km: 150,
  ingresoPlataforma: 1200,
  propinasYEfectivo: 100,
  rentaPeriodo: 350,
  celularRecargasPeriodo: 60,
  gastoRealGasolina: 400,
  otrosGastosPeriodo: 50,
};

describe('modoGasolina', () => {
  it('returns "real" when the period captured the actual fuel expense', () => {
    expect(modoGasolina(base)).toBe('real');
  });

  it('returns "estimado" when the period only has efficiency and price', () => {
    expect(
      modoGasolina({
        viajes: 1,
        km: 10,
        ingresoPlataforma: 100,
        rendimientoKmPorLitro: 12,
        precioLitro: 24,
      }),
    ).toBe('estimado');
  });
});

describe('entradaAValores', () => {
  it('maps every captured field back to its form value', () => {
    const values = entradaAValores(base);

    expect(values).toEqual({
      viajes: '20',
      horasConectado: '8',
      km: '150',
      ingresoPlataforma: '1200',
      propinasYEfectivo: '100',
      rentaPeriodo: '350',
      celularRecargasPeriodo: '60',
      otrosGastosPeriodo: '50',
      gastoRealGasolina: '400',
    });
  });

  it('uses the estimated fuel fields when there is no actual expense', () => {
    const values = entradaAValores({
      viajes: 1,
      km: 10,
      ingresoPlataforma: 100,
      rendimientoKmPorLitro: 12.5,
      precioLitro: 24.9,
    });

    expect(values.rendimientoKmPorLitro).toBe('12.5');
    expect(values.precioLitro).toBe('24.9');
    expect(values.gastoRealGasolina).toBeUndefined();
  });

  it('sums multiple unexpected expenses into the single form field', () => {
    const values = entradaAValores({
      ...base,
      imprevistos: [
        { fecha: new Date('2026-03-10'), categoria: 'Llanta', monto: 200 },
        { fecha: new Date('2026-03-11'), categoria: 'Grúa', monto: 300 },
      ],
    });

    expect(values.imprevistos).toBe('500');
  });

  it('omits optional fields that were never captured', () => {
    const values = entradaAValores({
      viajes: 1,
      km: 10,
      ingresoPlataforma: 100,
      gastoRealGasolina: 0,
    });

    expect(values.horasConectado).toBeUndefined();
    expect(values.propinasYEfectivo).toBeUndefined();
    expect(values.rentaPeriodo).toBeUndefined();
    expect(values.imprevistos).toBeUndefined();
    expect(values.gastoRealGasolina).toBe('0');
  });
});
