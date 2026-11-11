'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { savePeriodoSchema, type SavePeriodoInput } from '@/lib/periodo-schema';
import { prisma } from '@/lib/prisma';

export type SavePeriodoResult =
  | { ok: true }
  | { ok: false; reason: 'auth' | 'invalid' | 'notfound' | 'error' };

export type DeletePeriodoResult =
  | { ok: true }
  | { ok: false; reason: 'auth' | 'notfound' | 'error' };

const PERIODO_NOT_FOUND = 'PERIODO_NOT_FOUND';

function toPeriodoData(data: SavePeriodoInput) {
  return {
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
  };
}

function toImprevistos(data: SavePeriodoInput) {
  if (!data.imprevistos?.length) {
    return undefined;
  }

  return {
    create: data.imprevistos.map((imprevisto) => ({
      fecha: new Date(imprevisto.fecha),
      categoria: imprevisto.categoria,
      monto: imprevisto.monto,
    })),
  };
}

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

  try {
    await prisma.periodo.create({
      data: {
        userId,
        ...toPeriodoData(parsed.data),
        imprevistos: toImprevistos(parsed.data),
      },
    });
  } catch (error) {
    console.error('savePeriodoAction failed:', error);
    return { ok: false, reason: 'error' };
  }

  revalidatePath('/dashboard');

  return { ok: true };
}

export async function updatePeriodoAction(
  id: string,
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

  try {
    await prisma.$transaction(async (tx) => {
      // Ownership guard: the update only proceeds for the signed-in driver.
      const existing = await tx.periodo.findFirst({
        where: { id, userId, deletedAt: null },
        select: { id: true },
      });

      if (!existing) {
        throw new Error(PERIODO_NOT_FOUND);
      }

      await tx.imprevisto.deleteMany({ where: { periodoId: id } });
      await tx.periodo.update({
        where: { id },
        data: {
          ...toPeriodoData(parsed.data),
          imprevistos: toImprevistos(parsed.data),
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === PERIODO_NOT_FOUND) {
      return { ok: false, reason: 'notfound' };
    }
    console.error('updatePeriodoAction failed:', error);
    return { ok: false, reason: 'error' };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/periodos/${id}`);

  return { ok: true };
}

export async function deletePeriodoAction(id: string): Promise<DeletePeriodoResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { ok: false, reason: 'auth' };
  }

  try {
    const result = await prisma.periodo.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      return { ok: false, reason: 'notfound' };
    }
  } catch (error) {
    console.error('deletePeriodoAction failed:', error);
    return { ok: false, reason: 'error' };
  }

  revalidatePath('/dashboard');

  return { ok: true };
}
