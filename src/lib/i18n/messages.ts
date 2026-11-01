export const messages = {
  app: {
    title: 'KmNeto',
    subtitle: 'Calcula cuánto ganas realmente como chofer de plataformas.',
  },
  landing: {
    hero: {
      headline: '¿Cuánto te queda realmente al volante?',
      subheadline:
        'KmNeto calcula tu ganancia neta después de gasolina, mantenimiento, depreciación y gastos fijos. Sin sorpresas.',
      cta: 'Calcular mi ganancia',
    },
    valueProps: {
      title: 'Porque lo que ves en la app no es lo que ganas',
      items: [
        {
          title: 'Suma todos tus costos',
          description:
            'Gasolina, mantenimiento, depreciación del auto, gastos fijos e imprevistos. Nada se queda fuera.',
        },
        {
          title: 'Descubre tu ganancia real',
          description:
            'Conoce cuánto ganas por hora, por kilómetro y cuál es tu margen real de utilidad.',
        },
        {
          title: 'Toma mejores decisiones',
          description:
            'Identifica si te conviene salir a manejar hoy o si estar conectado esas horas te está dejando menos de lo que crees.',
        },
      ],
    },
    steps: {
      title: 'Cómo funciona',
      items: [
        { title: '1. Captura tu auto', description: 'Rendimiento, gastos fijos y datos del vehículo. Solo una vez.' },
        { title: '2. Ingresa tu día', description: 'Horas, kilómetros e ingreso que te muestra la plataforma.' },
        { title: '3. Revisa tu neto', description: 'Descubre cuánto ganaste realmente y cuánto te cuesta cada kilómetro.' },
      ],
    },
    finalCta: {
      title: 'Deja de adivinar tus ganancias',
      description: 'En menos de 60 segundos sabrás si tu jornada realmente rindió.',
      cta: 'Empezar a calcular',
    },
    footer: 'Hecho para choferes de plataformas en México.',
  },
  sections: {
    periodo: 'El período',
    gastos: 'Tus gastos',
    resultados: 'Resultados',
  },
  labels: {
    horasConectado: 'Horas conectado',
    km: 'Kilómetros recorridos',
    ingresoPlataforma: 'Ingreso de la plataforma',
    propinasYEfectivo: 'Propinas y efectivo',
    gastoRealGasolina: 'Gasto real en gasolina',
    rendimientoKmPorLitro: 'Rendimiento del auto',
    precioLitro: 'Precio de la gasolina',
    gastosFijosPeriodo: 'Gastos fijos del período',
    imprevistos: 'Imprevistos',
    otrosGastosPeriodo: 'Otros gastos del período',
  },
  units: {
    kmPorLitro: 'km/l',
    pesosPorLitro: '$/l',
    pesosPorKm: '$/km',
    pesos: '$',
    km: 'km',
    horas: 'hrs',
    dias: 'días',
  },
  placeholders: {
    number: '0',
    optional: 'Opcional',
  },
  buttons: {
    calcular: 'Calcular',
    limpiar: 'Limpiar',
  },
  resultados: {
    neto: 'Ganancia neta',
    netoPorHora: 'Neto por hora',
    netoPorKm: 'Neto por km',
    costoPorKm: 'Costo por km',
    margenPct: 'Margen',
    puntoEquilibrioHora: 'Mínimo por hora',
    ingresoTotal: 'Ingreso total',
    costoTotal: 'Costo total',
    desglose: 'Desglose de costos',
    gasolina: 'Gasolina',
    gastosFijos: 'Gastos fijos',
    imprevistos: 'Imprevistos',
    otrosGastos: 'Otros gastos',
  },
  errors: {
    required: 'Completa este campo',
    negative: 'El valor no puede ser negativo',
    invalidNumber: 'Escribe un número válido',
  },
};
