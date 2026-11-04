# AGENTS.md — Calculadora de rentabilidad real para choferes

> Nombre de trabajo: **NetoChofer** (cámbialo cuando haya nombre definitivo).
> Antes de escribir código, lee este archivo completo. Si algo no está claro, pregunta.

## 1. Qué es el producto

App web (PWA, mobile-first) en **español de México** que le dice a un chofer de plataformas de transporte (Uber, DiDi, inDrive u otras) cuánto gana **realmente** después de todos sus costos: gasolina, mantenimiento, depreciación, gastos fijos e imprevistos del auto.

- **Gratis (sin registro):** calculadora de un día o una semana. Al final ofrece enviar el resultado por WhatsApp o correo (captura de contacto).
- **Pro (suscripción, después del MVP):** cuenta, historial, reporte semanal, mejores días y horarios.

Usuario típico: chofer, usa el celular con una mano, poco tiempo, poca paciencia para formularios. **Cada pantalla debe poder completarse en menos de 60 segundos.**

## 2. Alcance del MVP (Hito A–C)

Incluye: motor de cálculo, formulario, pantalla de resultados, captura de contacto.
NO incluye todavía: login, pagos, historial, impuestos, integraciones con las plataformas.

## 3. Stack

- Next.js (App Router) + TypeScript estricto + Tailwind CSS
- Prisma + PostgreSQL (solo desde el Hito C en adelante)
- NextAuth.js y Stripe (solo Hito D, no tocar antes)
- Pruebas: Vitest
- Despliegue: Coolify en VPS Hetzner (no configurar despliegue sin que se pida)
- Textos en español, centralizados en un archivo de mensajes para poder traducir después (no dejar strings sueltos en componentes)

## 4. Reglas de dominio y fórmulas (fuente de verdad)

Todas las cantidades en pesos mexicanos (MXN). Los cálculos viven en **funciones puras** en `src/lib/calc/`, sin acceso a UI ni base de datos. Usar números decimales con cuidado (sin errores de punto flotante visibles: redondear solo al mostrar, nunca en pasos intermedios).

### Entradas de un período (día o semana)
- `viajes`: cantidad de viajes completados (denominador principal de las métricas por viaje)
- `horasConectado`: opcional, horas con la app encendida (solo para métricas por hora)
- `km`: kilómetros totales recorridos (incluyendo los vacíos)
- `ingresoPlataforma`: lo que la app le muestra como ganancia (ver nota)
- `propinasYEfectivo`: opcional
- `diasTrabajados` del período

> Nota: cada plataforma muestra "ganancia" de forma distinta (algunas ya descuentan comisión). Por eso el formulario pide **lo que el chofer realmente recibe**, y ofrece un campo opcional de "% de comisión" solo si ingresa tarifa bruta. No asumir porcentajes de comisión.

### Perfil del auto (se captura una vez, editable)
- `rendimientoKmPorLitro`
- `precioLitro` (editable por período)
- `provisionMantenimientoPorKm` (aceite, filtros, frenos, desgaste de llantas)
- `valorAuto`, `valorResidualEstimado`, `kmVidaUtilRestante` → depreciación por km
- `gastosFijosMensuales`: seguro, financiamiento o renta, verificación, refrendo, plan de datos, lavado, etc.
- `diasTrabajadosPorMes` (default 26, editable)

### Cálculo
```
litros              = km / rendimientoKmPorLitro
gasolina            = litros * precioLitro            (o gasto real si el chofer lo captura directamente)
mantenimiento       = km * provisionMantenimientoPorKm
depreciacion        = km * ((valorAuto - valorResidualEstimado) / kmVidaUtilRestante)
fijosProrrateados   = (gastosFijosMensuales / diasTrabajadosPorMes) * diasTrabajados
imprevistos         = ver sección siguiente

ingresoTotal        = ingresoPlataforma + propinasYEfectivo
costoTotal          = gasolina + mantenimiento + depreciacion + fijosProrrateados + imprevistos
neto                = ingresoTotal - costoTotal

netoPorViaje        = neto / viajes
netoPorHora         = neto / horasConectado        (null si no se capturan horas)
netoPorKm           = neto / km
costoPorKm          = costoTotal / km
margenPct           = neto / ingresoTotal
puntoEquilibrioViaje = costoTotal / viajes         (lo mínimo que debe pagar un viaje para no perder)
puntoEquilibrioHora = costoTotal / horasConectado  (lo mínimo que debe ganar por hora para no perder)
```
Proteger divisiones entre cero (viajes = 0, horas = 0, km = 0, ingreso = 0): devolver `null`, no `NaN` ni `Infinity`.

### Imprevistos (llanta ponchada, falla, grúa, multa, etc.)
Son gastos irregulares. Se registran con fecha, categoría y monto. Se muestran de **dos formas** que el usuario puede alternar:
1. **Reales:** se restan en el período en que ocurrieron.
2. **Suavizados:** reserva = (imprevistos acumulados / km acumulados en la ventana histórica) * km del período. Si no hay historial suficiente, usar solo los reales y avisarlo.

Evitar doble conteo: `provisionMantenimientoPorKm` cubre desgaste esperado; los imprevistos cubren lo inesperado. No registrar el mismo gasto en ambos.

## 5. Cosas que NO se hacen

- No mostrar logos, nombres como marca ni imitar la interfaz de Uber, DiDi, inDrive u otras. Referirse a "plataformas de transporte" en general; los nombres solo como texto neutral para elegir plataforma.
- No dar asesoría fiscal. Si en el futuro hay estimado de impuestos, debe marcarse "orientativo" y estar desactivado por defecto.
- No pedir datos personales innecesarios. Teléfono o correo solo con consentimiento explícito y enlace al aviso de privacidad.
- No inventar valores por defecto como si fueran datos reales: todo valor sugerido debe verse editable y rotulado como "ejemplo".
- No guardar secretos en el repo. Variables de entorno en `.env` (ignorado por git) y `.env.example` sin valores.

## 6. Forma de trabajar

1. Siempre proponer un plan corto antes de implementar un hito, y esperar aprobación.
2. Un hito por sesión. Commits pequeños con mensajes claros.
3. Toda función de `src/lib/calc/` debe tener pruebas con casos calculados a mano.
4. Antes de dar un hito por terminado: correr pruebas, tipos (`tsc`) y lint.
5. Accesibilidad móvil: botones grandes, inputs numéricos con teclado numérico, contraste alto.

## 7. Estructura sugerida
```
src/
  app/                 # rutas (App Router)
  components/
  lib/
    calc/              # motor de cálculo (funciones puras) + tests
    i18n/              # mensajes en español
  types/
tests/
```

## 8. Hitos
- **A** Motor de cálculo con pruebas
- **B** Formulario móvil y pantalla de resultados
- **C** Captura de contacto + despliegue
- **D** (solo si valida) cuentas, historial y pagos

## 9. Reglas extra de verificación (importantes con modelos económicos)
- No declares un hito terminado sin mostrar la salida real de las pruebas, `tsc` y lint.
- Si una prueba falla, no cambies el valor esperado para que pase: reporta el desacuerdo y pregunta.
- Haz los cálculos solo en código, nunca "a ojo" ni con tu propio razonamiento numérico.
- Si algo del enunciado es ambiguo, pregunta antes de decidir.
