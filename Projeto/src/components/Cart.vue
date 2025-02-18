<template>
  <div class="cart-page">
    <h2 class="page-title">Seu Carrinho</h2>

    <!-- Caso o carrinho esteja vazio -->
    <div v-if="cartStore.cart.length === 0" class="empty-cart">
      <p>Seu carrinho está vazio.</p>
      <router-link to="/produtos" class="go-to-products">Explore os produtos</router-link>
    </div>

    <!-- Listagem dos itens do carrinho -->
    <div v-else class="cart-items">
      <div v-for="item in cartStore.cart" :key="item.id" class="cart-item">
        <div class="cart-item-info">
          <p class="item-name">{{ item.name }}</p>
          <p class="item-quantity">{{ item.quantity }}x</p>
          <p v-if="item.personalizedText" class="item-personalized-text">Texto Personalizado: {{ item.personalizedText }}</p>
          <!-- Exibe o preço do produto (já com o aumento de 20% se houver) -->
          <p class="item-price">{{ item.price.toFixed(2) }}€</p> <!-- Preço do produto -->
        </div>
        <button @click="askForConfirmation(item.id)" class="remove-button">Remover</button>
      </div>

      <!-- Botão para finalizar a compra -->
      <button @click="cartStore.clearCart" :disabled="cartStore.cart.length === 0" class="checkout-button">
        Finalizar Compra
      </button>
    </div>

    <!-- Modal de confirmação -->
    <Modal
      :show="showModal"
      title="Remover item"
      message="Tem certeza de que deseja remover este item do carrinho?"
      @cancel="showModal = false"
      @confirm="removeFromCart"
    />
  </div>
</template>


<script>
import { useCartStore } from '@/stores/useCartStore';
import { defineComponent, onMounted, ref } from 'vue';
import Modal from './ConfirmModal.vue'; // Certifique-se de ajustar o caminho conforme necessário.

export default defineComponent({
  components: {
    Modal,
  },
  setup() {
    const cartStore = useCartStore();
    const showModal = ref(false);  // Para controlar a visibilidade do modal
    const itemToRemove = ref(null);  // Armazenar o item que está prestes a ser removido

    // Carregar o carrinho do localStorage ao inicializar o componente
    onMounted(() => {
      cartStore.loadCartFromStorage(); // Carregar carrinho ao montar o componente
    });

    // Exibir o modal de confirmação
    const askForConfirmation = (itemId) => {
      itemToRemove.value = itemId;
      showModal.value = true;
    };

    // Função para remover o item do carrinho
    const removeFromCart = () => {
      if (itemToRemove.value !== null) {
        cartStore.removeFromCart(itemToRemove.value);
        showModal.value = false;
      }
    };

    return { cartStore, askForConfirmation, removeFromCart, showModal, itemToRemove };
  }
});

</script>

<style scoped>
.cart-page {
  font-family: 'Arial', sans-serif;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.empty-cart {
  text-align: center;
  font-size: 1.2rem;
  color: #888;
}

.go-to-products {
  display: inline-block;
  margin-top: 10px;
  color: #ff7eb3;
  text-decoration: none;
  font-weight: bold;
}

.go-to-products:hover {
  text-decoration: underline;
}

.cart-items {
  margin-top: 20px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.cart-item:hover {
  transform: translateY(-5px);
}

.cart-item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 1.2rem;
  color: #333;
  font-weight: bold;
}

.item-quantity {
  font-size: 1rem;
  color: #666;
}

.item-personalized-text {
  font-size: 1rem;
  color: #007bff;
  margin-top: 5px;
}

.item-price {
  font-size: 1.1rem;
  color: #f44336;
  font-weight: bold;
  margin-top: 5px;
}

.remove-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.remove-button:hover {
  background-color: #d32f2f;
}

.checkout-button {
  background-color: #4caf50;
  color: white;
  padding: 12px 24px;
  font-size: 1.1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  margin-top: 20px;
  display: block;
  width: 100%;
  text-align: center;
}

.checkout-button:hover {
  background-color: #388e3c;
  transform: scale(1.05);
}

.checkout-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .checkout-button {
    width: auto;
  }
}
</style>
