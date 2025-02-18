<template>
  <div class="admin-dashboard">
    <h1>Dashboard Administrativo</h1>
    
    <!-- Gestão de Eventos -->
    <div class="event-management card">
      <h2>Eventos</h2>
      <button class="btn-primary" @click="addEvent">Adicionar Novo Evento</button>
      
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Data Início</th>
            <th>Localização</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in events" :key="event.id">
            <td>{{ event.name }}</td>
            <td>{{ formatDate(event.start_time) }}</td>
            <td>{{ event.location }}</td>
            <td>
              <button class="btn-edit" @click="editEvent(event.id)">Editar</button>
              <button class="btn-delete" @click="openModal(event.id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Gestão de Voluntários -->
    <div class="volunteer-management card">
      <h2>Voluntários</h2>
      <button class="btn-primary" @click="loadVolunteers">Carregar Voluntários</button>
      
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Idade</th>
            <th>Cargo</th>
            <th>Turno</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="volunteer in volunteers" :key="volunteer.id">
            <td>{{ volunteer.name }}</td>
            <td>{{ volunteer.email }}</td>
            <td>{{ volunteer.age }}</td>
            <td>{{ volunteer.preferredRole }}</td>
            <td>{{ volunteer.shift }}</td>
            <td class="status" :class="{ active: volunteer.isAuthenticated, inactive: !volunteer.isAuthenticated }">
              {{ volunteer.isAuthenticated ? 'Ativo' : 'Inativo' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Confirmação -->
    <ConfirmModal 
      :show="isModalOpen" 
      title="Confirmar Exclusão" 
      message="Tem certeza que deseja excluir este evento?" 
      @cancel="closeModal" 
      @confirm="deleteConfirmedEvent" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useEventStore } from "@/stores/useEventStore";
import { useVolunteerStore } from "@/stores/useVolunteerStore";
import { useRouter } from 'vue-router';
import ConfirmModal from '@/components/ConfirmModal.vue';

const eventStore = useEventStore();
const volunteerStore = useVolunteerStore();
const router = useRouter();
const events = ref([]);
const volunteers = ref([]);
const isModalOpen = ref(false);
const eventToDelete = ref(null);

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const fetchEvents = async () => {
  try {
    await eventStore.fetchEvents();
    events.value = eventStore.events;
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    alert('Erro ao carregar eventos');
  }
};

const loadVolunteers = async () => {
  try {
    await volunteerStore.loadVolunteers();
    volunteers.value = volunteerStore.volunteers;
  } catch (error) {
    console.error('Erro ao carregar voluntários:', error);
    alert('Erro ao carregar voluntários');
  }
};

onMounted(() => {
  fetchEvents();
  loadVolunteers();
});

const addEvent = () => {
  router.push({ name: 'create-event' });
};

const editEvent = async (eventId) => {
  const event = eventStore.getEventById(eventId);
  if (event) {
    router.push({ name: 'edit-event', params: { id: eventId } });
  } else {
    alert("Evento não encontrado!");
  }
};

const openModal = (eventId) => {
  eventToDelete.value = eventId;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  eventToDelete.value = null;
};

const deleteConfirmedEvent = async () => {
  if (eventToDelete.value) {
    try {
      await eventStore.deleteEvent(eventToDelete.value);
      fetchEvents();
      closeModal();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento');
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  background-color: #f4f4f4;
  min-height: 100vh;
  color:#000
}

.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

button {
  padding: 8px 12px;
  margin: 5px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-edit {
  background-color: #ffc107;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.status.active {
  color: green;
}

.status.inactive {
  color: red;
}

th, td {
  padding: 10px;
  text-align: left;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

table, th, td {
  border: 1px solid #ddd;
}
</style>
