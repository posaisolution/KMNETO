/**
 * Rounds a number to a fixed amount of decimal places.
 * Use only for display; never for intermediate calculation steps.
 */
export function redondear(valor: number, decimales: number = 2): number {
  const factor = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * factor) / factor;
}

export function formatearPorcentaje(
  fraccion: number | null,
  decimales: number = 1
): string {
  if (fraccion === null) return '—';
  return `${redondear(fraccion * 100, decimales)}%`;
}

export function formatearMoneda(
  valor: number | null,
  decimales: number = 2
): string {
  if (valor === null) return '—';
  return `$${redondear(valor, decimales).toLocaleString('es-MX', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })}`;
}

/**
 * Formats a plain quantity (trips, hours, km) for display inside a formula.
 * Rounds only for display, never for calculation.
 */
export function formatearCantidad(valor: number, decimales: number = 2): string {
  return redondear(valor, decimales).toLocaleString('es-MX', {
    maximumFractionDigits: decimales,
  });
}
