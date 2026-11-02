"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { messages } from "@/lib/i18n/messages";

export default function Home() {
  const { app, nav, landing } = messages;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const reveals = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${(i % 6) * 55}ms`;
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  const navLinks = [
    { href: "#que-es", label: nav.queEs },
    { href: "#como-funciona", label: nav.comoFunciona },
    { href: "#preguntas", label: nav.preguntas },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="aurora" aria-hidden="true">
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>
      <div className="grid-lines" aria-hidden="true" />

      <header
        className={[
          "sticky top-0 z-50 border-b backdrop-blur transition-colors",
          scrolled
            ? "border-line bg-bg/90"
            : "border-transparent bg-bg/70",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-5 py-4">
          <Link href="/" className="flex items-center gap-3 font-bold text-lg tracking-tight text-fg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            </span>
            {app.title}
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-white/5 hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/calculadora"
            className="hidden items-center gap-2 rounded-full bg-fg px-5 py-2 text-sm font-semibold text-bg shadow transition hover:-translate-y-0.5 hover:shadow-lg md:inline-flex"
          >
            {nav.calcular}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpen((v) => !v)}
            className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-line bg-white/5 md:hidden"
          >
            <span className="block h-0.5 w-5 rounded bg-fg transition-all" style={{ transform: menuOpen ? "translateY(3px) rotate(45deg)" : undefined }} />
            <span className="block h-0.5 w-5 rounded bg-fg transition-all" style={{ opacity: menuOpen ? 0 : 1 }} />
            <span className="block h-0.5 w-5 rounded bg-fg transition-all" style={{ transform: menuOpen ? "translateY(-9px) rotate(-45deg)" : undefined }} />
          </button>
        </div>

        {menuOpen && (
          <div id="mobileMenu" className="border-t border-line bg-bg px-5 py-4 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-line py-3 text-muted transition hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/calculadora"
              onClick={() => setMenuOpen(false)}
              className="mt-4 block rounded-full bg-fg px-5 py-3 text-center text-sm font-semibold text-bg"
            >
              {nav.calcular}
            </Link>
          </div>
        )}
      </header>

      <main className="relative z-10">
        <section className="px-5 pb-10 pt-16 md:pt-24">
          <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
            <div className="reveal">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
                {landing.pill}
              </span>

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-fg md:text-6xl">
                {landing.headline.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
                  {landing.headline.split(" ").slice(-1)[0].replace(".", "")}
                </span>
                .
              </h1>

              <p className="mt-5 max-w-lg text-lg text-muted">{landing.subheadline}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/calculadora"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 px-7 py-4 text-center font-bold text-bg shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:shadow-emerald-500/40"
                >
                  {landing.ctaPrimary}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-white/5 px-7 py-4 text-center font-semibold text-fg transition hover:bg-white/10"
                >
                  {landing.ctaSecondary}
                </Link>
              </div>

              <div className="mt-10 flex gap-8 border-t border-line pt-6">
                {landing.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-fg">{stat.value}</div>
                    <div className="text-xs font-medium text-dim">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative reveal" style={{ transitionDelay: "150ms" }}>
              <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-gradient-to-br from-surface to-surface-2 p-6 shadow-2xl shadow-black/50 md:p-8">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="ml-auto font-mono text-xs">kmneto.app</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                    <span className="text-sm text-muted">{landing.sampleCard.neto}</span>
                    <span className="text-xl font-bold text-emerald-400">$512.62</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/5 p-3 text-center">
                      <p className="text-xs text-muted">{landing.sampleCard.porHora}</p>
                      <p className="font-bold text-fg">$51.26</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 text-center">
                      <p className="text-xs text-muted">{landing.sampleCard.porKm}</p>
                      <p className="font-bold text-fg">$2.85</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-line p-3 text-center text-sm text-dim">
                    10 hrs · 180 km · $1,400 ingreso
                  </div>
                </div>

                <div className="float absolute -right-3 top-8 rounded-xl border border-line-strong bg-surface px-3 py-2 text-xs font-semibold text-emerald-300 shadow-lg">
                  <span className="mr-1">✓</span> Margen 36.6%
                </div>
                <div className="float absolute -left-4 bottom-10 rounded-xl border border-line-strong bg-surface px-3 py-2 text-xs font-semibold text-blue-300 shadow-lg" style={{ animationDelay: "-2.4s" }}>
                  <span className="mr-1">$</span> $88.74/hr mínimo
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-white/[0.02] py-5">
          <div className="marquee overflow-hidden">
            <div className="marquee-track">
              {[...landing.marquee, ...landing.marquee].map((item, i) => (
                <span key={i} className="flex items-center gap-11 font-display text-sm font-semibold text-dim">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="que-es" className="px-5 py-20 md:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="reveal mb-14 max-w-2xl">
              <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
                <span className="h-0.5 w-5 rounded bg-emerald-300" />
                {landing.valueProps.title}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {landing.valueProps.items.map((item, index) => (
                <div
                  key={index}
                  className="reveal rounded-3xl border border-line bg-surface p-7 transition hover:-translate-y-1 hover:border-line-strong hover:bg-surface-2"
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-emerald-500/20 text-emerald-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {index === 0 && <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>}
                      {index === 1 && <><circle cx="12" cy="12" r="10" /><path d="M16 12l-4-4-4 4M12 16V8" /></>}
                      {index === 2 && <><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>}
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-fg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="bg-gradient-to-b from-transparent via-white/[0.02] to-transparent px-5 py-20 md:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="reveal mb-14 text-center">
              <span className="mb-3 inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
                {landing.steps.title}
              </span>
              <h2 className="text-3xl font-bold text-fg md:text-4xl">Tres pasos. Nada más.</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {landing.steps.items.map((step, index) => (
                <div
                  key={index}
                  className="reveal relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface to-bg-soft p-8"
                >
                  <span className="mb-5 block bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-5xl font-extrabold leading-none text-transparent opacity-80">
                    0{index + 1}
                  </span>
                  <h3 className="text-lg font-bold text-fg">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="preguntas" className="px-5 py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="reveal mb-12 text-center">
              <span className="mb-3 inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
                {landing.faq.title}
              </span>
            </div>

            <div className="reveal space-y-3">
              {landing.faq.items.map((item, index) => (
                <details
                  key={index}
                  className="rounded-2xl border border-line bg-white/[0.02] transition open:border-line-strong open:bg-white/[0.04]"
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-semibold text-fg">
                    {item.question}
                    <span className="summary-chevron text-muted transition-transform">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20">
          <div className="mx-auto max-w-5xl">
            <div className="reveal relative overflow-hidden rounded-[2rem] border border-blue-500/30 bg-gradient-to-b from-surface to-bg-soft px-6 py-16 text-center md:px-16">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-fg md:text-4xl">{landing.finalCta.title}</h2>
                <p className="mx-auto mt-4 max-w-lg text-muted">{landing.finalCta.description}</p>
                <Link
                  href="/calculadora"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-fg px-8 py-4 font-bold text-bg shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
                >
                  {landing.finalCta.cta}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-line bg-black/30 px-5 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <Link href="/" className="flex items-center gap-3 font-bold text-lg text-fg">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8M12 8v8" />
                  </svg>
                </span>
                {app.title}
              </Link>
              <p className="mt-3 max-w-xs text-sm text-dim">{landing.footer.description}</p>
            </div>

            <div className="flex gap-10">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-dim">App</h4>
                <Link href="/calculadora" className="mt-3 block text-sm text-muted transition hover:text-fg">Calculadora</Link>
                <Link href="/" className="mt-2 block text-sm text-muted transition hover:text-fg">Inicio</Link>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-dim">Legal</h4>
                <span className="mt-3 block text-sm text-muted">Aviso de privacidad (próximamente)</span>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-line pt-6 text-xs text-dim">
            {landing.footer.copyright}
          </div>
        </div>
      </footer>

      <style jsx>{`
        details[open] .summary-chevron {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}
