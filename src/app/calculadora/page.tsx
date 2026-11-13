import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { messages } from '@/lib/i18n/messages';

import CalculadoraClient from './calculadora-client';

export const instant = false;

export const metadata: Metadata = {
  title: `${messages.nav.calcular} · ${messages.app.title}`,
};

export default async function CalculadoraPage() {
  const session = await auth();
  const conSesion = Boolean(session?.user?.id);

  return (
    <CalculadoraClient
      backHref={conSesion ? '/dashboard' : '/'}
      showHistoryLink={conSesion}
    />
  );
}
