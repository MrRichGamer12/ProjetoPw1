import { defineStore } from "pinia";
import { get, put, del } from "@/api/api"; // Importa funções da API

export const useEventStore = defineStore("event", {
  state: () => ({
    events: [],
  }),
  actions: {
    // Alterado para fetchEvents ser responsável pelo carregamento
    async fetchEvents() {
      try {
        const events = await get("events");
        this.events = events;
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      }
    },

    getEventById(eventId) {
      if (!this.events || this.events.length === 0) {
        console.warn("Nenhum evento carregado.");
        return null;
      }
    
      // Verifica se o eventId é um número ou string e converte ambos para o mesmo tipo
      const id = String(eventId); // Converte o eventId para string, garantindo consistência
    
      // Procura o evento com o ID correspondente
      const event = this.events.find((event) => String(event.id) === id); // Compara os IDs como strings
    
      if (!event) {
        console.warn(`Evento com ID ${eventId} não encontrado.`);
        return null;
      }
    
      return event;
    },
    
    
    async buyTicket(eventId, ticketType) {
      const event = this.getEventById(eventId);
      if (!event) {
        return;
      }

      const ticket = event.ticket_classes.find(
        (ticket) => ticket.name == ticketType
      );
      if (ticket && ticket.quantity > 0) {
        ticket.quantity -= 1; // Reduz um bilhete
        try {
          const response = await put(`events/${eventId}`, event);

          if (response && response.ok) {
            alert(`🎟️ Bilhete ${ticketType} comprado com sucesso!`);
          }
        } catch (error) {
          // Nenhum log será exibido
        }
      }
    },

    async updateTicketQuantity(eventId, ticketType, newQuantity) {
      const event = this.getEventById(eventId);
      if (!event) {
        console.error(`Evento com ID ${eventId} não encontrado.`);
        return;
      }
    
      // Encontre o ticket correspondente ao nome do ticket
      const ticket = event.ticket_classes.find(ticket => ticket.name == ticketType);
      // Se o ticket não for encontrado, registre o erro e retorne
      if (!ticket) {
        console.error(`Ticket com nome "${ticketType}" não encontrado.`);
        return;
      }
    
      // Verifique se a nova quantidade é válida
      if (isNaN(newQuantity) || newQuantity < 0) {
        console.error(`Quantidade inválida fornecida: ${newQuantity}`);
        return;
      }
    
      // Atualize a quantidade do ticket
      ticket.quantity = newQuantity;
    
      // Tente salvar as alterações
      try {
        // Envie as alterações de volta para o servidor
        await put(`events/${eventId}`, event);
      } catch (error) {
        // Caso ocorra um erro, logue o erro para depuração
        console.error("Erro ao atualizar a quantidade do ticket:", error);
      }
    },
    

    async deleteEvent(eventId) {
      try {
        await del(`events/${eventId}`);
        this.events = this.events.filter((event) => event.id !== eventId);
      } catch (error) {
        // Nenhum log será exibido
      }
    },

    async updateEvent(eventId, updatedEventData) {
      const event = this.getEventById(eventId);
      if (!event) {
        return;
      }

      // Atualize as propriedades do evento com os dados fornecidos
      Object.assign(event, updatedEventData);

      try {
        const response = await put(`events/${eventId}`, event);
        if (response && response.ok) {
          alert(`🎉 Evento atualizado com sucesso!`);
        }
      } catch (error) {
        // Nenhum log será exibido
      }
    },

    // Métodos para Gerenciar Palestrantes
    async addSpeaker(eventId, speaker) {
      const event = this.getEventById(eventId);
      if (event) {
        event.speakers.push(speaker);
        try {
          await put(`events/${eventId}`, event); // Atualiza o evento na API
        } catch (error) {
          // Nenhum log será exibido
        }
      }
    },

    async updateSpeaker(eventId, speakerIndex, updatedSpeaker) {
      const event = this.getEventById(eventId);
      if (event && event.speakers[speakerIndex]) {
        event.speakers[speakerIndex] = updatedSpeaker;
        try {
          await put(`events/${eventId}`, event);
        } catch (error) {
          // Nenhum log será exibido
        }
      }
    },

    async deleteSpeaker(eventId, speakerIndex) {
      const event = this.getEventById(eventId);
      if (event && event.speakers[speakerIndex]) {
        event.speakers.splice(speakerIndex, 1);
        try {
          await put(`events/${eventId}`, event);
        } catch (error) {
          // Nenhum log será exibido
        }
      }
    },

    // Métodos para Gerenciar Tópicos
    async addTopic(eventId, topic) {
      const event = this.getEventById(eventId);
      if (event) {
        event.topics.push(topic);
        try {
          await put(`events/${eventId}`, event); // Atualiza o evento na API
        } catch (error) {
          // Nenhum log será exibido
        }
      }
    },

    async deleteTopic(eventId, topicIndex) {
      const event = this.getEventById(eventId);
      if (event && event.topics[topicIndex]) {
        event.topics.splice(topicIndex, 1);
        try {
          await put(`events/${eventId}`, event);
        } catch (error) {
          // Nenhum log será exibido
        }
      }
    },

    async getSpeakerByEventAndSpeakerId(eventId, speakerId) {
      const event = this.getEventById(eventId);
      if (!event) {
        return null;
      }

      const speaker = event.speakers.find(
        (speaker) => speaker.id === speakerId
      );
      if (!speaker) {
        return null;
      }

      return speaker;
    },
  },
});
