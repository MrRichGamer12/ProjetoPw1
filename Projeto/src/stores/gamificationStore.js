import { defineStore } from 'pinia';

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    points: 0,        // Armazena a pontuação total
    badges: [],       // Lista de badges que o usuário ganhou
  }),
  actions: {
    // Função para adicionar pontos ao usuário/voluntário
    addPoints(points) {
      this.points += points;  // Incrementa os pontos
    },
    
    // Função para adicionar um badge
    addBadge(badge) {
      if (!this.badges.includes(badge)) {
        this.badges.push(badge);  // Adiciona um novo badge
      }
    },

    // Função para verificar e completar uma tarefa
    checkTasksCompleted(task) {
      if (task === 'participarRecepcao') {
        this.addPoints(20);  // Exemplo: Participar da recepção dá 20 pontos
        this.addBadge('Recepcionista Expert');
      }
      if (task === 'organizarSessao') {
        this.addPoints(30);  // Exemplo: Organizar sessões dá 30 pontos
        this.addBadge('Organizador de Sessões');
      }
      if (task === 'assistirEvento') {
        this.addPoints(10);  // Exemplo: Assistir evento dá 10 pontos
        this.addBadge('Assistente de Evento');
      }
    },

    // Resetar os pontos e badges (exemplo de reinicialização, se necessário)
    resetGamification() {
      this.points = 0;
      this.badges = [];
    }
  },
  getters: {
    totalPoints: (state) => state.points, // Acessa 'points' através do getter
    hasBadge: (state) => (badgeName) => state.badges.includes(badgeName), // Verifica se o usuário tem um badge específico
  }
});
