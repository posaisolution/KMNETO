import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CalculadoraClient from './calculadora-client';

vi.mock('@/lib/actions/periodos', () => ({
  savePeriodoAction: vi.fn(async () => ({ ok: false, reason: 'auth' })),
  updatePeriodoAction: vi.fn(async () => ({ ok: false, reason: 'auth' })),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

function fillRequiredRealValues() {
  fireEvent.change(screen.getByLabelText(/viajes del período/i), {
    target: { value: '40' },
  });
  fireEvent.change(screen.getByLabelText(/horas conectado/i), {
    target: { value: '10' },
  });
  fireEvent.change(screen.getByLabelText(/kilómetros recorridos/i), {
    target: { value: '180' },
  });
  fireEvent.change(screen.getByLabelText(/ingreso de la plataforma/i), {
    target: { value: '1400' },
  });
}

function fillRealCosts() {
  fireEvent.change(screen.getByLabelText(/gasto real en gasolina/i), {
    target: { value: '350' },
  });
  fireEvent.change(screen.getByLabelText(/renta x d[ií]a/i), {
    target: { value: '400' },
  });
  fireEvent.change(screen.getByLabelText(/celular y recargas/i), {
    target: { value: '100' },
  });
}

const calcular = () =>
  fireEvent.click(screen.getByRole('button', { name: /^calcular$/i }));

describe('CalculadoraPage', () => {
  it('calcula y muestra resultados con los gastos de bolsillo', () => {
    render(<CalculadoraClient />);

    fillRequiredRealValues();
    fillRealCosts();
    calcular();

    // Gasolina 350 + renta 400 + celular 100 = 850; neto 1,400 - 850 = 550.
    expect(screen.getByText(/ganancia neta/i)).toBeInTheDocument();
    expect(screen.getByText(/\$550\.00/i)).toBeInTheDocument();
  });

  it('muestra las métricas por viaje como denominador principal', () => {
    render(<CalculadoraClient />);

    fillRequiredRealValues();
    fillRealCosts();
    calcular();

    // Neto 550 / 40 viajes = 13.75
    expect(screen.getByText(/\$13\.75/i)).toBeInTheDocument();
    // Costo 850 / 40 viajes = 21.25
    expect(screen.getByText(/\$21\.25/i)).toBeInTheDocument();
  });

  it('oculta las métricas por hora cuando no se capturan horas', () => {
    render(<CalculadoraClient />);

    fireEvent.change(screen.getByLabelText(/viajes del período/i), {
      target: { value: '40' },
    });
    fireEvent.change(screen.getByLabelText(/kilómetros recorridos/i), {
      target: { value: '180' },
    });
    fireEvent.change(screen.getByLabelText(/ingreso de la plataforma/i), {
      target: { value: '1400' },
    });
    fillRealCosts();
    calcular();

    expect(screen.queryByText(/neto por hora/i)).not.toBeInTheDocument();
    expect(screen.getByText(/\$13\.75/i)).toBeInTheDocument();
  });

  it('cambia la etiqueta de la renta según el período', () => {
    render(<CalculadoraClient />);

    expect(screen.getByLabelText(/renta x d[ií]a/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /una semana/i }));

    expect(screen.getByLabelText(/renta x semana/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/renta x d[ií]a/i)).not.toBeInTheDocument();
  });

  it('ya no muestra la sección del auto', () => {
    render(<CalculadoraClient />);

    expect(screen.queryByText(/tu auto/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/valor del auto/i)).not.toBeInTheDocument();
  });

  it('explica una métrica al tocar el botón de ayuda', () => {
    render(<CalculadoraClient />);

    fillRequiredRealValues();
    fillRealCosts();
    calcular();

    const ayuda = screen.getByRole('button', {
      name: /qué significa neto por viaje/i,
    });
    expect(ayuda).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(ayuda);

    expect(ayuda).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText(/ganancia neta ÷ viajes = \$550\.00 ÷ 40 = \$13\.75/i)
    ).toBeInTheDocument();
  });

  it('calcula gasolina estimada con rendimiento y precio', () => {
    render(<CalculadoraClient />);

    fillRequiredRealValues();
    fireEvent.click(screen.getByRole('button', { name: /estimar/i }));
    fireEvent.change(screen.getByLabelText(/rendimiento del auto/i), {
      target: { value: '12' },
    });
    fireEvent.change(screen.getByLabelText(/precio de la gasolina/i), {
      target: { value: '24' },
    });
    fireEvent.change(screen.getByLabelText(/renta x d[ií]a/i), {
      target: { value: '400' },
    });
    fireEvent.change(screen.getByLabelText(/celular y recargas/i), {
      target: { value: '100' },
    });
    calcular();

    // 180 km / 12 km/l = 15 l * $24/l = $360 de gasolina.
    // Costo 360 + 400 + 100 = 860; neto 1,400 - 860 = 540.
    expect(screen.getByText(/ganancia neta/i)).toBeInTheDocument();
    expect(screen.getByText(/\$540\.00/i)).toBeInTheDocument();
  });

  it('limpia los campos y el resultado al cambiar de período', () => {
    render(<CalculadoraClient />);

    fillRequiredRealValues();
    fillRealCosts();
    calcular();
    expect(screen.getByText(/ganancia neta/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /una semana/i }));

    expect(screen.getByLabelText(/viajes del período/i)).toHaveValue('');
    expect(screen.getByLabelText(/renta x semana/i)).toHaveValue('');
    expect(screen.getByLabelText(/ingreso de la plataforma/i)).toHaveValue('');
    expect(screen.queryByText(/ganancia neta/i)).not.toBeInTheDocument();
  });

  it('no borra los campos al tocar el período que ya está activo', () => {
    render(<CalculadoraClient />);

    fireEvent.change(screen.getByLabelText(/viajes del período/i), {
      target: { value: '40' },
    });

    fireEvent.click(screen.getByRole('button', { name: /un día/i }));

    expect(screen.getByLabelText(/viajes del período/i)).toHaveValue('40');
  });

  it('solo acepta números en los campos', () => {
    render(<CalculadoraClient />);

    const viajes = screen.getByLabelText(/viajes del período/i);

    fireEvent.change(viajes, { target: { value: '12abc' } });
    expect(viajes).toHaveValue('12');

    fireEvent.change(viajes, { target: { value: '1.2.3' } });
    expect(viajes).toHaveValue('1.23');

    fireEvent.change(viajes, { target: { value: 'abc' } });
    expect(viajes).toHaveValue('');
  });

  it('muestra errores de validación cuando faltan campos requeridos', () => {
    render(<CalculadoraClient />);

    calcular();

    expect(screen.getAllByText(/completa este campo/i).length).toBeGreaterThanOrEqual(4);
  });
});
