import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useVolunteerStore } from '@/stores/useVolunteerStore';
import { useCartStore } from '@/stores/useCartStore'; // IMPORTANDO A STORE DO CARRINHO
import { get, post, del } from '@/api/api'; // Incluindo o mock de post e del

// Mock da API
vi.mock('@/api/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
}));

// Mock da store do carrinho
vi.mock('@/stores/useCartStore', () => ({
  useCartStore: vi.fn().mockReturnValue({
    cart: [],  // Mock do carrinho
    clearCart: vi.fn(),  // Mock da função clearCart
    loadCartFromStorage: vi.fn(), // Adicionado para interceptar chamadas de loadCartFromStorage
  }),
}));

describe('useVolunteerStore', () => {
  let volunteerStore;
  let cartStore;

  beforeEach(() => {
    // Configura o Pinia antes de cada teste
    setActivePinia(createPinia());
    localStorage.clear(); // Limpa o localStorage entre os testes
    volunteerStore = useVolunteerStore(); // Cria uma instância da store de voluntários
    cartStore = useCartStore();  // Cria uma instância mockada da store do carrinho
  });

  it('loads volunteers successfully', async () => {
    const mockVolunteers = [{ id: 1, name: 'Volunteer 1' }];
    get.mockResolvedValue(mockVolunteers); // Mock da função get

    await volunteerStore.loadVolunteers(); // Chama a ação

    expect(volunteerStore.volunteers).toEqual(mockVolunteers); // Verifica se os voluntários foram carregados corretamente
    expect(get).toHaveBeenCalledWith('volunteers'); // Verifica se a API foi chamada corretamente
  });

  it('sets volunteer data in localStorage and updates store', () => {
    const volunteerData = { id: 1, name: 'Volunteer 1' };

    volunteerStore.setVolunteer(volunteerData); // Chama a ação

    expect(volunteerStore.volunteer).toEqual(volunteerData); // Verifica se os dados do voluntário foram atualizados
    expect(localStorage.getItem('volunteer')).toEqual(JSON.stringify(volunteerData)); // Verifica se os dados foram salvos no localStorage
    expect(cartStore.loadCartFromStorage).toHaveBeenCalled(); // Verifica se o carrinho foi atualizado
  });

  it('loads volunteer from localStorage and updates store', () => {
    const storedVolunteer = { id: 1, name: 'Volunteer 1', eventId: 1 };
    localStorage.setItem('volunteer', JSON.stringify(storedVolunteer));

    volunteerStore.loadVolunteerFromStorage(); // Chama a ação

    expect(volunteerStore.volunteer).toEqual(storedVolunteer); // Verifica se o voluntário foi carregado corretamente
    expect(volunteerStore.isAuthenticated).toBe(true); // Verifica se a autenticação foi realizada com sucesso
    expect(cartStore.loadCartFromStorage).toHaveBeenCalled(); // Verifica se o carrinho foi atualizado
  });

  it('logs out volunteer and clears data from store, localStorage, and cart', () => {
    const volunteerData = { id: 1, name: 'Volunteer 1' };
    volunteerStore.setVolunteer(volunteerData); // Configura um voluntário
    volunteerStore.logout(); // Chama a ação de logout

    // Verifica se os dados do voluntário foram limpos
    expect(volunteerStore.volunteer).toBeNull();
    expect(volunteerStore.isAuthenticated).toBe(false);
    expect(localStorage.getItem('volunteer')).toBeNull(); // Verifica se o localStorage foi limpo

    // Verifica se a função clearCart foi chamada para limpar o carrinho
    expect(cartStore.clearCart).toHaveBeenCalled();
  });

  it('logs in volunteer successfully', async () => {
    const mockVolunteers = [{
      id: 1,
      name: 'Volunteer 1',
      email: 'volunteer1@example.com',
      password: 'password'
    }];
    volunteerStore.volunteers = mockVolunteers; // Configura a lista de voluntários
    const result = await volunteerStore.loginVolunteer('volunteer1@example.com', 'password'); // Chama a ação de login

    expect(result.success).toBe(true); // Verifica se o login foi bem-sucedido
    expect(volunteerStore.volunteer).toEqual(mockVolunteers[0]); // Verifica se o voluntário foi atualizado na store
    expect(volunteerStore.isAuthenticated).toBe(true); // Verifica se o status de autenticação foi atualizado
    expect(localStorage.getItem('volunteer')).toEqual(JSON.stringify(mockVolunteers[0])); // Verifica se os dados foram salvos no localStorage
    expect(cartStore.loadCartFromStorage).toHaveBeenCalled(); // Verifica se o carrinho foi atualizado
  });

  it('fails to login with incorrect credentials', async () => {
    const mockVolunteers = [{
      id: 1,
      name: 'Volunteer 1',
      email: 'volunteer1@example.com',
      password: 'password'
    }];
    volunteerStore.volunteers = mockVolunteers; // Configura a lista de voluntários

    const result = await volunteerStore.loginVolunteer('volunteer1@example.com', 'wrongpassword'); // Chama a ação com senha incorreta

    expect(result.success).toBe(false); // Verifica se o login falhou
    expect(result.message).toBe('Credenciais incorretas.'); // Verifica a mensagem de erro
    expect(volunteerStore.volunteer).toBeNull(); // Verifica se o voluntário não foi atualizado
    expect(volunteerStore.isAuthenticated).toBe(false); // Verifica se a autenticação não foi realizada
  });

  it('loads event for volunteer', async () => {
    const mockEvent = { id: 1, name: 'Event 1' };
    const volunteer = { id: 1, name: 'Volunteer 1', eventId: 1 };
    volunteerStore.volunteer = volunteer; // Configura o voluntário
    get.mockResolvedValue(mockEvent); // Mock do evento

    await volunteerStore.loadEvent(volunteer.eventId); // Chama a ação de carregar o evento

    expect(volunteerStore.event).toEqual(mockEvent); // Verifica se o evento foi carregado corretamente
    expect(get).toHaveBeenCalledWith('events/1'); // Verifica se a API foi chamada corretamente
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
    post.mockResolvedValue(mockResponse); // Mock da resposta do post

    const result = await volunteerStore.registerVolunteer(...Object.values(newVolunteer)); // Chama a ação de registro

    expect(result.success).toBe(true); // Verifica se o registro foi bem-sucedido
    expect(post).toHaveBeenCalledWith('volunteers', newVolunteer); // Verifica se a API foi chamada corretamente
  });

  it('deletes volunteer successfully', async () => {
    const volunteerId = 1;
    const mockResponse = { success: true, message: 'Voluntário excluído com sucesso' };
    del.mockResolvedValue(mockResponse); // Mock da resposta do del

    const result = await volunteerStore.deleteVolunteer(volunteerId); // Chama a ação de exclusão

    expect(result.success).toBe(true); // Verifica se a exclusão foi bem-sucedida
    expect(del).toHaveBeenCalledWith(`volunteers/${volunteerId}`); // Verifica se a API foi chamada corretamente
    expect(volunteerStore.volunteers).not.toContainEqual({ id: volunteerId }); // Verifica se o voluntário foi removido da lista
  });
});
