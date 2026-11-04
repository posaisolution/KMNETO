import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CalculadoraPage from './page';

function fillRequiredRealValues() {
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

describe('CalculadoraPage', () => {
  it('calcula y muestra resultados usando gasto real de gasolina', () => {
    render(<CalculadoraPage />);

    fillRequiredRealValues();
    fireEvent.change(screen.getByLabelText(/gasto real en gasolina/i), {
      target: { value: '350' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^calcular$/i }));

    // Perfil de ejemplo: 180 km * $0.60/km = $108 mantenimiento,
    // 180 km * $0.30/km = $54 depreciación, ($3,000 / 26) * 1 día = $115.38 fijos.
    // Costo 350 + 108 + 54 + 115.38 = 627.38; neto 1,400 - 627.38 = 772.62.
    expect(screen.getByText(/ganancia neta/i)).toBeInTheDocument();
    expect(screen.getByText(/\$772\.62/i)).toBeInTheDocument();
  });

  it('calcula gasolina estimada cuando se elige el modo estimado', () => {
    render(<CalculadoraPage />);

    fillRequiredRealValues();
    fireEvent.click(screen.getByRole('button', { name: /estimar/i }));
    fireEvent.change(screen.getByLabelText(/rendimiento del auto/i), {
      target: { value: '12' },
    });
    fireEvent.change(screen.getByLabelText(/precio de la gasolina/i), {
      target: { value: '24' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^calcular$/i }));

    // 180 km / 12 km/l = 15 l * $24/l = $360 de gasolina.
    // Costo 360 + 108 + 54 + 115.38 = 637.38; neto 1,400 - 637.38 = 762.62.
    expect(screen.getByText(/ganancia neta/i)).toBeInTheDocument();
    expect(screen.getByText(/\$762\.62/i)).toBeInTheDocument();
  });

  it('muestra errores de validación cuando faltan campos requeridos', () => {
    render(<CalculadoraPage />);

    fireEvent.click(screen.getByRole('button', { name: /^calcular$/i }));

    expect(screen.getAllByText(/completa este campo/i).length).toBeGreaterThanOrEqual(4);
  });
});
