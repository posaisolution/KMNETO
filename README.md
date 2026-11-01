# KmNeto

Calculadora de rentabilidad real para choferes de plataformas de transporte (Uber, DiDi, inDrive y otras) en México.

La app responde una pregunta simple: **¿cuánto gano de verdad después de gasolina, mantenimiento, depreciación y gastos fijos?**

## Alcance actual

- **Hito A — Motor de cálculo:** funciones puras para calcular ingreso neto, costos, margen y punto de equilibrio, con pruebas automatizadas.
- **Hitos B-D:** formulario móvil, pantalla de resultados, captura de contacto, cuenta, historial y pagos (por definir).

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/) (modo estricto)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/)

## Cómo correrlo localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Correr el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Pruebas y calidad

```bash
# Pruebas
npm run test

# Tipos
npx tsc --noEmit

# Lint
npm run lint
```

## Convenciones de ramas

La rama `main` está protegida. **No se permite subir directamente a `main`.**

Cada cambio debe pasar por una rama y un pull request:

```bash
git checkout -b feat/nombre-de-la-funcionalidad main
# ... commits ...
git push -u origin feat/nombre-de-la-funcionalidad
```

Tipos de rama comunes:

- `feat/...` — nueva funcionalidad
- `fix/...` — corrección de errores
- `docs/...` — documentación
- `test/...` — pruebas
- `chore/...` — mantenimiento o herramientas

## Licencia

Por definir.
