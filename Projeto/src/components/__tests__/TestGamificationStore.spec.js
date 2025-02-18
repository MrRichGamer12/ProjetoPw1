import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGamificationStore } from '@/stores/useGamificationStore';

describe('useGamificationStore', () => {
  let gamificationStore;

  beforeEach(() => {
    // Configura o Pinia antes de cada teste
    setActivePinia(createPinia());
    gamificationStore = useGamificationStore();
  });

  it('adds points correctly', () => {
    gamificationStore.addPoints(10);
    expect(gamificationStore.points).toBe(10);
    
    gamificationStore.addPoints(5);
    expect(gamificationStore.points).toBe(15);
  });

  it('adds a badge if it does not already exist', () => {
    gamificationStore.addBadge('Badge1');
    expect(gamificationStore.badges).toContain('Badge1');
    
    // Tenta adicionar o mesmo badge novamente
    gamificationStore.addBadge('Badge1');
    expect(gamificationStore.badges.filter(badge => badge === 'Badge1')).toHaveLength(1);
  });

  it('completes the "participarRecepcao" task correctly', () => {
    gamificationStore.checkTasksCompleted('participarRecepcao');
    expect(gamificationStore.points).toBe(20);
    expect(gamificationStore.badges).toContain('Recepcionista Expert');
  });

  it('completes the "organizarSessao" task correctly', () => {
    gamificationStore.checkTasksCompleted('organizarSessao');
    expect(gamificationStore.points).toBe(30);
    expect(gamificationStore.badges).toContain('Organizador de Sessões');
  });

  it('completes the "assistirEvento" task correctly', () => {
    gamificationStore.checkTasksCompleted('assistirEvento');
    expect(gamificationStore.points).toBe(10);
    expect(gamificationStore.badges).toContain('Assistente de Evento');
  });

  it('does not add duplicate badges on multiple task completions', () => {
    gamificationStore.checkTasksCompleted('participarRecepcao');
    gamificationStore.checkTasksCompleted('participarRecepcao');
    
    // Verifica se os pontos somam corretamente (20 + 20)
    expect(gamificationStore.points).toBe(40);
    // Apenas um badge deve estar presente
    expect(gamificationStore.badges.filter(badge => badge === 'Recepcionista Expert')).toHaveLength(1);
  });

  it('resets gamification state correctly', () => {
    gamificationStore.addPoints(50);
    gamificationStore.addBadge('Badge1');
    
    gamificationStore.resetGamification();
    expect(gamificationStore.points).toBe(0);
    expect(gamificationStore.badges).toEqual([]);
  });

  it('getter totalPoints returns the correct value', () => {
    gamificationStore.addPoints(15);
    expect(gamificationStore.totalPoints).toBe(15);
  });

  it('getter hasBadge returns true when badge exists and false otherwise', () => {
    gamificationStore.addBadge('Badge1');
    expect(gamificationStore.hasBadge('Badge1')).toBe(true);
    expect(gamificationStore.hasBadge('Badge2')).toBe(false);
  });
});
