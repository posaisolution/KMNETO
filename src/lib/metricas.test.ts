import { describe, expect, it } from 'vitest';

import {
  estimarMeta,
  mejoresDias,
  resumir,
  ultimaSemana,
  type RegistroDia,
} from './metricas';

// Fechas de referencia con hora local (México ya no usa horario de verano).
const lunes2Nov = new Date(2026, 10, 2, 9, 0, 0); // lunes
const viernes6Nov = new Date(2026, 10, 6, 9, 0, 0); // viernes
const lunes9Nov = new Date(2026, 10, 9, 9, 0, 0); // lunes
const miercoles28Oct = new Date(2026, 9, 28, 9, 0, 0); // miércoles, 9 días antes

function registro(
  fecha: Date,
  neto: number,
  viajes: number,
  km: number,
  horas: number | null,
): RegistroDia {
  return { fecha, neto, viajes, km, horas };
}

describe('ultimaSemana', () => {
  it('conserva solo los registros dentro de los 7 días previos al más reciente', () => {
    const registros = [
      registro(miercoles28Oct, 300, 8, 80, 6),
      registro(lunes2Nov, 400, 10, 100, 8),
      registro(viernes6Nov, 600, 12, 120, 10),
    ];

    const ventana = ultimaSemana(registros);

    expect(ventana.map((r) => r.fecha)).toEqual([lunes2Nov, viernes6Nov]);
  });

  it('no depende del orden de entrada', () => {
    const registros = [
      registro(viernes6Nov, 600, 12, 120, 10),
      registro(lunes2Nov, 400, 10, 100, 8),
    ];

    expect(ultimaSemana(registros)).toHaveLength(2);
  });

  it('devuelve una lista vacía sin registros', () => {
    expect(ultimaSemana([])).toEqual([]);
  });
});

describe('resumir', () => {
  it('suma los totales y calcula los promedios de la ventana', () => {
    const resumen = resumir([
      registro(lunes2Nov, 400, 10, 100, 8),
      registro(viernes6Nov, 600, 12, 120, 10),
    ]);

    expect(resumen).not.toBeNull();
    expect(resumen!.jornadas).toBe(2);
    expect(resumen!.neto).toBe(1000);
    expect(resumen!.viajes).toBe(22);
    expect(resumen!.km).toBe(220);
    expect(resumen!.horas).toBe(18);
    expect(resumen!.netoPorJornada).toBe(500);
    expect(resumen!.netoPorViaje).toBeCloseTo(45.4545, 4);
    expect(resumen!.netoPorHora).toBeCloseTo(55.5556, 4);
  });

  it('calcula el neto por hora solo con las jornadas que capturaron horas', () => {
    // 800 de neto y 8 horas => $100/h; la jornada sin horas no entra al promedio.
    const resumen = resumir([
      registro(lunes2Nov, 400, 10, 100, null),
      registro(viernes6Nov, 400, 10, 100, 8),
    ]);

    expect(resumen!.horas).toBe(8);
    expect(resumen!.netoPorHora).toBe(50);
    // Los totales sí incluyen todas las jornadas.
    expect(resumen!.neto).toBe(800);
    expect(resumen!.netoPorViaje).toBe(40);
  });

  it('devuelve null cuando no hay jornadas', () => {
    expect(resumir([])).toBeNull();
  });

  it('devuelve null en los promedios que no tienen denominador', () => {
    const resumen = resumir([registro(lunes2Nov, 400, 0, 100, null)]);

    expect(resumen!.netoPorViaje).toBeNull();
    expect(resumen!.netoPorHora).toBeNull();
    expect(resumen!.horas).toBeNull();
  });
});

describe('mejoresDias', () => {
  it('agrupa por día de la semana y ordena por promedio neto', () => {
    const dias = mejoresDias([
      registro(lunes2Nov, 400, 10, 100, 8),
      registro(lunes9Nov, 600, 12, 120, 10),
      registro(viernes6Nov, 800, 14, 140, 11),
    ]);

    expect(dias).toEqual([
      { dia: 5, promedioNeto: 800, jornadas: 1 },
      { dia: 1, promedioNeto: 500, jornadas: 2 },
    ]);
  });

  it('devuelve una lista vacía sin registros', () => {
    expect(mejoresDias([])).toEqual([]);
  });
});

describe('estimarMeta', () => {
  it('calcula viajes y horas necesarias con los promedios dados', () => {
    const estimacion = estimarMeta({
      metaSemanal: 5000,
      netoPorViaje: 100,
      netoPorHora: 150,
    });

    expect(estimacion).toEqual({
      meta: 5000,
      viajes: 50,
      horas: 33.4,
      alcanzable: true,
    });
  });

  it('redondea los viajes hacia arriba porque no se pueden hacer fracciones', () => {
    const estimacion = estimarMeta({
      metaSemanal: 5000,
      netoPorViaje: 60,
      netoPorHora: null,
    });

    // 5000 / 60 = 83.33 => 84 viajes
    expect(estimacion.viajes).toBe(84);
    expect(estimacion.horas).toBeNull();
    expect(estimacion.alcanzable).toBe(true);
  });

  it('no estima cuando el promedio es cero o negativo', () => {
    const estimacion = estimarMeta({
      metaSemanal: 5000,
      netoPorViaje: 0,
      netoPorHora: -20,
    });

    expect(estimacion.viajes).toBeNull();
    expect(estimacion.horas).toBeNull();
    expect(estimacion.alcanzable).toBe(false);
  });

  it('no estima con una meta de cero', () => {
    const estimacion = estimarMeta({
      metaSemanal: 0,
      netoPorViaje: 100,
      netoPorHora: 100,
    });

    expect(estimacion.viajes).toBeNull();
    expect(estimacion.horas).toBeNull();
    expect(estimacion.alcanzable).toBe(false);
  });
});
