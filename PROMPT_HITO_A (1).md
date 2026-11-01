# Prompt para OpenCode — Hito A (motor de cálculo)

Pégalo en OpenCode después de crear el repo con `AGENTS.md` en la raíz. Empieza en **modo plan** (tecla Tab para cambiar a Plan, o pídelo explícitamente).

---

Lee `AGENTS.md` completo. Vamos a hacer el **Hito A: motor de cálculo**, solo eso (sin UI, sin base de datos).

Primero propón un plan corto y espera mi aprobación. Después implementa:

1. **Inicializa el proyecto** (si aún no existe): Next.js App Router + TypeScript estricto + Tailwind + Vitest. No agregues Prisma, NextAuth ni Stripe todavía.
2. En `src/lib/calc/` crea funciones puras y tipadas que implementen exactamente las fórmulas de la sección 4 de `AGENTS.md`:
   - tipos para `PerfilAuto`, `EntradaPeriodo`, `Imprevisto` y `ResultadoPeriodo`
   - cálculo de gasolina (por rendimiento, o gasto real si se proporciona)
   - mantenimiento, depreciación y gastos fijos prorrateados
   - imprevistos en modo **reales** y modo **suavizados**, con el caso de historial insuficiente
   - resultado final con `neto`, `netoPorHora`, `netoPorKm`, `costoPorKm`, `margenPct` y `puntoEquilibrioHora`
3. Divisiones entre cero devuelven `null`, nunca `NaN` ni `Infinity`. No redondees en pasos intermedios; exporta un helper aparte para redondear al mostrar.
4. **Pruebas con Vitest.** Incluye obligatoriamente este caso calculado a mano:

   Entrada: 10 horas conectado, 180 km, ingreso de plataforma 1,400, sin propinas, 1 día trabajado.
   Auto: rendimiento 12 km/l, gasolina a 24.00 por litro, provisión de mantenimiento 0.60/km, depreciación 0.30/km (pásala ya calculada para este caso), gastos fijos mensuales 3,000 con 26 días trabajados al mes.
   Imprevisto: llanta, 250, ese día.

   Resultado esperado en modo **reales** (comparar con tolerancia de 2 decimales):
   - gasolina 360.00, mantenimiento 108.00, depreciación 54.00, fijos prorrateados 115.38, imprevistos 250.00
   - costo total 887.38
   - neto 512.62
   - neto por hora 51.26
   - neto por km 2.85
   - margen 36.6%
   - punto de equilibrio por hora 88.74

   Mismo caso **sin el imprevisto**: costo total 637.38, neto 762.62, neto por hora 76.26.

   Agrega además pruebas para: horas = 0, km = 0, ingreso = 0, imprevistos suavizados con historial suficiente e insuficiente, y gasto real de gasolina que reemplaza al estimado.
5. Antes de terminar: corre pruebas, `tsc` y lint, y dime qué quedó pendiente o dudoso.

No avances al Hito B. Si encuentras una ambigüedad en las fórmulas, pregúntame antes de decidir.
