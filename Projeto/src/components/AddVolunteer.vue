<template>
  <div class="add-volunteer">
    <h2>Inscrever-se como Voluntário</h2>
    <form @submit.prevent="handleSubmit" class="volunteer-form">
      <div class="form-group">
        <label for="name">Nome:</label>
        <input type="text" id="name" v-model="name" required />
      </div>

      <div class="form-group">
        <label for="age">Idade:</label>
        <input type="number" id="age" v-model="age" required />
      </div>

      <div class="form-group">
        <label for="email">Contato:</label>
        <input type="text" id="email" v-model="email" required />
      </div>

      <div class="form-group">
        <label for="experience">Experiência prévia:</label>
        <textarea id="experience" v-model="experience"></textarea>
      </div>

      <div class="form-group">
        <label for="role">Função preferencial:</label>
        <select id="role" v-model="preferredRole">
          <option value="rececao">Receção</option>
          <option value="apoio">Apoio nos Bastidores</option>
          <option value="assistencia">Assistência no Palco</option>
        </select>
      </div>

      <div class="form-group">
        <label for="shift">Turno preferido:</label>
        <select id="shift" v-model="shift">
          <option value="manha">Manhã</option>
          <option value="tarde">Tarde</option>
          <option value="noite">Noite</option>
        </select>
      </div>

      <div class="form-group">
        <label for="event">Selecione o evento:</label>
        <select id="event" v-model="eventId" required>
          <!-- Acessando os dados de eventos através de eventsData.value -->
          <option v-for="event in eventsData" :key="event.id" :value="event.id">
            {{ event.name }}
          </option>
        </select>
      </div>

      <button type="submit" :disabled="isSubmitting" class="submit-btn">Inscrever</button>

      <p v-if="message" :class="{ success: successMessage, error: !successMessage }" class="message">
        {{ message }}
      </p>
    </form>
  </div>
</template>

<script>
import { useVolunteerStore } from "@/stores/useVolunteerStore"; // Importe a store dos voluntários
import { ref, onMounted } from 'vue';  // Importando o hook correto
import { get } from "@/api/api";

export default {
  setup() {
    // Definir as variáveis usando `ref` para torná-las reativas
    const name = ref("");
    const age = ref("");
    const email = ref("");
    const experience = ref("");
    const preferredRole = ref("rececao");
    const shift = ref("manha");
    const eventId = ref("");
    const eventsData = ref([]);  // Guardar os dados dos eventos carregados
    const message = ref("");
    const successMessage = ref(false);
    const isSubmitting = ref(false);

    // Função para carregar os eventos
    const loadEvents = async () => {
      try {
        const response = await get("events");  // Supondo que "get" é sua função de requisição
        eventsData.value = response;  // Atribuindo os dados da API ao ref
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    };

    // Chama a função para carregar os eventos quando o componente for montado
    onMounted(() => {
      loadEvents();
    });

    // Função para submeter o formulário
    const handleSubmit = async () => {
      if (age.value < 18 || age.value > 120) {
        message.value = "Idade inválida. A idade deve estar entre 18 e 120 anos.";
        successMessage.value = false;
        return;
      }
      isSubmitting.value = true;
      const volunteerStore = useVolunteerStore();

      const result = await volunteerStore.registerVolunteer(
        name.value,
        age.value,
        email.value,
        experience.value,
        preferredRole.value,
        shift.value,
        eventId.value
      );

      message.value = result.message;
      successMessage.value = result.success;

      if (result.success) {
        name.value = "";
        age.value = "";
        email.value = "";
        experience.value = "";
        preferredRole.value = "rececao";
        shift.value = "manha";
        eventId.value = "";
      }

      isSubmitting.value = false;
    };

    // Retorna os dados reativos para o template
    return {
      name,
      age,
      email,
      experience,
      preferredRole,
      shift,
      eventId,
      eventsData,
      message,
      successMessage,
      isSubmitting,
      handleSubmit
    };
  }
};
</script>

<style scoped>
/* Estilos do formulário */
.add-volunteer {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.volunteer-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-size: 1rem;
  margin-bottom: 5px;
  color: #444;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  margin-top: 5px;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

button {
  background: linear-gradient(135deg, #ff7eb3, #ff758c);
  border: none;
  padding: 12px 20px;
  color: white;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s ease;
  margin-top: 20px;
}

button:disabled {
  background: #d1d1d1;
  cursor: not-allowed;
}

button:hover {
  background: linear-gradient(135deg, #ff758c, #ff7eb3);
  transform: scale(1.05);
}

.message {
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>
