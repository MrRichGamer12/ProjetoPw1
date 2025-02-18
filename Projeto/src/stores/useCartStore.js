import { defineStore } from 'pinia';
import { useUserStore } from './useUserStore';
import { useVolunteerStore } from './useVolunteerStore';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [] // Inicializa o carrinho como um array vazio
  }),
  getters: {
    // Verifica se existe um usuário autenticado e retorna seu ID
    currentUserId(state) {
      const userStore = useUserStore();
      const volunteerStore = useVolunteerStore();
      if (userStore.isAuthenticated && userStore.user?.id) {
        return userStore.user.id;
      } else if (volunteerStore.isVolunteer && volunteerStore.volunteer?.id) {
        return volunteerStore.volunteer.id;
      }
      return null;
    },
    // Define a chave de armazenamento baseada no ID do usuário
    storageKey(state) {
      return this.currentUserId ? `cart_${this.currentUserId}` : 'cart';
    }
  },
  actions: {
    // Carrega o carrinho do localStorage usando a chave individual
    loadCartFromStorage() {
      const storedCart = localStorage.getItem(this.storageKey);
      if (storedCart) {
        this.cart = JSON.parse(storedCart);
      } else {
        this.cart = [];
      }
    },

    // Salva o carrinho no localStorage usando a chave individual
    saveCartToStorage() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
    },

    addToCart(product, quantity = 1) {
      if (!product.id || !product.name || !product.price || quantity <= 0) {
        console.error('Produto inválido ou quantidade inválida');
        return;
      }
      
      const item = this.cart.find(p => p.id === product.id);
      
      if (item) {
        item.quantity += quantity;
      } else {
        this.cart.push({ ...product, quantity });
      }
      this.saveCartToStorage();
    },

    removeFromCart(productId) {
      this.cart = this.cart.filter(p => p.id !== productId);
      this.saveCartToStorage();
    },

    clearCart() {
      this.cart = [];
      this.saveCartToStorage();
    },

    updateQuantity(productId, quantity) {
      if (quantity <= 0) {
        console.error('Quantidade inválida');
        return;
      }
      const product = this.cart.find(item => item.id === productId);
      if (product) {
        product.quantity = quantity;
      } else {
        console.error('Produto não encontrado no carrinho');
      }
      this.saveCartToStorage();
    }
  }
});
