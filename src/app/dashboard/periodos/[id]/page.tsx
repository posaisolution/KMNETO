import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import CalculadoraClient from '@/app/calculadora/calculadora-client';
import { auth } from '@/lib/auth';
import { messages } from '@/lib/i18n/messages';
import { entradaAValores, modoGasolina } from '@/lib/periodo-form';
import { aEntrada } from '@/lib/periodos';
import { prisma } from '@/lib/prisma';

export const instant = false;

export const metadata: Metadata = {
  title: `${messages.dashboard.detailTitle} · ${messages.app.title}`,
};

export default async function EditarPeriodoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const periodo = await prisma.periodo.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { imprevistos: true },
  });

  if (!periodo) {
    notFound();
  }

  const entrada = aEntrada(periodo);

  return (
    <CalculadoraClient
      periodoId={periodo.id}
      initialValues={entradaAValores(entrada)}
      initialTipo={periodo.tipo === 'semana' ? 'semana' : 'dia'}
      initialGasMode={modoGasolina(entrada)}
      initialEntrada={entrada}
      initialFechaInicio={periodo.fechaInicio.toISOString()}
    />
  );
}
