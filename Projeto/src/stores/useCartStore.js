import { defineStore } from 'pinia';
import { useUserStore } from './useUserStore';
import { useVolunteerStore } from './useVolunteerStore';
import { put } from '@/api/api';  // Importe as funções para chamadas API

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [] // Inicializa o carrinho como um array vazio
  }),
  actions: {
    // A chave de armazenamento agora é fixa como 'cart'
    getStorageKey() {
      return 'cart';  // Retorna sempre a chave 'cart'
    },

    // Carrega o carrinho do localStorage usando a chave fixa 'cart'
    loadCartFromStorage() {
      const storageKey = this.getStorageKey();
      const cartData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      this.cart = cartData;
    },

    saveCartToStorage() {
      const storageKey = this.getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(this.cart));
    },

    async addToCart(product, quantity = 1) {
      if (!product.id || !product.name || !product.price || quantity <= 0) {
        console.error('Produto inválido ou quantidade inválida');
        return;
      }

      // Verifica se o produto já existe no carrinho
      const item = this.cart.find(p => p.id === product.id);

      if (item) {
        item.quantity += quantity;
      } else {
        this.cart.push({ ...product, quantity });
      }

      // Atualiza o carrinho na base de dados com o PUT
      try {
        await put('cart', { cart: this.cart });  // Aqui, PUT agora é genérico
      } catch (error) {
        console.error('Erro ao atualizar o carrinho na base de dados:', error);
      }

      this.saveCartToStorage();  // Salva o carrinho localmente
    },

    async removeFromCart(productId) {
      this.cart = this.cart.filter(p => p.id !== productId);

      // Atualiza o carrinho na base de dados
      try {
        await put('cart', { cart: this.cart });  // Aqui, PUT agora é genérico
      } catch (error) {
        console.error('Erro ao atualizar o carrinho na base de dados:', error);
      }

      this.saveCartToStorage();  // Salva o carrinho localmente
    },

    async clearCart() {
      this.cart = [];

      // Atualiza o carrinho na base de dados
      try {
        await put('cart', { cart: this.cart });  // Aqui, PUT agora é genérico
      } catch (error) {
        console.error('Erro ao atualizar o carrinho na base de dados:', error);
      }

      this.saveCartToStorage();  // Salva o carrinho localmente
    },

    async updateQuantity(productId, quantity) {
      if (quantity <= 0) {
        console.error('Quantidade inválida');
        return;
      }

      const product = this.cart.find(item => item.id === productId);
      if (product) {
        product.quantity = quantity;

        // Atualiza o carrinho na base de dados
        try {
          await put('cart', { cart: this.cart });  // Aqui, PUT agora é genérico
        } catch (error) {
          console.error('Erro ao atualizar o carrinho na base de dados:', error);
        }
      } else {
        console.error('Produto não encontrado no carrinho');
      }

      this.saveCartToStorage();  // Salva o carrinho localmente
    }
  }
});
