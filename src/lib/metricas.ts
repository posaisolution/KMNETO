/**
 * Métricas del historial del chofer.
 *
 * Funciones puras: no tocan Prisma ni la UI. Reciben jornadas ya calculadas
 * (neto incluido) para que el motor de cálculo siga siendo la única fuente
 * de verdad de cada período.
 */

export type RegistroDia = {
  /** Fecha con la que se guardó la jornada. */
  fecha: Date;
  neto: number;
  viajes: number;
  km: number;
  /** Horas conectado, solo si la jornada las capturó. */
  horas: number | null;
};

export type Resumen = {
  jornadas: number;
  neto: number;
  viajes: number;
  km: number;
  /** Suma de horas capturadas; null si ninguna jornada las capturó. */
  horas: number | null;
  netoPorJornada: number | null;
  netoPorViaje: number | null;
  /**
   * Neto entre horas de las jornadas que sí capturaron horas.
   * Mezclar jornadas sin horas inflaría el promedio, así que se excluyen.
   */
  netoPorHora: number | null;
};

export type DiaSemana = {
  /** Día ISO: 1 = lunes … 7 = domingo. */
  dia: number;
  promedioNeto: number;
  jornadas: number;
};

export type EstimacionMeta = {
  meta: number;
  /** Viajes necesarios, redondeados hacia arriba. null si no se puede estimar. */
  viajes: number | null;
  /** Horas necesarias, redondeadas hacia arriba a un decimal. */
  horas: number | null;
  /** true cuando al menos un promedio permite estimar. */
  alcanzable: boolean;
};

const DIA_MS = 24 * 60 * 60 * 1000;
const DIAS_VENTANA = 7;

/** Día calendario en hora local, sin hora ni zona horaria. */
function claveDelDia(fecha: Date): number {
  return Math.round(
    Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / DIA_MS,
  );
}

/** Día ISO de la semana: 1 = lunes … 7 = domingo. */
function diaIso(fecha: Date): number {
  const dia = fecha.getDay();
  return dia === 0 ? 7 : dia;
}

function horasValidas(registro: RegistroDia): number | null {
  return registro.horas !== null && registro.horas > 0 ? registro.horas : null;
}

/**
 * Jornadas de los últimos 7 días contados desde el registro más reciente.
 * Se ancla en el último registro (no en hoy) para que el chofer que captura
 * con retraso siga viendo su semana.
 */
export function ultimaSemana(registros: RegistroDia[]): RegistroDia[] {
  if (registros.length === 0) {
    return [];
  }

  const ancla = Math.max(...registros.map((registro) => claveDelDia(registro.fecha)));

  return registros.filter((registro) => {
    const diferencia = ancla - claveDelDia(registro.fecha);
    return diferencia >= 0 && diferencia < DIAS_VENTANA;
  });
}

export function resumir(registros: RegistroDia[]): Resumen | null {
  if (registros.length === 0) {
    return null;
  }

  let neto = 0;
  let viajes = 0;
  let km = 0;
  let horas = 0;
  let netoConHoras = 0;
  let jornadasConHoras = 0;

  for (const registro of registros) {
    neto += registro.neto;
    viajes += registro.viajes;
    km += registro.km;

    const horasRegistro = horasValidas(registro);
    if (horasRegistro !== null) {
      horas += horasRegistro;
      netoConHoras += registro.neto;
      jornadasConHoras += 1;
    }
  }

  return {
    jornadas: registros.length,
    neto,
    viajes,
    km,
    horas: jornadasConHoras === 0 ? null : horas,
    netoPorJornada: neto / registros.length,
    netoPorViaje: viajes === 0 ? null : neto / viajes,
    netoPorHora: jornadasConHoras === 0 ? null : netoConHoras / horas,
  };
}

/**
 * Promedio de neto por día de la semana, de mejor a peor.
 *
 * Se usa el día en que se guardó la jornada. Desempate determinista:
 * más jornadas primero y luego el día ISO ascendente.
 */
export function mejoresDias(registros: RegistroDia[]): DiaSemana[] {
  const acumulado = new Map<number, { neto: number; jornadas: number }>();

  for (const registro of registros) {
    const dia = diaIso(registro.fecha);
    const actual = acumulado.get(dia) ?? { neto: 0, jornadas: 0 };
    acumulado.set(dia, {
      neto: actual.neto + registro.neto,
      jornadas: actual.jornadas + 1,
    });
  }

  return [...acumulado.entries()]
    .map(([dia, { neto, jornadas }]) => ({
      dia,
      promedioNeto: neto / jornadas,
      jornadas,
    }))
    .sort(
      (a, b) =>
        b.promedioNeto - a.promedioNeto ||
        b.jornadas - a.jornadas ||
        a.dia - b.dia,
    );
}

/**
 * Estimación de viajes y horas para llegar a una meta semanal, con los
 * promedios del chofer. Con promedios en cero o negativos no hay estimación:
 * manejar más no acercaría a la meta.
 */
export function estimarMeta({
  metaSemanal,
  netoPorViaje,
  netoPorHora,
}: {
  metaSemanal: number;
  netoPorViaje: number | null;
  netoPorHora: number | null;
}): EstimacionMeta {
  const viajes =
    netoPorViaje !== null && netoPorViaje > 0 && metaSemanal > 0
      ? Math.ceil(metaSemanal / netoPorViaje)
      : null;

  const horas =
    netoPorHora !== null && netoPorHora > 0 && metaSemanal > 0
      ? Math.ceil((metaSemanal / netoPorHora) * 10) / 10
      : null;

  return {
    meta: metaSemanal,
    viajes,
    horas,
    alcanzable: viajes !== null || horas !== null,
  };
}
