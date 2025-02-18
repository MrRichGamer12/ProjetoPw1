import { defineStore } from "pinia";
import { get, post, del, put } from "@/api/api"; // Supondo que a função `get` e `post` sejam para buscar e criar dados, respectivamente
import { useCartStore } from "@/stores/useCartStore";
import { useEventStore } from "@/stores/useEventStore";

export const useVolunteerStore = defineStore("volunteer", {
  state: () => ({
    volunteers: [], // Lista de voluntários inscritos
    volunteer: null, // Detalhes do voluntário autenticado
    isAuthenticated: false,
    events: [], // Lista de eventos disponíveis
    event: null, // Evento associado (caso exista)
  }),
  getters: {
    isVolunteer: (state) => !!state.volunteer, // Verifica se o voluntário está logado
  },
  actions: {
    // Carrega os eventos disponíveis
    async loadEvents() {
      try {
        const response = await get("events");  // Usando `get` para buscar eventos
        console.log('Resposta da API:', response);
        this.events = response;  // Atualiza a lista de eventos
        console.log('Eventos:', this.events);  // Verificando o conteúdo de this.events
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    },

    // Carrega a lista de voluntários
    async loadVolunteers() {
      try {
        const volunteers = await get("volunteers");  // Usando `get` para buscar voluntários
        this.volunteers = volunteers;
      } catch (error) {
        console.error('Erro ao carregar voluntários:', error);
      }
    },

    // Carrega os dados do voluntário do armazenamento local
    loadVolunteerFromStorage() {
      const storedVolunteer = JSON.parse(localStorage.getItem("volunteer"));
      if (storedVolunteer) {
        this.volunteer = storedVolunteer;
        this.isAuthenticated = true;

        // Atualiza o carrinho individual com o voluntário atual
        const cartStore = useCartStore();
        cartStore.loadCartFromStorage();

        // Se o voluntário tiver um evento associado, carregue-o
        if (this.volunteer.eventId) {
          this.loadEvent(this.volunteer.eventId);
        }
      }
    },

    // Carrega um evento específico
    async loadEvent(eventId) {
      try {
        const event = await get(`events/${eventId}`);  // Usando `get` para buscar o evento
        this.event = event;
      } catch (error) {
        console.error("Erro ao carregar o evento:", error);
      }
    },

    // Salva os dados do voluntário e atualiza o carrinho individual
    setVolunteer(volunteerData) {
      this.volunteer = volunteerData;
      localStorage.setItem("volunteer", JSON.stringify(volunteerData));

      // Atualiza o carrinho do voluntário
      const cartStore = useCartStore();
      cartStore.loadCartFromStorage();
    },

    // Função de logout
    logout() {
      this.volunteer = null;
      this.isAuthenticated = false;
      localStorage.removeItem("volunteer");

      // Limpa o carrinho individual do voluntário
      const cartStore = useCartStore();
      cartStore.clearCart();
    },

    // Função para login de voluntários
    async loginVolunteer(email, password) {
      try {
        const volunteer = this.volunteers.find((v) => v.email === email);
        if (volunteer && volunteer.password === password) {
          volunteer.role = "volunteer";
          this.volunteer = volunteer;
          this.isAuthenticated = true;
          localStorage.setItem("volunteer", JSON.stringify(volunteer));

          // Atualiza o carrinho individual com o voluntário autenticado
          const cartStore = useCartStore();
          cartStore.loadCartFromStorage();

          return {
            success: true,
            message: "Login realizado com sucesso!",
            volunteer,
          };
        } else {
          return { success: false, message: "Credenciais incorretas." };
        }
      } catch (error) {
        return { success: false, message: "Erro ao tentar fazer login." };
      }
    },

    // Função para registrar um novo voluntário
    async registerVolunteer(
      name,
      age,
      email,
      experience,
      preferredRole,
      shift,
      eventId
    ) {
      try {
        // Usando `post` para enviar os dados de um novo voluntário
        const response = await post("volunteers", {
          name,
          age,
          email,
          experience,
          preferredRole,
          shift,
          eventId,
        });
        return response;  // Retorna a resposta da API
      } catch (error) {
        console.error("Erro ao registrar o voluntário:", error);
        return { success: false, message: "Erro ao tentar registrar o voluntário." };
      }
    },

    // Função para excluir um voluntário
    async deleteVolunteer(volunteerId) {
      try {
        // Usando `del` para excluir o voluntário da API
        const response = await del(`volunteers/${volunteerId}`);
        if (response.success) {
          // Exclui o voluntário da lista local e limpa o estado
          this.volunteers = this.volunteers.filter(v => v.id !== volunteerId);
          if (this.volunteer && this.volunteer.id === volunteerId) {
            this.logout(); // Desloga o voluntário caso ele esteja autenticado
          }
          return { success: true, message: "Voluntário excluído com sucesso." };
        } else {
          return { success: false, message: "Erro ao excluir o voluntário." };
        }
      } catch (error) {
        console.error("Erro ao excluir o voluntário:", error);
        return { success: false, message: "Erro ao tentar excluir o voluntário." };
      }
    },
    async buyTicket(eventId, ticketId) {
      const eventStore = useEventStore();
    
      if (!this.volunteer) {
        console.log("Voluntário não autenticado.");
        return { success: false, message: "Voluntário não autenticado." };
      }
    
      // Obtém o evento através da eventStore
      const event = eventStore.getEventById(eventId);
      if (!event) {
        console.log("Evento não encontrado.");
        return { success: false, message: "Evento não encontrado." };
      }
    
      // Desfaz o Proxy para acessar diretamente os dados (extraímos o objeto do Proxy)
      const eventData = JSON.parse(JSON.stringify(event));
    
      // Exibe o evento e seus tickets para depuração
      console.log("Evento encontrado:", eventData);
      console.log("Tickets do evento:", eventData.ticket_classes);
      console.log("TIcketID",ticketId);
    
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
    
      // Adiciona o ticket à agenda do voluntário
      if (!this.volunteer.agenda) {
        this.volunteer.agenda = [];
       }
      const ticketEntry = { eventId, ticketId };
      this.volunteer.agenda.push(ticketEntry);
    
      try {
        // Atualiza o voluntário no localStorage
        localStorage.setItem("volunteer", JSON.stringify(this.volunteer));
        const response = await put(`volunteers/${this.volunteer.id}`, this.volunteer); // Envia o objeto completo do voluntário
        if (response.success) {
          return { success: true, message: "Bilhete comprado e adicionado à agenda do voluntário!" };
        } else {
          console.log("Erro ao atualizar os dados do voluntário na API.");
          return { success: false, message: "Erro ao atualizar os dados do voluntário na API." };
        }
      } catch (error) {
        console.log("Erro ao atualizar o localStorage do voluntário:", error);
      }
    
      return { success: true, message: "Bilhete comprado e adicionado à agenda do voluntário!" };
    },      
  },
});
