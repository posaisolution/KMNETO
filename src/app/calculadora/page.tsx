import type { Metadata } from 'next';

import { messages } from '@/lib/i18n/messages';

import CalculadoraClient from './calculadora-client';

export const metadata: Metadata = {
  title: `${messages.nav.calcular} · ${messages.app.title}`,
};

export default function CalculadoraPage() {
  return <CalculadoraClient />;
}
