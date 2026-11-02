export const messages = {
  app: {
    title: 'KmNeto',
    subtitle: 'Calcula cuánto ganas realmente como chofer de plataformas.',
  },

  nav: {
    inicio: 'Inicio',
    queEs: 'Qué es',
    comoFunciona: 'Cómo funciona',
    preguntas: 'Preguntas',
    calcular: 'Calcular',
  },

  landing: {
    pill: 'Para choferes de Uber, DiDi e inDrive',
    headline: 'Descubre cuánto te queda realmente al volante.',
    subheadline:
      'KmNeto suma gasolina, renta, imprevistos y gastos del día para mostrarte tu ganancia neta. Sin sorpresas, sin adivinar.',
    ctaPrimary: 'Calcular mi ganancia',
    ctaSecondary: 'Ver cómo funciona',
    stats: [
      { value: '60s', label: 'Tiempo para calcular' },
      { value: '100%', label: 'Gratis' },
      { value: 'MXN', label: 'Pesos mexicanos' },
    ],
    sampleCard: {
      title: 'Resumen de tu jornada',
      neto: 'Neto del día',
      porHora: 'Neto por hora',
      porKm: 'Neto por km',
    },
    marquee: [
      'Gasolina',
      'Renta',
      'Imprevistos',
      'Propinas',
      'Neto por hora',
      'Costo por km',
      'Margen',
      'Punto de equilibrio',
    ],
    valueProps: {
      title: 'Porque lo que la app muestra no es lo que ganas',
      items: [
        {
          title: 'Suma todos tus costos',
          description:
            'Gasolina, renta, llanta, grúa, multa, alimentación y recarga. Nada se queda fuera.',
        },
        {
          title: 'Descubre tu ganancia real',
          description:
            'Ve cuánto ganas por hora, por kilómetro y cuál es tu margen real.',
        },
        {
          title: 'Decide mejor',
          description:
            'Saber tu punto de equilibrio te dice si vale la pena salir a manejar hoy.',
        },
      ],
    },
    steps: {
      title: 'Cómo funciona',
      items: [
        { title: 'Captura tu día', description: 'Horas, kilómetros e ingreso que te muestra la plataforma.' },
        { title: 'Agrega tus gastos', description: 'Gasolina, renta del período, imprevistos y otros gastos.' },
        { title: 'Revisa tu neto', description: 'Conoce cuánto ganaste de verdad y cuánto cuesta cada kilómetro.' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Es gratis?',
          answer: 'Sí. El cálculo básico es gratuito y no necesitas registrarte.',
        },
        {
          question: '¿Mis datos se guardan?',
          answer: 'No. Por ahora todo se calcula en tu celular; no guardamos información en servidores.',
        },
        {
          question: '¿Puedo calcular una semana?',
          answer: 'Sí. Solo ingresa los totales del período que quieras revisar.',
        },
        {
          question: '¿Qué plataformas sirven?',
          answer: 'Uber, DiDi, inDrive y cualquier otra donde manejes con tu auto.',
        },
      ],
    },
    finalCta: {
      title: 'Deja de adivinar cuánto ganas',
      description: 'En menos de un minuto sabrás si tu jornada realmente rindió.',
      cta: 'Empezar a calcular',
    },
    footer: {
      description: 'Calculadora de rentabilidad real para choferes de plataformas en México.',
      copyright: 'Hecho para choferes que quieren saber sus números de verdad.',
    },
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
