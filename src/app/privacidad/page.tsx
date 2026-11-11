import type { Metadata } from 'next';
import Link from 'next/link';

import { messages } from '@/lib/i18n/messages';

export const metadata: Metadata = {
  title: `${messages.privacidad.title} · ${messages.app.title}`,
};

export default function PrivacidadPage() {
  const privacidad = messages.privacidad;

  return (
    <div className="relative min-h-screen">
      <div className="aurora" aria-hidden="true" />

      <header className="relative z-10 border-b border-line bg-surface/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-fg">
            {messages.app.title}
          </Link>
          <Link href="/" className="text-sm font-medium text-muted transition hover:text-gain">
            {privacidad.back}
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-5 pb-16 pt-10">
        <article className="mx-auto max-w-2xl space-y-6">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-fg">
              {privacidad.title}
            </h1>
            <p className="mt-2 text-sm text-dim">{privacidad.updated}</p>
            <p className="mt-4 text-base leading-relaxed text-muted">{privacidad.intro}</p>
          </header>

          {privacidad.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-fg">{section.title}</h2>
              <p className="mt-2 text-base leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
