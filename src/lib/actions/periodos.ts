'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { savePeriodoSchema, type SavePeriodoInput } from '@/lib/periodo-schema';
import { prisma } from '@/lib/prisma';

export type SavePeriodoResult =
  | { ok: true }
  | { ok: false; reason: 'auth' | 'invalid' | 'error' };

export async function savePeriodoAction(
  input: SavePeriodoInput,
): Promise<SavePeriodoResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  const parsed = savePeriodoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: 'invalid' };
  }

  const data = parsed.data;

  try {
    await prisma.periodo.create({
      data: {
        userId,
        tipo: data.tipo,
        fechaInicio: new Date(data.fechaInicio),
        viajes: data.viajes,
        horasConectado: data.horasConectado ?? null,
        km: data.km,
        ingresoPlataforma: data.ingresoPlataforma,
        propinasYEfectivo: data.propinasYEfectivo ?? null,
        rentaPeriodo: data.rentaPeriodo ?? null,
        celularRecargasPeriodo: data.celularRecargasPeriodo ?? null,
        gastoRealGasolina: data.gastoRealGasolina ?? null,
        rendimientoKmPorLitro: data.rendimientoKmPorLitro ?? null,
        precioLitro: data.precioLitro ?? null,
        otrosGastosPeriodo: data.otrosGastosPeriodo ?? null,
        imprevistos: data.imprevistos?.length
          ? {
              create: data.imprevistos.map((imprevisto) => ({
                fecha: new Date(imprevisto.fecha),
                categoria: imprevisto.categoria,
                monto: imprevisto.monto,
              })),
            }
          : undefined,
      },
    });
  } catch (error) {
    console.error('savePeriodoAction failed:', error);
    return { ok: false, reason: 'error' };
  }

  revalidatePath('/dashboard');

  return { ok: true };
}
