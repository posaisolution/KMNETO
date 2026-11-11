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
    entrar: 'Entrar',
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
          answer:
            'El cálculo es gratis y no necesitas cuenta. Si creas una cuenta, guardamos tus cálculos para mostrarte tu historial y tus promedios.',
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
  periodo: {
    dia: 'Un día',
    semana: 'Una semana',
  },
  labels: {
    viajes: 'Viajes del período',
    horasConectado: 'Horas conectado',
    km: 'Kilómetros recorridos',
    ingresoPlataforma: 'Ingreso de la plataforma',
    propinasYEfectivo: 'Propinas y efectivo',
    rentaDia: 'Renta x día',
    rentaSemana: 'Renta x Semana',
    celularRecargas: 'Celular y recargas',
    gastoRealGasolina: 'Gasto real en gasolina',
    rendimientoKmPorLitro: 'Rendimiento del auto',
    precioLitro: 'Precio de la gasolina',
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
    viajes: 'viajes',
    dias: 'días',
  },
  placeholders: {
    number: '0',
    optional: 'Opcional',
  },
  hints: {
    gasolinaEstimada:
      'Se calcula con el rendimiento del auto y el precio por litro que captures.',
  },
  buttons: {
    calcular: 'Calcular',
    limpiar: 'Limpiar',
  },
  resultados: {
    neto: 'Ganancia neta',
    netoPorViaje: 'Neto por viaje',
    puntoEquilibrioViaje: 'Mínimo por viaje',
    netoPorHora: 'Neto por hora',
    netoPorKm: 'Neto por km',
    costoPorKm: 'Costo por km',
    margenPct: 'Margen',
    puntoEquilibrioHora: 'Mínimo por hora',
    ingresoTotal: 'Ingreso total',
    costoTotal: 'Costo total',
    desglose: 'Desglose de costos',
    gasolina: 'Gasolina',
    renta: 'Renta',
    celularRecargas: 'Celular y recargas',
    imprevistos: 'Imprevistos',
    otrosGastos: 'Otros gastos',
    historialInsuficiente:
      'Aún no hay kilómetros de historial para suavizar imprevistos: se usaron los reales.',
    comoSeCalcula: 'Cómo se calcula',
    ayudaDe: 'Qué significa',
  },
  explicaciones: {
    netoPorViaje:
      'Lo que te queda limpio de cada viaje, ya descontando gasolina, renta, celular, imprevistos y otros gastos.',
    puntoEquilibrioViaje:
      'Lo que te cuesta operar cada viaje. Si el viaje paga menos que esto, estás perdiendo dinero.',
    netoPorHora:
      'Tu ganancia limpia repartida entre las horas conectado. Sirve para comparar jornadas de distinta duración.',
    puntoEquilibrioHora:
      'Lo mínimo que necesitas ganar por hora para no perder dinero: es tu costo por cada hora conectado.',
    netoPorKm:
      'Ganancia limpia por cada kilómetro recorrido, contando también los kilómetros sin pasajero.',
    costoPorKm:
      'Cuánto te cuesta mover el auto cada kilómetro: gasolina, renta, celular, imprevistos y otros gastos.',
    margenPct:
      'Qué parte de lo que entra por la plataforma se convierte en ganancia. Lo que falta se va en costos.',
  },
  errors: {
    required: 'Completa este campo',
    negative: 'El valor no puede ser negativo',
    invalidNumber: 'Escribe un número válido',
    positive: 'Debe ser mayor a 0',
  },

  auth: {
    fields: {
      email: 'Correo electrónico',
      password: 'Contraseña',
      name: 'Tu nombre (opcional)',
      confirmPassword: 'Confirma tu contraseña',
    },
    placeholders: {
      email: 'tucorreo@ejemplo.com',
      password: 'Mínimo 8 caracteres',
      name: 'Cómo te llamas',
    },
    login: {
      title: 'Entra a tu cuenta',
      subtitle: 'Guarda tus jornadas y revisa tu historial.',
      submit: 'Entrar',
      noAccount: '¿Todavía no tienes cuenta?',
      registerLink: 'Crear una gratis',
      forgotLink: 'Olvidé mi contraseña',
    },
    register: {
      title: 'Crea tu cuenta',
      subtitle: 'Gratis. Solo necesitas tu correo para guardar tus cálculos.',
      submit: 'Crear cuenta',
      hasAccount: '¿Ya tienes cuenta?',
      loginLink: 'Entra aquí',
      privacy: 'Al crear tu cuenta aceptas que guardemos tus cálculos para mostrarte tu historial.',
    },
    forgot: {
      title: 'Recupera tu contraseña',
      subtitle: 'Te enviaremos un enlace a tu correo para crear una nueva.',
      submit: 'Enviar enlace',
      backToLogin: 'Volver a entrar',
      sentTitle: 'Revisa tu correo',
      sentBody:
        'Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.',
    },
    reset: {
      title: 'Nueva contraseña',
      subtitle: 'Escribe una contraseña nueva para tu cuenta.',
      submit: 'Guardar contraseña',
      invalidTitle: 'Enlace no válido',
      invalidBody:
        'Este enlace ya se usó o expiró. Pide uno nuevo para continuar.',
      requestNew: 'Pedir un enlace nuevo',
      success: 'Tu contraseña se actualizó. Ya puedes entrar.',
    },
    errors: {
      invalidEmail: 'Escribe un correo válido',
      shortPassword: 'La contraseña debe tener al menos 8 caracteres',
      longPassword: 'La contraseña es demasiado larga',
      longName: 'El nombre es demasiado largo',
      required: 'Completa este campo',
      invalidToken: 'El enlace no es válido',
      expiredToken: 'El enlace expiró. Pide uno nuevo.',
      emailTaken: 'Ya existe una cuenta con ese correo',
      invalidCredentials: 'Correo o contraseña incorrectos',
      locked: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.',
      generic: 'Algo salió mal. Inténtalo de nuevo.',
      passwordsDontMatch: 'Las contraseñas no coinciden',
    },
  },

  dashboard: {
    title: 'Tu historial',
    subtitle: 'Tus jornadas guardadas, con tu ganancia real.',
    greeting: 'Hola',
    empty: {
      title: 'Todavía no guardas ninguna jornada',
      body: 'Calcula tu día o tu semana y guárdalo para llevar tu historial.',
      cta: 'Calcular mi ganancia',
    },
    logout: 'Salir',
    savePeriod: 'Guardar en mi historial',
    savePeriodHint: 'Crea una cuenta gratis para guardar este cálculo.',
    saved: 'Guardado en tu historial',
    saveError: 'No se pudo guardar. Inténtalo de nuevo.',
    savedAt: 'Guardado',
    deletePeriod: 'Eliminar',
    editPeriod: 'Corregir',
    deleteConfirm: '¿Eliminar esta jornada? Esta acción no se puede deshacer.',
    deleteYes: 'Sí, eliminar',
    deleteNo: 'Cancelar',
    deleted: 'Jornada eliminada',
    deleteError: 'No se pudo eliminar. Inténtalo de nuevo.',
    detailTitle: 'Corregir jornada',
    detailSubtitle: 'Ajusta los datos y guarda los cambios.',
    saveChanges: 'Guardar cambios',
  },

  privacidad: {
    title: 'Aviso de privacidad',
    updated: 'Última actualización: noviembre de 2026',
    intro:
      'Este aviso explica qué datos guarda KmNeto, para qué los usa y cómo puedes controlarlos. Está escrito para que se entienda, no para esconder nada.',
    sections: [
      {
        title: 'Quién es el responsable',
        body: 'KmNeto es una aplicación para calcular la ganancia real de choferes de plataformas de transporte en México. El responsable del tratamiento de tus datos es el titular del proyecto. Para cualquier asunto relacionado con tus datos, escribe a privacidad@kmneto.app.',
      },
      {
        title: 'Qué datos guardamos',
        body: 'Solo si creas una cuenta: tu correo electrónico, tu nombre si decides escribirlo y una contraseña cifrada que ni nosotros podemos leer. Además guardamos los cálculos que decidas guardar: viajes, horas, kilómetros, ingresos y gastos del período. No pedimos teléfono, dirección, RFC, CURP ni datos de tu vehículo.',
      },
      {
        title: 'Para qué los usamos',
        body: 'Para mostrarte tu historial y tus promedios, y para que puedas recuperar tu contraseña. No vendemos tus datos, no los compartimos con las plataformas de transporte y no los usamos para publicidad.',
      },
      {
        title: 'Dónde se almacenan',
        body: 'En una base de datos PostgreSQL alojada en Neon y la aplicación corre en Vercel. El acceso está restringido: cada cuenta solo puede consultar sus propios cálculos.',
      },
      {
        title: 'Cuánto tiempo los conservamos',
        body: 'Mientras tu cuenta exista. Si pides la eliminación de tu cuenta, borramos tus datos personales y tus cálculos.',
      },
      {
        title: 'Tus derechos',
        body: 'Puedes solicitar acceso, corrección, eliminación u oposición al tratamiento de tus datos escribiendo a privacidad@kmneto.app. También puedes eliminar cualquier jornada desde tu historial en la aplicación.',
      },
      {
        title: 'Cambios a este aviso',
        body: 'Si cambiamos algo importante, lo avisaremos en la aplicación antes de aplicarlo.',
      },
    ],
    back: 'Volver al inicio',
  },
};
