import { describe, expect, it } from 'vitest';
import { calcularPeriodo } from '../calc/calc';
import { EntradaPeriodo } from '../calc/types';
import { explicarMetrica } from './explicaciones';

const entrada: EntradaPeriodo = {
  viajes: 40,
  horasConectado: 10,
  km: 180,
  ingresoPlataforma: 1_400,
  gastoRealGasolina: 350,
};

const resultado = calcularPeriodo(entrada);

describe('explicación de métricas', () => {
  it('explica el neto por viaje con la fórmula y los números reales', () => {
    const explicacion = explicarMetrica('netoPorViaje', entrada, resultado);

    expect(explicacion.formula).toBe(
      'Ganancia neta ÷ viajes = $1,050.00 ÷ 40 = $26.25'
    );
    expect(explicacion.que.length).toBeGreaterThan(0);
  });

  it('explica el mínimo por viaje con el costo total', () => {
    const explicacion = explicarMetrica(
      'puntoEquilibrioViaje',
      entrada,
      resultado
    );

    expect(explicacion.formula).toBe(
      'Costo total ÷ viajes = $350.00 ÷ 40 = $8.75'
    );
  });

  it('explica el neto por hora usando las horas capturadas', () => {
    const explicacion = explicarMetrica('netoPorHora', entrada, resultado);

    expect(explicacion.formula).toBe(
      'Ganancia neta ÷ horas conectado = $1,050.00 ÷ 10 = $105.00'
    );
  });

  it('explica el mínimo por hora con el costo total', () => {
    const explicacion = explicarMetrica(
      'puntoEquilibrioHora',
      entrada,
      resultado
    );

    expect(explicacion.formula).toBe(
      'Costo total ÷ horas conectado = $350.00 ÷ 10 = $35.00'
    );
  });

  it('explica el neto por km y el costo por km', () => {
    expect(explicarMetrica('netoPorKm', entrada, resultado).formula).toBe(
      'Ganancia neta ÷ km = $1,050.00 ÷ 180 = $5.83'
    );
    expect(explicarMetrica('costoPorKm', entrada, resultado).formula).toBe(
      'Costo total ÷ km = $350.00 ÷ 180 = $1.94'
    );
  });

  it('explica el margen como porcentaje del ingreso total', () => {
    const explicacion = explicarMetrica('margenPct', entrada, resultado);

    expect(explicacion.formula).toBe(
      'Ganancia neta ÷ ingreso total = $1,050.00 ÷ $1,400.00 = 75%'
    );
  });

  it('muestra un guion cuando la división no es posible', () => {
    const sinViajes: EntradaPeriodo = { ...entrada, viajes: 0 };
    const resultadoSinViajes = calcularPeriodo(sinViajes);
    const explicacion = explicarMetrica(
      'netoPorViaje',
      sinViajes,
      resultadoSinViajes
    );

    expect(explicacion.formula).toBe(
      'Ganancia neta ÷ viajes = $1,050.00 ÷ 0 = —'
    );
  });
});
