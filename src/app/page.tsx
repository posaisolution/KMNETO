import Link from "next/link";
import { messages } from "@/lib/i18n/messages";

export default function Home() {
  const { landing, app } = messages;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-blue-700">{app.title}</span>
          <Link
            href="/calculadora"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            {landing.hero.cta}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-12 text-center md:pt-20">
        <div className="animate-fade-in">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Para choferes de Uber, DiDi e inDrive
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl">
            {landing.hero.headline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 md:text-xl">
            {landing.hero.subheadline}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/calculadora"
              className="w-full rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto"
            >
              {landing.hero.cta}
            </Link>
            <Link
              href="#como-funciona"
              className="w-full rounded-xl bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow transition hover:bg-gray-100 sm:w-auto"
            >
              Ver cómo funciona
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">
          {landing.valueProps.title}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {landing.valueProps.items.map((item, index) => (
            <div
              key={index}
              className="animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <h3 className="text-lg font-bold text-blue-700">{item.title}</h3>
              <p className="mt-2 text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">
            {landing.steps.title}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {landing.steps.items.map((item, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div className="rounded-3xl bg-blue-600 px-6 py-12 text-white shadow-xl md:px-12">
          <h2 className="text-2xl font-bold md:text-4xl">{landing.finalCta.title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-blue-100">
            {landing.finalCta.description}
          </p>
          <Link
            href="/calculadora"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-lg font-bold text-blue-700 shadow transition hover:-translate-y-0.5 hover:bg-gray-100"
          >
            {landing.finalCta.cta}
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
        {landing.footer}
      </footer>
    </main>
  );
}
