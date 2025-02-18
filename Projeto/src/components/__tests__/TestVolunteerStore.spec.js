import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useVolunteerStore } from '@/stores/useVolunteerStore';
import { useCartStore } from '@/stores/useCartStore';
import { useEventStore } from '@/stores/useEventStore';
import { get, post, del, put } from '@/api/api';

// Mock da API (incluindo o put)
vi.mock('@/api/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
  put: vi.fn(),
}));

// Mock da store do carrinho
vi.mock('@/stores/useCartStore', () => ({
  useCartStore: vi.fn().mockReturnValue({
    cart: [],
    clearCart: vi.fn(),
    loadCartFromStorage: vi.fn(),
  }),
}));

// Mock da store de eventos
vi.mock('@/stores/useEventStore', () => ({
  useEventStore: vi.fn().mockReturnValue({
    getEventById: vi.fn(),
    updateTicketQuantity: vi.fn(),
  }),
}));

describe('useVolunteerStore', () => {
  let volunteerStore;
  let cartStore;
  let eventStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    volunteerStore = useVolunteerStore();
    cartStore = useCartStore();
    eventStore = useEventStore();
    // Limpa os mocks das APIs
    get.mockClear();
    post.mockClear();
    del.mockClear();
    put.mockClear();
  });

  it('loads volunteers successfully', async () => {
    const mockVolunteers = [{ id: 1, name: 'Volunteer 1' }];
    get.mockResolvedValue(mockVolunteers);

    await volunteerStore.loadVolunteers();

    expect(volunteerStore.volunteers).toEqual(mockVolunteers);
    expect(get).toHaveBeenCalledWith('volunteers');
  });

  it('loads events successfully', async () => {
    const mockEvents = [{ id: 1, name: 'Event 1' }];
    get.mockResolvedValue(mockEvents);

    await volunteerStore.loadEvents();

    expect(volunteerStore.events).toEqual(mockEvents);
    expect(get).toHaveBeenCalledWith('events');
  });

  it('sets volunteer data in localStorage and updates store', () => {
    const volunteerData = { id: 1, name: 'Volunteer 1' };

    volunteerStore.setVolunteer(volunteerData);

    expect(volunteerStore.volunteer).toEqual(volunteerData);
    expect(localStorage.getItem('volunteer')).toEqual(JSON.stringify(volunteerData));
    expect(cartStore.loadCartFromStorage).toHaveBeenCalled();
  });

  it('loads volunteer from localStorage and updates store', () => {
    const storedVolunteer = { id: 1, name: 'Volunteer 1', eventId: 1 };
    localStorage.setItem('volunteer', JSON.stringify(storedVolunteer));

    // Para testar o carregamento do evento, simulamos uma resposta para get
    const mockEvent = { id: 1, name: 'Event 1' };
    get.mockResolvedValue(mockEvent);

    volunteerStore.loadVolunteerFromStorage();

    expect(volunteerStore.volunteer).toEqual(storedVolunteer);
    expect(volunteerStore.isAuthenticated).toBe(true);
    expect(cartStore.loadCartFromStorage).toHaveBeenCalled();
    // Se houver eventId, a função loadEvent deve ser chamada e atualizar a store
  });

  it('logs out volunteer and clears data from store, localStorage, and cart', () => {
    const volunteerData = { id: 1, name: 'Volunteer 1' };
    volunteerStore.setVolunteer(volunteerData);
    volunteerStore.logout();

    expect(volunteerStore.volunteer).toBeNull();
    expect(volunteerStore.isAuthenticated).toBe(false);
    expect(localStorage.getItem('volunteer')).toBeNull();
    expect(cartStore.clearCart).toHaveBeenCalled();
  });

  it('logs in volunteer successfully', async () => {
    const mockVolunteers = [{
      id: 1,
      name: 'Volunteer 1',
      email: 'volunteer1@example.com',
      password: 'password'
    }];
    volunteerStore.volunteers = mockVolunteers;

    const result = await volunteerStore.loginVolunteer('volunteer1@example.com', 'password');

    expect(result.success).toBe(true);
    expect(volunteerStore.volunteer).toEqual(mockVolunteers[0]);
    expect(volunteerStore.isAuthenticated).toBe(true);
    expect(localStorage.getItem('volunteer')).toEqual(JSON.stringify(mockVolunteers[0]));
    expect(cartStore.loadCartFromStorage).toHaveBeenCalled();
  });

  it('fails to login with incorrect credentials', async () => {
    const mockVolunteers = [{
      id: 1,
      name: 'Volunteer 1',
      email: 'volunteer1@example.com',
      password: 'password'
    }];
    volunteerStore.volunteers = mockVolunteers;

    const result = await volunteerStore.loginVolunteer('volunteer1@example.com', 'wrongpassword');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Credenciais incorretas.');
    expect(volunteerStore.volunteer).toBeNull();
    expect(volunteerStore.isAuthenticated).toBe(false);
  });

  it('loads event for volunteer', async () => {
    const mockEvent = { id: 1, name: 'Event 1' };
    const volunteer = { id: 1, name: 'Volunteer 1', eventId: 1 };
    volunteerStore.volunteer = volunteer;
    get.mockResolvedValue(mockEvent);

    await volunteerStore.loadEvent(volunteer.eventId);

    expect(volunteerStore.event).toEqual(mockEvent);
    expect(get).toHaveBeenCalledWith('events/1');
  });

  it('registers volunteer successfully', async () => {
    const newVolunteer = {
      name: 'Volunteer 2',
      age: 30,
      email: 'volunteer2@example.com',
      experience: 'Some experience',
      preferredRole: 'Helper',
      shift: 'Morning',
      eventId: 1,
    };
    const mockResponse = { success: true, message: 'Voluntário registrado com sucesso' };
    post.mockResolvedValue(mockResponse);

    const result = await volunteerStore.registerVolunteer(...Object.values(newVolunteer));

    expect(result.success).toBe(true);
    expect(post).toHaveBeenCalledWith('volunteers', newVolunteer);
  });

  it('buys ticket successfully', async () => {
    // Configura um voluntário autenticado com agenda
    const volunteerData = { id: 1, name: 'Volunteer 1', agenda: [] };
    volunteerStore.volunteer = volunteerData;
    localStorage.setItem('volunteer', JSON.stringify(volunteerData));
  
    // Define os valores de eventId e ticketId
    const eventId = 1;
    const ticketId = "101";
  
    // Configura o eventStore para retornar um evento com ticket_classes
    const mockEvent = {
      id: eventId,
      name: 'Event 1',
      ticket_classes: [
        { id: ticketId, name: "Ticket A", quantity: 5 }
      ]
    };
    eventStore.getEventById.mockReturnValue(mockEvent);
    eventStore.updateTicketQuantity.mockResolvedValue({ success: true });
  
    const result = await volunteerStore.buyTicket(eventId, ticketId);
  
    // Em vez de esperar que mockEvent.ticket_classes[0].quantity seja atualizado,
    // verifica-se se updateTicketQuantity foi chamado com a quantidade decrementada (4)
    expect(eventStore.updateTicketQuantity).toHaveBeenCalledWith(eventId, "Ticket A", 4);
  
    // Verifica se o ticket foi adicionado à agenda do voluntário
    expect(volunteerStore.volunteer.agenda).toContainEqual({ eventId, ticketId });
  
    // Verifica se o localStorage foi atualizado
    expect(localStorage.getItem("volunteer")).toEqual(JSON.stringify(volunteerStore.volunteer));
  
    // Verifica se a API foi chamada para atualizar o voluntário
    expect(put).toHaveBeenCalledWith(`volunteers/${volunteerStore.volunteer.id}`, volunteerStore.volunteer);
  
    expect(result.success).toBe(true);
    expect(result.message).toBe("Bilhete comprado e adicionado à agenda do voluntário!");
  });
  
  
});
