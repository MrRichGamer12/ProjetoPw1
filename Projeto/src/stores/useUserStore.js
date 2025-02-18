import { defineStore } from 'pinia';
import { get, post, del } from '@/api/api'; // Supondo que a função `del` seja um método de API para exclusão
import { useCartStore } from '@/stores/useCartStore';
import { useEventStore } from "@/stores/useEventStore";


export const useUserStore = defineStore('user', {
  state: () => ({
    user: null, // Dados do utilizador autenticado
    users: []   // Lista de usuários
  }),
  getters: {
    isAuthenticated: (state) => !!state.user, // Verifica se há um utilizador autenticado
    isAdmin: (state) => state.user?.role === 'admin', // Verifica se o utilizador é admin
  },
  actions: {
    async login(email, password) {
      try {
        const users = await get('users'); // Busca os utilizadores da API
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
          this.user = user;
          localStorage.setItem('user', JSON.stringify(user)); // Persistência no localStorage

          // Após o login, carregue o carrinho do utilizador (a chave será 'cart_<user.id>')
          const cartStore = useCartStore();
          cartStore.loadCartFromStorage();

          return { success: true, message: 'Login bem-sucedido!' };
        } else {
          return { success: false, message: 'Credenciais inválidas!' };
        }
      } catch (error) {
        return { success: false, message: 'Erro ao autenticar. Tente novamente.' };
      }
    },

    async register(name, email, password) {
      try {
        const newId = this.users.length + 1; // Calcula o próximo ID
        const newUser = { id: newId, name, email, password, role: 'user' };
        this.users.push(newUser); // Adiciona o novo usuário na lista
        await post('users', newUser); // Envia os dados para a API
        return { success: true, message: 'Registro bem-sucedido! Agora faça login.' };
      } catch (error) {
        return { success: false, message: 'Erro ao registrar. Tente novamente.' };
      }
    },

    logout() {
      this.user = null; // Limpa o usuário da store
      localStorage.removeItem('user'); // Remove do localStorage

      // Limpa o carrinho individual (a chave utilizada será removida quando loadCartFromStorage for chamada com user nulo)
      const cartStore = useCartStore();
      cartStore.clearCart();
    },

    loadUserFromStorage() {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        // Carrega o carrinho individual para o usuário atual
        const cartStore = useCartStore();
        cartStore.loadCartFromStorage();
      }
    },

    // Ação para excluir o usuário
    async deleteUser() {
      try {
        if (this.user) {
          await del(`users/${this.user.id}`); // Remove o usuário na API
          this.user = null;
          localStorage.removeItem('user');

          // Limpa o carrinho individual também
          const cartStore = useCartStore();
          cartStore.clearCart();

          return { success: true, message: 'Conta excluída com sucesso.' };
        } else {
          return { success: false, message: 'Usuário não encontrado.' };
        }
      } catch (error) {
        return { success: false, message: 'Erro ao excluir conta. Tente novamente.' };
      }
    },
    async buyTicket(eventId, ticketId) {
      const eventStore = useEventStore();

      if (!this.user) {
        console.log("Usuário não autenticado.");
        return { success: false, message: "Usuário não autenticado." };
      }

      // Obtém o evento através da eventStore
      const event = eventStore.getEventById(eventId);
      if (!event) {
        console.log("Evento não encontrado.");
        return { success: false, message: "Evento não encontrado." };
      }

      // Desfaz o Proxy para acessar diretamente os dados
      const eventData = JSON.parse(JSON.stringify(event));


      // Verifica se ticket_classes é um array
      if (!Array.isArray(eventData.ticket_classes)) {
        console.log("O campo ticket_classes não é um array.");
        return { success: false, message: "Erro ao buscar tickets." };
      }

      // Encontra o ticket pelo ticketId
      const ticket = eventData.ticket_classes.find(t => t.id == String(ticketId)); // Garantir que a comparação seja entre strings
      if (!ticket) {
        console.log("Bilhete não encontrado para o ticketId:", ticketId);
        return { success: false, message: "Bilhete não encontrado." };
      }

      // Verifica se há tickets disponíveis
      if (ticket.quantity <= 0) {
        console.log("Bilhetes esgotados.");
        return { success: false, message: "Bilhetes esgotados." };
      }

      // Diminui a quantidade do ticket
      ticket.quantity--;

      try {
        // Atualiza a quantidade do ticket na store
        await eventStore.updateTicketQuantity(eventId, ticket.name, ticket.quantity);
      } catch (error) {
        console.log("Erro ao atualizar a quantidade do ticket:", error);
        return { success: false, message: "Erro ao atualizar a quantidade do ticket." };
      }

      // Adiciona o ticket à agenda do usuário
      if (!this.user.agenda) {
        this.user.agenda = [];
      }
      const ticketEntry = { eventId, ticketId };
      this.user.agenda.push(ticketEntry);

      try {
        // Atualiza o usuário no localStorage
        localStorage.setItem("user", JSON.stringify(this.user));
         const response = await put(`users/${this.user.id}`, this.user); // Envia o objeto completo do voluntário
                if (response.success) {
                  return { success: true, message: "Bilhete comprado e adicionado à agenda do user!" };
                } else {
                  console.log("Erro ao atualizar os dados do user na API.");
                  return { success: false, message: "Erro ao atualizar os dados do user na API." };
                }
      } catch (error) {
        console.log("Erro ao atualizar o localStorage do usuário:", error);
      }

      return { success: true, message: "Bilhete comprado e adicionado à agenda do usuário!" };
    },
  },
});
