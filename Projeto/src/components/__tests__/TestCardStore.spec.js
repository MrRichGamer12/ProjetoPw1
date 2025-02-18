import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '@/stores/useCartStore';
import { useUserStore } from '@/stores/useUserStore';
import { useVolunteerStore } from '@/stores/useVolunteerStore';
import { put } from '@/api/api';  // Importe a função 'put' da API

vi.mock('@/stores/useUserStore', () => ({
  useUserStore: vi.fn(() => ({
    isAuthenticated: false,
    user: null
  }))
}));

vi.mock('@/stores/useVolunteerStore', () => ({
  useVolunteerStore: vi.fn(() => ({
    isVolunteer: false,
    volunteer: null
  }))
}));

vi.mock('@/api/api', () => ({
  put: vi.fn()  // Mock da função 'put'
}));

describe('useCartStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    store = useCartStore();
    store.clearCart();
  });

  it('adds a product to the cart and saves to storage', async () => {
    const product = { id: 1, name: 'Product 1', price: 100 };

    // Chama o método addToCart
    await store.addToCart(product);

    expect(store.cart).toContainEqual({ ...product, quantity: 1 });
    expect(localStorage.getItem(store.getStorageKey())).toEqual(JSON.stringify(store.cart));

    // Verifica se a função put foi chamada para atualizar a API
    expect(put).toHaveBeenCalledWith('cart', { cart: store.cart });
  });

  it('increases the quantity of a product already in the cart', async () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    await store.addToCart(product);
    await store.addToCart(product);

    expect(store.cart[0].quantity).toBe(2);

    // Verifica se a função put foi chamada para atualizar a API
    expect(put).toHaveBeenCalledWith('cart', { cart: store.cart });
  });

  it('removes a product from the cart', async () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    await store.addToCart(product);
    await store.removeFromCart(1);

    expect(store.cart).toHaveLength(0);

    // Verifica se a função put foi chamada para atualizar a API
    expect(put).toHaveBeenCalledWith('cart', { cart: store.cart });
  });

  it('clears the cart', async () => {
    await store.addToCart({ id: 1, name: 'Product 1', price: 100 });
    await store.addToCart({ id: 2, name: 'Product 2', price: 200 });
    await store.clearCart();

    expect(store.cart).toHaveLength(0);

    // Verifica se a função put foi chamada para atualizar a API
    expect(put).toHaveBeenCalledWith('cart', { cart: store.cart });
  });

  it('updates the quantity of a product correctly', async () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    await store.addToCart(product);
    await store.updateQuantity(1, 5);

    expect(store.cart[0].quantity).toBe(5);

    // Verifica se a função put foi chamada para atualizar a API
    expect(put).toHaveBeenCalledWith('cart', { cart: store.cart });
  });

  it('does not update quantity if product is not found', async () => {
    // Limpa todas as chamadas anteriores do `put`
    vi.clearAllMocks();
  
    // Tenta atualizar a quantidade de um produto que não existe
    await store.updateQuantity(99, 5);  // ID do produto inexistente
  
    expect(store.cart).toHaveLength(0);  // Verifica que o carrinho ainda está vazio
  
    // Não deve chamar a função 'put' caso o produto não seja encontrado
    expect(put).not.toHaveBeenCalled();
  });
  

  it('loads the cart from storage', async () => {
    const cartData = [{ id: 1, name: 'Product 1', price: 100, quantity: 2 }];
    localStorage.setItem(store.getStorageKey(), JSON.stringify(cartData));
    store.loadCartFromStorage();

    expect(store.cart).toEqual(cartData);
  });

  it('uses the default storage key "cart"', () => {
    expect(store.getStorageKey()).toBe('cart');
  });
});
