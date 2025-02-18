<template>
  <div v-if="event" :style="{ backgroundImage: event.image ? `url(${event.image})` : 'none' }" class="event-container">
    <div class="event-content">
      <h1>{{ event.name }}</h1>
      <p class="event-description">{{ event.description }}</p>
      <p><strong>Local:</strong> {{ event.location }}</p>
      <p><strong>Data:</strong> {{ formatDate(event.start_time) }} - {{ formatDate(event.end_time) }}</p>

      <h3>Palestrantes</h3>
      <ul v-if="event.speakers && event.speakers.length">
        <li v-for="(speaker, index) in event.speakers" :key="speaker.name">
          <div v-if="editingSpeakerIndex !== index">
            <router-link :to="`/event/${event.id}/speaker/${encodeURIComponent(speaker.name)}`" class="speaker-link">
              <strong>{{ speaker.name }}</strong> - {{ speaker.role }}
            </router-link>
            <button v-if="isAdmin" @click="startEditingSpeaker(index)" class="edit-button">Editar</button>
            <button v-if="isAdmin" @click="confirmDelete('speaker', index)" class="delete-button">Excluir</button>
          </div>

          <div v-else>
            <input v-model="speaker.name" placeholder="Nome do Palestrante" class="input-field" />
            <input v-model="speaker.role" placeholder="Cargo do Palestrante" class="input-field" />
            <button @click="saveSpeaker(index)" class="save-button">Salvar</button>
            <button @click="cancelEditingSpeaker()" class="cancel-button">Cancelar</button>
          </div>
        </li>
      </ul>
      <p v-else class="no-speakers">Nenhum palestrante cadastrado.</p>

      <h3>Tópicos</h3>
      <ul v-if="event.topics && event.topics.length">
        <li v-for="(topic, index) in event.topics" :key="index">
          {{ topic }}
          <button v-if="isAdmin" @click="confirmDelete('topic', index)" class="delete-button">Excluir</button>
        </li>
      </ul>
      <p v-else class="no-topics">Nenhum tópico cadastrado.</p>

      <div v-if="isAdmin">
        <h4>Adicionar Novo Palestrante</h4>
        <input v-model="newSpeaker.name" placeholder="Nome do Palestrante" class="input-field" />
        <input v-model="newSpeaker.role" placeholder="Cargo do Palestrante" class="input-field" />
        <button @click="addSpeaker" :disabled="!newSpeaker.name || !newSpeaker.role" class="add-button">Adicionar
          Palestrante</button>
      </div>

      <div v-if="isAdmin">
        <h4>Adicionar Novo Tópico</h4>
        <input v-model="newTopic" placeholder="Nome do Tópico" class="input-field" />
        <button @click="addTopic" :disabled="!newTopic" class="add-button">Adicionar Tópico</button>
      </div>
      <router-link :to="`/event/${eventId}/produtos`" class="button view-products-button">
        Ver Produtos
      </router-link>
      <!-- Seção de compra de ingressos -->
      <div v-if="isAuthenticated || isVolunteer">
        <h3>Comprar Bilhete</h3>
        <select v-model="selectedTicket" @change="showTicketBenefits" class="ticket-select">
          <option v-for="ticket in event.ticket_classes" :key="ticket.name" :value="ticket.name">
            {{ ticket.name }} - ${{ ticket.price }} ({{ ticket.quantity }} disponíveis)
          </option>
        </select>
        <!-- Se for voluntário e está tentando comprar para o evento que está gerenciando -->
        <div v-if="isVolunteer && event && event.id == volunteerStore.volunteer?.eventId">
          <p class="alert-message">Você não pode comprar bilhetes para o evento que está gerenciando.</p>
        </div>

        <!-- Botão de compra de bilhete -->
        <div v-else>
          <button @click="buyTicket" :disabled="!selectedTicket" class="buy-button">Comprar</button>
        </div>
        <!-- Exibir benefícios do bilhete -->
        <div v-if="selectedTicketBenefits.length">
          <h4>Benefícios do Bilhete Selecionado:</h4>
          <ul class="benefits-list">
            <li v-for="benefit in selectedTicketBenefits" :key="benefit" class="benefit-item">{{ benefit }}</li>
          </ul>
        </div>
      </div>

      <!-- Exibição de botões de gerenciamento de tickets para admin -->
      <div v-if="isAdmin">
        <h3>Gestão de Tickets</h3>
        <div v-for="ticket in event.ticket_classes" :key="ticket.name" class="ticket-management">
          <span>{{ ticket.name }}</span>
          <input type="number" v-model.number="ticket.quantity" min="0" class="ticket-quantity"
            @change="updateTicketQuantity(ticket.name, ticket.quantity)" />
          <button class="update-button">Atualizar</button>
        </div>

        <button @click="deleteEvent" class="delete-event-button">Eliminar Evento</button>
      </div>
      <ConfirmModal :show="showModal" :title="modalTitle" :message="modalMessage" @confirm="handleConfirm"
        @cancel="closeModal" />
    </div>
  </div>
  <p v-else>Carregando evento...</p>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useEventStore } from "@/stores/useEventStore";
import { useUserStore } from "@/stores/useUserStore";
import { useVolunteerStore } from '@/stores/useVolunteerStore';
import { ref, computed, onMounted, watch } from "vue";
import ConfirmModal from "@/components/ConfirmModal.vue"; // Importa a modal

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const userStore = useUserStore();
const volunteerStore = useVolunteerStore();
const eventId = parseInt(route.params.id);  // Ou outra forma de pegar o ID
const event = ref(null);
const isAuthenticated = computed(() => userStore.isAuthenticated);
const isAdmin = computed(() => userStore.user?.role === "admin");
const isVolunteer = computed(() => volunteerStore.isAuthenticated);
const selectedTicket = ref("");
const selectedTicketBenefits = ref([]);
const newSpeaker = ref({ name: "", role: "" });
const newTopic = ref("");
const editingSpeakerIndex = ref(null);
const showModal = ref(false);
const modalTitle = ref("");
const modalMessage = ref("");
const deleteType = ref(null);
const deleteIndex = ref(null);

watch(() => event.value, (newValue) => {
  if (newValue) {
    // console.log("Evento carregado:", newValue); // Removido para produção
  } else {
    // console.log("Aguardando o evento..."); // Removido para produção
  }
});

// Formatar data
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

onMounted(async () => {
  try {
    // Carrega os eventos da store
    await eventStore.fetchEvents();

    // Verifica se os eventos foram carregados corretamente
    if (!eventStore.events || eventStore.events.length === 0) {
      console.warn("Nenhum evento encontrado após o carregamento.");
      router.push("/404");  // Caso a lista de eventos esteja vazia
      return;
    }

    // Obtém o evento específico com base no eventId
    event.value = eventStore.getEventById(eventId);

    // Caso o evento não seja encontrado, redireciona para uma página de erro
    if (!event.value) {
      console.warn(`Evento com ID ${eventId} não encontrado.`);
      router.push("/404");
    }
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
    router.push("/404");  // Caso ocorra um erro durante o carregamento
  }
});


const deleteTopic = async (topicIndex) => {
  // Confirmação para excluir o tópico

  // Chama o método async da store
  await eventStore.deleteTopic(eventId, topicIndex); // Chama a função da store para deletar o tópico
  // Se necessário, você pode atualizar a lista de tópicos localmente após a exclusão.
  event.value.topics.splice(topicIndex, 1);

};

const deleteSpeaker = (index) => {
  event.value.speakers.splice(index, 1); // Remove o palestrante localmente
  eventStore.updateEvent(eventId, { speakers: event.value.speakers });
};

const addSpeaker = () => {
  if (!newSpeaker.value.name || !newSpeaker.value.role) {
    alert('Preencha todos os campos!');
    return;
  }
  event.value.speakers.push({ ...newSpeaker.value });
  eventStore.updateEvent(eventId, { speakers: event.value.speakers });
  newSpeaker.value = { name: "", role: "" };
};

const addTopic = () => {
  if (!newTopic.value) {
    alert('Preencha o nome do tópico!');
    return;
  }
  event.value.topics.push(newTopic.value);
  eventStore.updateEvent(eventId, { topics: event.value.topics });
  newTopic.value = "";
};

const startEditingSpeaker = (index) => {
  editingSpeakerIndex.value = index;
};

const saveSpeaker = async (index) => {
  await eventStore.updateEvent(eventId, { speakers: event.value.speakers });
  alert("Palestrante atualizado!");
  editingSpeakerIndex.value = null;
};

const cancelEditingSpeaker = () => {
  editingSpeakerIndex.value = null;
};

const deleteEvent = async () => {
  if (confirm("Tem certeza que deseja excluir este evento?")) {
    await eventStore.deleteEvent(eventId);
    router.push('/admin'); // Redireciona para a dashboard do administrador
  }
};

const buyTicket = () => {
  if (!isAuthenticated.value && !isVolunteer.value) {
    alert("Você precisa estar logado para comprar bilhetes!");
    return;
  }

  // Se o usuário for um voluntário e estiver gerenciando o evento, bloquear a compra
  if (isVolunteer.value && event.value.id === volunteerStore.volunteer?.event_id) {
    alert("Você não pode comprar bilhetes para o evento que está gerenciando.");
    return;
  }

  // Verifique se o ticket foi selecionado
  if (!selectedTicket.value) {
    alert("Por favor, selecione um bilhete.");
    return;
  }
  const ticket = event.value.ticket_classes.find(t => t.name === selectedTicket.value);

  // Determina se o utilizador é um usuário ou um voluntário e chama a função apropriada
  if (isAuthenticated.value) {
    userStore.buyTicket(event.value.id, ticket.id);
  } else if (isVolunteer.value) {
    volunteerStore.buyTicket(event.value.id,  ticket.id);
  } else {
    alert("Erro ao processar a compra. Tente novamente.");
  }
};


function showTicketBenefits() {
  // Acesse o valor do Ref, ou seja, use `event.value` para pegar o evento real.
  const eventData = event.value;

  if (eventData && eventData.ticket_classes) {
    const ticket = eventData.ticket_classes.find(t => t.name === selectedTicket.value);

    if (ticket) {
      selectedTicketBenefits.value = ticket.benefits;
    }
  }
}


const updateTicketQuantity = async (ticketName, quantity) => {
  // Verifique se o evento está disponível
  if (!event.value || !event.value.ticket_classes) {
    console.error("Evento ou ticket_classes não encontrados!");
    return;
  }

  // Encontre o ticket correspondente ao nome do ticket
  const ticket = event.value.ticket_classes.find(t => t.name === ticketName);
  if (!ticket) {
    console.error(`Ticket com o nome "${ticketName}" não encontrado.`);
    return;
  }

  // Verifique se a quantidade fornecida é válida
  if (isNaN(quantity) || quantity < 0) {
    console.error("Quantidade inválida fornecida.");
    return;
  }

  // Chame a função da store para atualizar a quantidade
  try {
    // Chame a função updateTicketQuantity da store
    await eventStore.updateTicketQuantity(eventId, ticketName, quantity);
  } catch (error) {
    console.error("Erro ao tentar atualizar a quantidade do ticket:", error);
  }
};

const confirmDelete = (type, index) => {
  deleteType.value = type;
  deleteIndex.value = index;

  if (type === "topic") {
    modalTitle.value = "Excluir Tópico";
    modalMessage.value = "Tem certeza que deseja excluir este tópico?";
  } else if (type === "speaker") {
    modalTitle.value = "Excluir Palestrante";
    modalMessage.value = "Tem certeza que deseja excluir este palestrante?";
  }

  showModal.value = true;
};

const handleConfirm = async () => {
  showModal.value = false;

  if (deleteType.value === "topic") {
    try {
      await eventStore.deleteTopic(eventId, deleteIndex.value);
      event.value.topics.splice(deleteIndex.value, 1);
    } catch (error) {
      alert("Erro ao excluir o tópico.");
    }
  } else if (deleteType.value === "speaker") {
    try {
      event.value.speakers.splice(deleteIndex.value, 1);
      await eventStore.updateEvent(eventId, { speakers: event.value.speakers });
    } catch (error) {
      alert("Erro ao excluir o palestrante.");
    }
  }
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<style scoped>
.event-container {
  background-size: cover;
  background-position: center;
  padding: 30px;
  color: white;
  border-radius: 15px;
  min-height: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

.event-content {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
}

.event-description {
  font-size: 1.1em;
  margin: 10px 0;
}

h1 {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 15px;
}

h3 {
  font-size: 1.5em;
  margin-top: 25px;
  color: #f39c12;
}

button {
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 5px;
  border: none;
  transition: background-color 0.3s, transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}

button:disabled {
  cursor: not-allowed;
  background-color: #d3d3d3;
}

.view-products-button {
  background-color: #27ae60;
  color: white;
  font-size: 16px;
}

.buy-button {
  background-color: #3498db;
  color: white;
}

.add-button,
.save-button,
.cancel-button {
  background-color: #f39c12;
  color: white;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.delete-event-button {
  background-color: #e74c3c;
  color: white;
  margin-top: 20px;
}

.speaker-link {
  color: #f39c12;
  text-decoration: none;
}

.ticket-select {
  padding: 10px;
  font-size: 16px;
  margin-bottom: 15px;
}

.benefits-list {
  margin-top: 10px;
}

.benefit-item {
  font-size: 1.1em;
  margin: 5px 0;
}

.ticket-management {
  margin-bottom: 15px;
}

.ticket-quantity {
  width: 60px;
  margin-right: 10px;
}

.no-speakers,
.no-topics {
  font-size: 1.2em;
  color: #bdc3c7;
}

.ticket-select {
  padding: 10px;
  font-size: 16px;
  margin-bottom: 15px;
  border: 2px solid #3498db;
  /* Borda azul para destacar */
  background-color: #fff;
  /* Fundo branco */
  color: #333;
  /* Cor do texto */
  border-radius: 5px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.ticket-select:focus {
  border-color: #f39c12;
  /* Cor da borda ao focar (quando o usuário clica no seletor) */
  background-color: #f4f4f4;
  /* Mudança de fundo quando focado */
}

.ticket-select option {
  font-size: 16px;
  padding: 5px 10px;
}

.ticket-quantity {
  width: 90px;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 2px solid #3498db;
  /* Borda azul */
  background-color: #fff;
  /* Fundo branco */
  color: #333;
  /* Cor do texto */
  transition: border-color 0.3s ease, background-color 0.3s ease;
  text-align: center;
}

.ticket-quantity:focus {
  border-color: #f39c12;
  /* Mudança na cor da borda ao focar */
  background-color: #f4f4f4;
  /* Cor de fundo ao focar */
}

.input-field {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 2px solid #ccc;
  background-color: #f9f9f9;
  font-size: 14px;
  color: #333;
}

.input-field:focus {
  border-color: #e74c3c;
  /* Altera a cor da borda ao focar */
  outline: none;
  /* Remove o contorno padrão */
  background-color: #e9f5e9;
  /* Altera o fundo quando está em foco */
}

.view-products-button {
  background-color: #e74c3c;
  /* Cor de fundo verde */
  color: white;
  /* Texto branco */
  font-size: 16px;
  /* Tamanho da fonte */
  padding: 10px 20px;
  /* Padding para o botão */
  border-radius: 5px;
  /* Bordas arredondadas */
  transition: background-color 0.3s, transform 0.2s;
  /* Efeitos de transição */
  margin-top: 20px;
}

.view-products-button:hover {
  background-color: #e74c3c;
  /* Cor de fundo quando o botão for hover */
  transform: scale(1.05);
  /* Leve aumento de tamanho ao passar o mouse */
  margin-top: 20px;
}
</style>