import { describe, expect, it } from 'vitest';

import { savePeriodoSchema } from './periodo-schema';
import { emailSchema, loginSchema, passwordSchema, registerSchema } from './validation';

describe('emailSchema', () => {
  it('normalizes surrounding spaces and uppercase', () => {
    expect(emailSchema.parse('  Chofer@Ejemplo.COM ')).toBe('chofer@ejemplo.com');
  });

  it('rejects a malformed email', () => {
    expect(emailSchema.safeParse('no-es-correo').success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('requires at least 8 characters', () => {
    expect(passwordSchema.safeParse('1234567').success).toBe(false);
    expect(passwordSchema.safeParse('12345678').success).toBe(true);
  });
});

describe('registerSchema', () => {
  it('accepts a registration without a name', () => {
    const parsed = registerSchema.safeParse({
      email: 'chofer@ejemplo.com',
      password: 'secreto123',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const parsed = registerSchema.safeParse({
      email: 'chofer',
      password: 'secreto123',
    });

    expect(parsed.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('rejects an empty password', () => {
    expect(
      loginSchema.safeParse({ email: 'chofer@ejemplo.com', password: '' }).success,
    ).toBe(false);
  });
});

describe('savePeriodoSchema', () => {
  const base = {
    tipo: 'dia' as const,
    fechaInicio: '2026-03-10T12:00:00.000Z',
    viajes: 20,
    km: 150,
    ingresoPlataforma: 1200,
  };

  it('accepts a minimal period', () => {
    expect(savePeriodoSchema.safeParse(base).success).toBe(true);
  });

  it('rejects negative amounts', () => {
    const parsed = savePeriodoSchema.safeParse({ ...base, km: -1 });
    expect(parsed.success).toBe(false);
  });

  it('rejects an unknown period type', () => {
    const parsed = savePeriodoSchema.safeParse({ ...base, tipo: 'mes' });
    expect(parsed.success).toBe(false);
  });
});
