<template>
  <div v-if="currentUser" class="profile-container">
    <div class="profile-card">
      <!-- Título de acordo com o tipo de usuário -->
      <h2 class="profile-title">
        Perfil de
        {{ currentUser.role === 'user' ? 'Usuário' : currentUser.role === "volunteer" ? 'Voluntário' : currentUser.role
          === "admin" ? 'Admin' : '' }}:
        {{ currentUser.name }}
      </h2>

      <!-- Informações gerais -->
      <p class="profile-info"><strong>Email:</strong> {{ currentUser.email }}</p>
      <p class="profile-info"><strong>Função:</strong>
        {{ currentUser.role === 'user' ? currentUser.role : currentUser.role === 'admin' ? currentUser.role :
          currentUser.preferredRole }}
      </p>

      <!-- Seção para Voluntários: Exibe o evento associado -->
      <div v-if="currentUser.role === 'volunteer' && volunteerEvent && gamificationStore">
  <p class="profile-info"><strong>Evento:</strong> {{ volunteerEvent.name }}</p>
  <p class="profile-info"><strong>Início:</strong> {{ formattedStartDate }}</p>
  <p class="profile-info"><strong>Fim:</strong> {{ formattedEndDate }}</p>
  <p class="profile-info"><strong>Turno:</strong> {{ currentUser.shift }}</p>

  <!-- Seção de Gamificação -->
  <p class="profile-info"><strong>Pontos:</strong> {{ gamificationStore.totalPoints }}</p>
  <p class="profile-info"><strong>Badges:</strong>
    <span v-for="badge in gamificationStore.badges" :key="badge" class="badge">{{ badge }}</span>
  </p>

  <p class="profile-info"><strong>Nível:</strong> {{ userLevel }}</p>

  <progress :value="gamificationStore.totalPoints" :max="nextLevelPoints"></progress>
  <p>Próximo nível em {{ nextLevelPoints - gamificationStore.totalPoints }} pontos</p>

  <!-- Botão de Resgatar Recompensa -->
  <button v-if="canRedeemReward" @click="redeemReward" class="reward-btn">Resgatar Recompensa</button>

  <!-- Mensagem de recompensa -->
  <div v-if="rewardMessage" class="reward-message">{{ rewardMessage }}</div>
</div>




      <div v-if="currentUser" class="agenda-container agenda-text">
        <h3>Agenda Personalizada</h3>

        <div v-if="userAgenda.length > 0" class="agenda-list">
          <div v-for="agendaItem in userAgenda" :key="agendaItem.id" class="agenda-item">

            <!-- Verificar se o evento foi encontrado -->
            <div v-if="agendaItem.eventId">
              <p v-if="getEventById(agendaItem.eventId)?.name">
                <strong>{{ getEventById(agendaItem.eventId)?.name }}</strong>
              </p>
              <p v-if="getEventById(agendaItem.eventId)?.start_time">
                {{ new Date(getEventById(agendaItem.eventId)?.start_time).toLocaleString() }}
              </p>
            </div>

            <!-- Mostrar o tipo de ticket, se o evento foi encontrado -->
            <div v-if="agendaItem.ticketId">
              <p v-if="getEventById(agendaItem.eventId)?.ticket_classes">
                <strong>Ticket:</strong> {{ getTicketType(agendaItem.ticketId, getEventById(agendaItem.eventId)) }}
              </p>
            </div>

            <!-- Remover evento da agenda -->
            <button @click="removeFromAgenda(agendaItem.id)" class="remove-btn">Remover</button>
          </div>
        </div>

        <div v-else>
          <p>Você ainda não adicionou palestras ou sessões à sua agenda.</p>
        </div>
      </div>

      <!-- Área de edição do perfil -->
      <div v-if="isEditing" class="edit-container">
        <input v-model="editableUser.name" placeholder="Nome" class="input-field" />
        <input v-model="editableUser.email" placeholder="Email" class="input-field" />

        <button @click="saveUserProfile" class="save-btn">Salvar Alterações</button>
        <button @click="cancelEdit" class="cancel-btn">Cancelar</button>
      </div>

      <!-- Botões de ação -->
      <div class="button-container">
        <!-- Exibe o botão de editar perfil -->
        <button v-if="!isEditing" @click="editUserProfile" class="edit-btn">Editar Perfil</button>
        <button @click="logout" class="logout-btn">Sair</button>
        <button @click="deleteAccount" class="delete-btn">Excluir Conta</button>
      </div>
    </div>
  </div>

  <!-- Mensagem para usuário não logado -->
  <div v-else class="not-logged">
    <p>Você não está logado.</p>
  </div>
</template>


<script>
import { useGamificationStore } from '@/stores/gamificationStore';
import { useUserStore } from '@/stores/useUserStore';
import { useVolunteerStore } from '@/stores/useVolunteerStore';
import { useEventStore } from '@/stores/useEventStore';
import { ref, computed, reactive, watchEffect } from 'vue';

export default {
  setup() {
    const userStore = useUserStore();
    const volunteerStore = useVolunteerStore();
    const eventStore = useEventStore();
    const gamificationStore = useGamificationStore();  // Adiciona a gamificationStore

    const currentUser = computed(() => userStore.user || volunteerStore.volunteer || null);
    const isEditing = ref(false);
    const editableUser = reactive({ ...userStore.user });
    const userAgenda = ref([]);

    // Carregar a agenda do usuário diretamente do objeto user ou volunteer
    const loadAgenda = () => {
      if (currentUser.value) {
        const agenda = currentUser.value.agenda || [];
        userAgenda.value = agenda;
      }
    };

    // Função para obter o evento por ID
    const getEventById = (eventId) => {
      const event = eventStore.getEventById(eventId);
      if (!event) {
        console.warn("Nenhum evento encontrado para o ID: " + eventId); // Log para ajudar no diagnóstico
      }
      return event || {}; // Retorna um objeto vazio caso o evento não seja encontrado
    };

    // Função para obter o tipo de ticket associado ao evento
    const getTicketType = (ticketId, event) => {
      const ticket = event.ticket_classes.find(ticket => ticket.id === ticketId);
      return ticket ? ticket.name : 'Ticket Não Encontrado';
    };
    watchEffect(() => {
      if (!eventStore.events.length) {
        eventStore.fetchEvents();
      }
      if (currentUser.value) {
        loadAgenda();
      }
    });
    const volunteerEvent = computed(() => {
      if (volunteerStore.volunteer && eventStore.events.length > 0) {

        return eventStore.events.find(event => event.id == volunteerStore.volunteer.eventId) || null;
      }
      return null;
    });


    const formatDateTime = (date) => {
      const parsedDate = new Date(date);
      return parsedDate.toLocaleString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formattedStartDate = computed(() => volunteerEvent.value.start_time ? formatDateTime(volunteerEvent.value.start_time) : 'Data não disponível');
    const formattedEndDate = computed(() => volunteerEvent.value.end_time ? formatDateTime(volunteerEvent.value.end_time) : 'Data não disponível');

    const logout = () => (userStore.user ? userStore.logout() : volunteerStore.logout());
    const editUserProfile = () => { Object.assign(editableUser, userStore.user); isEditing.value = true; };
    const cancelEdit = () => { Object.assign(editableUser, userStore.user); isEditing.value = false; };

    const saveUserProfile = async () => {
      if (!editableUser.name || !editableUser.email.includes('@')) {
        alert('Por favor, preencha os campos corretamente.');
        return;
      }
      await userStore.updateUserProfile(editableUser);
      isEditing.value = false;
    };

    const deleteAccount = async () => {
      if (confirm('Tem certeza que deseja excluir sua conta?')) {
        await (userStore.user ? userStore.deleteUser() : volunteerStore.deleteVolunteer());
        alert('Conta excluída com sucesso.');
      }
    };

    const levelThresholds = [0, 50, 100, 200, 500];
    const levelNames = ["Iniciante", "Voluntário Júnior", "Voluntário Sênior", "Líder", "Mestre"];

    const userLevel = computed(() => {
      const points = gamificationStore.totalPoints;  // Usando a store de gamificação
      let level = "Iniciante";
      for (let i = 0; i < levelThresholds.length; i++) {
        if (points >= levelThresholds[i]) {
          level = levelNames[i];
        }
      }
      return level;
    });

    const nextLevelPoints = computed(() => {
      const points = gamificationStore.totalPoints;
      return levelThresholds.find(p => p > points) || points;
    });

    const canRedeemReward = computed(() => gamificationStore.totalPoints >= 100);
    const rewardMessage = ref("");

    const redeemReward = () => {
      if (gamificationStore.totalPoints >= 100) {
        gamificationStore.addPoints(-100);  // Reduz 100 pontos ao resgatar
        rewardMessage.value = "Recompensa resgatada! 🎉";
      } else {
        rewardMessage.value = "Você precisa de pelo menos 100 pontos para resgatar uma recompensa.";
      }
    };
    const totalPoints = computed(() => {
      if (!currentUser.value) {
        console.warn('currentUser está indefinido ou nulo');
        return 0; // Retorna 0 como valor padrão
      }

      return currentUser.value.totalPoints || 0; // Retorna 0 se totalPoints estiver indefinido
    });

    const checkEventReminders = () => {
      const now = new Date();

      // Loop por todos os eventos na agenda
      userAgenda.value.forEach(event => {
        const eventDate = new Date(event.date + ' ' + event.time); // Concatene data e hora
        const timeDiff = eventDate - now;

        // Se o evento é em breve (exemplo: 30 minutos antes)
        if (timeDiff > 0 && timeDiff <= 30 * 60 * 1000) {
          // Verifica se o usuário já foi notificado
          if (!event.notified) {
            // Envia notificação
            if (Notification.permission === "granted") {
              new Notification(`Lembrete: ${event.name}`, {
                body: `O evento ${event.name} começa em breve!`,
                icon: 'https://your-app-icon.com/icon.png'
              });

              // Marca como notificado
              event.notified = true;
              saveAgenda(); // Salva o evento atualizado
            }
          }
        }
      });
    };

    // Solicitar permissão para notificações
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Chama a função de verificação de lembretes periodicamente (por exemplo, a cada minuto)
    setInterval(checkEventReminders, 60 * 1000);
    async function loadEvents() {
      try {
        await eventStore.fetchEvents(); // Aguarda até os eventos serem carregados
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    }

    // Chame o método de carregamento de eventos
    loadEvents();


    return {
      currentUser,
      isEditing,
      editableUser,
      editUserProfile,
      cancelEdit,
      saveUserProfile,
      logout,
      deleteAccount,
      volunteerEvent,
      formattedStartDate,
      formattedEndDate,
      userLevel,
      nextLevelPoints,
      canRedeemReward,
      redeemReward,
      rewardMessage,
      currentUser,
      userAgenda,
      getEventById,
      getTicketType,
      totalPoints,
      gamificationStore,
    };
  },
};
</script>

<style scoped>
.badge {
  display: inline-block;
  margin: 5px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border-radius: 3px;
  font-size: 12px;
}

.reward-btn {
  background: #4CAF50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s ease;
  margin-top: 10px;
}

.reward-btn:hover {
  background: #45a049;
}

.reward-message {
  margin-top: 10px;
  font-size: 16px;
  color: #4CAF50;
  font-weight: bold;
}

.profile-info {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f4f4f4, #ffffff);
}

.profile-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 400px;
}

.profile-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f4f4f4, #ffffff);
}

.profile-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 400px;
}

.profile-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.profile-info {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.edit-container {
  margin-top: 15px;
}

.input-field {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.button-container {
  margin-top: 20px;
}

button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s ease;
  margin-bottom: 10px;
}

.edit-btn {
  background: #4CAF50;
  color: white;
}

.edit-btn:hover {
  background: #45a049;
}

.logout-btn {
  background: #f39c12;
  color: white;
}

.logout-btn:hover {
  background: #e67e22;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
}

.save-btn {
  background: #2980b9;
  color: white;
}

.save-btn:hover {
  background: #1c6690;
}

.cancel-btn {
  background: #7f8c8d;
  color: white;
}

.cancel-btn:hover {
  background: #626d6d;
}

.not-logged {
  text-align: center;
  font-size: 18px;
  color: #555;
}

.reward-btn {
  background: #4CAF50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s ease;
  margin-top: 10px;
}

.reward-btn:hover {
  background: #45a049;
}

.reward-message {
  margin-top: 10px;
  font-size: 16px;
  color: #4CAF50;
  font-weight: bold;
}

.agenda-text {
  color: black;
  /* Alterando a cor do texto da agenda para preto */
}
</style>
