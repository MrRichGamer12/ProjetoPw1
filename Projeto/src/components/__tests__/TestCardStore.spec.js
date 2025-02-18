import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '@/stores/useCartStore';

describe('useCartStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear(); // Limpa o localStorage entre os testes
    store = useCartStore();
    store.clearCart(); // Limpa o carrinho antes de cada teste
  });

  it('adds a product to the cart', () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    store.addToCart(product);
    
    expect(store.cart).toContainEqual({ ...product, quantity: 1 });
    // Verifica se o localStorage foi atualizado com a chave dinâmica (neste caso, "cart")
    expect(localStorage.getItem(store.storageKey)).toEqual(JSON.stringify(store.cart));
  });

  it('increases the quantity of a product already in the cart', () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    store.addToCart(product);
    store.addToCart(product);
    
    expect(store.cart).toContainEqual({ ...product, quantity: 2 });
  });

  it('does not add the same product twice with separate quantities', () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    store.addToCart(product);
    store.addToCart(product);
    
    expect(store.cart.length).toBe(1);
    expect(store.cart[0].quantity).toBe(2);
  });

  it('removes a product from the cart', () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    store.addToCart(product);
    store.removeFromCart(1);
    
    expect(store.cart).toHaveLength(0);
    expect(localStorage.getItem(store.storageKey)).toEqual(JSON.stringify([]));
  });

  it('does not remove a product if it is not in the cart', () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    store.addToCart(product);
    store.removeFromCart(2); // Tentando remover um produto não existente
    
    expect(store.cart).toHaveLength(1);
  });

  it('clears the cart', () => {
    const product1 = { id: 1, name: 'Product 1', price: 100 };
    const product2 = { id: 2, name: 'Product 2', price: 150 };
    
    store.addToCart(product1);
    store.addToCart(product2);
    
    store.clearCart();
    
    expect(store.cart).toHaveLength(0);
    expect(localStorage.getItem(store.storageKey)).toEqual(JSON.stringify([]));
  });

  it('does not add a product with missing required properties', () => {
    const invalidProduct = { name: 'Invalid Product' }; // Faltando `id` e `price`
    store.addToCart(invalidProduct);
    
    expect(store.cart).toHaveLength(0); // Espera que o produto não seja adicionado
  });

  it('calculates the total price of the cart correctly', () => {
    const product1 = { id: 1, name: 'Product 1', price: 100 };
    const product2 = { id: 2, name: 'Product 2', price: 150 };
    
    store.addToCart(product1);
    store.addToCart(product2);
    
    const totalPrice = store.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    expect(totalPrice).toBe(250); // 100 + 150
  });

  it('adds a product with quantity greater than 1 directly', () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    store.addToCart(product, 3); // Adicionando 3 unidades
    
    expect(store.cart).toContainEqual({ ...product, quantity: 3 });
  });

  it('updates the product quantity correctly', () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    store.addToCart(product);
    store.updateQuantity(1, 5); // Atualizando a quantidade para 5
    
    expect(store.cart[0].quantity).toBe(5);
  });

  it('does not add a product with invalid quantity', () => {
    const product = { id: 1, name: 'Product 1', price: 100 };
    store.addToCart(product, 0); // Tentando adicionar com quantidade inválida
    
    expect(store.cart).toHaveLength(0);
  });
});
