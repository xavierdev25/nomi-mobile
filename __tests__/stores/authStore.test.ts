import { useAuthStore } from '../../src/store/authStore';
import { User } from '../../src/types';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockUser: User = {
  id: 1,
  nombres: 'Juan',
  apellidos: 'Pérez',
  email: 'juan@test.com',
  role: 'ESTUDIANTE',
  activo: true,
  creadoEn: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('setAuth', () => {
  it('sets user, accessToken, refreshToken and isAuthenticated=true', async () => {
    await useAuthStore.getState().setAuth(mockUser, 'access123', 'refresh456');

    const { user, accessToken, refreshToken, isAuthenticated } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(accessToken).toBe('access123');
    expect(refreshToken).toBe('refresh456');
    expect(isAuthenticated).toBe(true);
  });
});

describe('clearAuth', () => {
  it('resets all fields to null/false', async () => {
    await useAuthStore.getState().setAuth(mockUser, 'access123', 'refresh456');
    await useAuthStore.getState().clearAuth();

    const { user, accessToken, refreshToken, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
    expect(isAuthenticated).toBe(false);
  });
});

describe('isAuthenticated', () => {
  it('is false when no user is set', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('is false when user exists but no token', () => {
    useAuthStore.setState({ user: mockUser, accessToken: null, isAuthenticated: false });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
