import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/useUserStore';
import { get, post, del } from '@/api/api';

vi.mock('@/api/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn()
}));

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('initial state is correct', () => {
    const store = useUserStore();
    expect(store.user).toBeNull();
    expect(store.users).toEqual([]);
  });

  it('computes authentication state correctly', () => {
    const store = useUserStore();
    expect(store.isAuthenticated).toBe(false);
    store.user = { id: 1, name: 'John Doe', role: 'user' };
    expect(store.isAuthenticated).toBe(true);
  });

  it('computes admin state correctly', () => {
    const store = useUserStore();
    store.user = { id: 1, name: 'John Doe', role: 'user' };
    expect(store.isAdmin).toBe(false);
    store.user.role = 'admin';
    expect(store.isAdmin).toBe(true);
  });

  it('logs in a user successfully', async () => {
    get.mockResolvedValue([{ id: 1, email: 'test@example.com', password: '123456' }]);
    const store = useUserStore();
    const response = await store.login('test@example.com', '123456');

    expect(response.success).toBe(true);
    expect(store.user).toEqual({ id: 1, email: 'test@example.com', password: '123456' });
    expect(localStorage.getItem('user')).toBe(JSON.stringify(store.user));
  });

  it('fails login with wrong credentials', async () => {
    get.mockResolvedValue([{ id: 1, email: 'test@example.com', password: '123456' }]);
    const store = useUserStore();
    const response = await store.login('wrong@example.com', 'wrongpass');

    expect(response.success).toBe(false);
    expect(response.message).toBe('Credenciais inválidas!');
    expect(store.user).toBeNull();
  });

  it('registers a new user successfully', async () => {
    post.mockResolvedValue();
    const store = useUserStore();
    const response = await store.register('John Doe', 'john@example.com', '123456');

    expect(response.success).toBe(true);
    expect(response.message).toBe('Registro bem-sucedido! Agora faça login.');
    expect(store.users.length).toBe(1);
  });

  it('loads user from localStorage correctly', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'John Doe' }));
    const store = useUserStore();
    store.loadUserFromStorage();

    expect(store.user).toBeTruthy(); // Verifica se o usuário foi carregado
    expect(store.user).toEqual({ id: 1, name: 'John Doe' });
  });

  it('logs out a user successfully', () => {
    const store = useUserStore();
    store.user = { id: 1, name: 'John Doe' };
    store.logout();

    expect(store.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('deletes a user successfully', async () => {
    del.mockResolvedValue();
    const store = useUserStore();
    store.user = { id: 1, name: 'John Doe' };
    localStorage.setItem('user', JSON.stringify(store.user));

    const response = await store.deleteUser();

    expect(response.success).toBe(true);
    expect(response.message).toBe('Conta excluída com sucesso.');
    expect(store.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('fails to delete when no user is logged in', async () => {
    const store = useUserStore();
    const response = await store.deleteUser();

    expect(response.success).toBe(false);
    expect(response.message).toBe('Usuário não encontrado.');
  });
});
