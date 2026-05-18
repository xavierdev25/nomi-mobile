import { formatCurrency, isStoreOpen } from '../../src/utils';
import { Store } from '../../src/types';

describe('formatCurrency', () => {
  it('formats whole numbers with two decimal places', () => {
    expect(formatCurrency(12)).toBe('S/ 12.00');
  });

  it('formats decimal amounts correctly', () => {
    expect(formatCurrency(0.5)).toBe('S/ 0.50');
  });

  it('rounds to two decimal places', () => {
    expect(formatCurrency(9.999)).toBe('S/ 10.00');
  });
});

const makeStore = (overrides: Partial<Store> = {}): Store => ({
  id: 1,
  nombre: 'Test Store',
  ownerId: 1,
  activo: true,
  creadoEn: '',
  horarioApertura: '09:00',
  horarioCierre: '18:00',
  ...overrides,
});

describe('isStoreOpen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true when Lima time is within store hours', () => {
    // UTC 17:00 = Lima 12:00 (UTC-5), within 09:00-18:00
    jest.setSystemTime(new Date('2024-01-15T17:00:00Z'));
    expect(isStoreOpen(makeStore())).toBe(true);
  });

  it('returns false when Lima time is after closing hour', () => {
    // UTC 01:00 = Lima 20:00 (UTC-5), after 18:00
    jest.setSystemTime(new Date('2024-01-16T01:00:00Z'));
    expect(isStoreOpen(makeStore())).toBe(false);
  });

  it('returns false when Lima time is before opening hour', () => {
    // UTC 13:00 = Lima 08:00 (UTC-5), before 09:00
    jest.setSystemTime(new Date('2024-01-15T13:00:00Z'));
    expect(isStoreOpen(makeStore())).toBe(false);
  });

  it('returns true at exactly Lima opening time', () => {
    // UTC 14:00 = Lima 09:00 (UTC-5), exactly at opening
    jest.setSystemTime(new Date('2024-01-15T14:00:00Z'));
    expect(isStoreOpen(makeStore())).toBe(true);
  });

  it('returns false when store is inactive', () => {
    jest.setSystemTime(new Date('2024-01-15T17:00:00Z'));
    expect(isStoreOpen(makeStore({ activo: false }))).toBe(false);
  });

  it('returns activo flag when no schedule is set', () => {
    jest.setSystemTime(new Date('2024-01-15T17:00:00Z'));
    expect(isStoreOpen(makeStore({ horarioApertura: undefined, horarioCierre: undefined }))).toBe(true);
    expect(isStoreOpen(makeStore({ activo: false, horarioApertura: undefined, horarioCierre: undefined }))).toBe(false);
  });
});
