import { z } from 'zod';

const numberField = z.number().finite().min(0);
const optionalNumber = z.number().finite().min(0).optional();

const imprevistoSchema = z.object({
  fecha: z.string().min(1),
  categoria: z.string().trim().min(1).max(80),
  monto: z.number().finite().min(0),
});

export const savePeriodoSchema = z.object({
  tipo: z.enum(['dia', 'semana']),
  fechaInicio: z.string().min(1),
  viajes: numberField,
  horasConectado: optionalNumber,
  km: numberField,
  ingresoPlataforma: numberField,
  propinasYEfectivo: optionalNumber,
  rentaPeriodo: optionalNumber,
  celularRecargasPeriodo: optionalNumber,
  gastoRealGasolina: optionalNumber,
  rendimientoKmPorLitro: optionalNumber,
  precioLitro: optionalNumber,
  otrosGastosPeriodo: optionalNumber,
  imprevistos: z.array(imprevistoSchema).max(50).optional(),
});

export type SavePeriodoInput = z.infer<typeof savePeriodoSchema>;
