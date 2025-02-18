<template>
  <div class="products-container">
    <h2>Produtos do Evento</h2>

    <!-- Campo para personalização -->
    <div class="customization">
      <label for="personalized-text">Texto Personalizado:</label>
      <input
        v-model="personalizedText"
        type="text"
        id="personalized-text"
        placeholder="Digite o texto para personalizar"
      />
    </div>

    <!-- Carregamento de Produtos -->
    <div v-if="loading" class="loading">
      <p>Carregando produtos...</p>
    </div>

    <!-- Caso haja produtos -->
    <div v-else-if="products.length > 0" class="products-list">
      <div v-for="product in products" :key="product.id" class="product-card">
        <img :src="product.image" :alt="product.name" class="product-image" />
        <div class="product-details">
          <h3>
            {{ product.name }} 
            <span v-if="personalizedText" class="personalized-text"> - {{ personalizedText }}</span>
          </h3>
          <p class="price">{{ product.price }}€</p>
          <p v-if="product.event_name" class="event-name">Evento: {{ product.event_name }}</p>
          <button @click="addToCart(product)" :disabled="isAddingToCart" class="add-to-cart-btn">
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>

    <!-- Caso não haja produtos -->
    <div v-else class="no-products">
      <p>Nenhum produto disponível para este evento.</p>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '@/stores/useCartStore';
import { useUserStore } from '@/stores/useUserStore';
import { useVolunteerStore } from '@/stores/useVolunteerStore';
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { get } from '@/api/api';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const eventId = route.params.id ? parseInt(route.params.id) : null;
    const volunteerStore = useVolunteerStore();

    const cartStore = useCartStore();
    const userStore = useUserStore();
    const products = ref([]);
    const loading = ref(true);
    const isAddingToCart = ref(false);
    const personalizedText = ref('');

    const fetchEventName = async (eventId) => {
      try {
        const data = await get(`events/${eventId}`);
        return data.name;
      } catch (error) {
        console.error('Erro ao carregar o evento:', error);
        return 'Evento desconhecido';
      }
    };

    const fetchProducts = async (eventId) => {
      try {
        let url = eventId ? `products?event_id=${eventId}` : 'products';
        const data = await get(url);
        if (data.length === 0) {
          alert('Não há produtos disponíveis para este evento.');
        } else {
          products.value = await Promise.all(
            data.map(async (product) => {
              const eventName = await fetchEventName(product.event_id);
              return { ...product, event_name: eventName };
            })
          );
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Ocorreu um erro ao carregar os produtos. Tente novamente mais tarde.');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchProducts(eventId);
    });

    const addToCart = async (product) => {
      if (!userStore.isAuthenticated && !volunteerStore.isAuthenticated) {
        router.push('/login');
      } else {
        isAddingToCart.value = true;

        // Aplica o aumento de 20% no preço quando há texto personalizado
        let finalPrice = product.price;
        if (personalizedText.value) {
          finalPrice = product.price * 1.2;  // Aumento de 20%
        }

        // Adiciona o texto personalizado e o preço final ao produto
        const productWithPersonalization = {
          ...product,
          personalizedText: personalizedText.value,
          price: finalPrice,  // Preço com o aumento de 20%
        };

        await cartStore.addToCart(productWithPersonalization);
        isAddingToCart.value = false;
      }
    };

    return {
      products,
      addToCart,
      loading,
      isAddingToCart,
      personalizedText,
    };
  },
};
</script>




<style scoped>
.products-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

/* Estilo para a área de personalização */
.customization {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.customization label {
  margin-right: 10px;
}

.customization input {
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 60%;
  max-width: 400px;
}

/* Carregamento de Produtos */
.loading {
  font-size: 1.2rem;
  color: #555;
}

.products-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.product-card {
  width: 250px;
  margin: 15px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #fff;
  text-align: left;
  padding: 15px;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.product-details {
  padding-top: 10px;
}

h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 10px;
}

.price {
  font-size: 1.1rem;
  color: #f44336;
  font-weight: bold;
}

.event-name {
  font-size: 1rem;
  color: #888;
}

/* Novo estilo para o texto personalizado */
.personalized-text {
  color: #fff; /* Cor do texto personalizada */
  background-color: #007bff; /* Cor de fundo do texto */
  padding: 0 5px;
  border-radius: 5px;
  font-weight: bold;
}

/* Botão de adicionar ao carrinho */
.add-to-cart-btn {
  margin-top: 15px;
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px;
  width: 100%;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-to-cart-btn:hover {
  background-color: #0056b3;
}

button:disabled {
  cursor: not-allowed;
  background-color: #ccc;
}

.no-products {
  color: #555;
  font-size: 1.2rem;
}
</style>
