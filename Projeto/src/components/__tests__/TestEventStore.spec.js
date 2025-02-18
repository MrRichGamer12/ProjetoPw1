import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEventStore } from '@/stores/useEventStore';
import { get, put, del } from '@/api/api';

vi.mock('@/api/api', () => ({
  get: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe('useEventStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia()); // Set up Pinia for each test
    store = useEventStore(); // Initialize the store after Pinia is set
    localStorage.clear(); // Clear any localStorage items
  });

  it('fetches events successfully', async () => {
    const mockEvents = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];
    get.mockResolvedValue(mockEvents);

    await store.fetchEvents();

    expect(store.events).toEqual(mockEvents);
    expect(get).toHaveBeenCalledWith('events');
  });

  it('retrieves event by ID successfully', () => {
    store.events = [{ id: 1, name: 'Event 1' }];
    const event = store.getEventById(1);
    expect(event).toEqual({ id: 1, name: 'Event 1' });
  });

  it('returns null when event is not found by ID', () => {
    store.events = [{ id: 1, name: 'Event 1' }];
    const event = store.getEventById(2);
    expect(event).toBeNull();
  });

  it('buys a ticket successfully', async () => {
    const mockEvent = {
      id: 1,
      name: 'Event 1',
      ticket_classes: [{ name: 'VIP', quantity: 5 }],
    };
    const updatedEvent = {
      ...mockEvent,
      ticket_classes: [{ name: 'VIP', quantity: 4 }],
    };

    store.events = [mockEvent];
    put.mockResolvedValue({ ok: true });

    await store.buyTicket(1, 'VIP');

    expect(store.events[0].ticket_classes[0].quantity).toBe(4);
    expect(put).toHaveBeenCalledWith('events/1', updatedEvent);
  });

  it('does not buy a ticket if the event does not exist', async () => {
    store.events = [];
    await store.buyTicket(1, 'VIP');
    expect(store.events.length).toBe(0);
  });

  it('updates ticket quantity successfully', async () => {
    const mockEvent = {
      id: 1,
      name: 'Event 1',
      ticket_classes: [{ name: 'VIP', quantity: 5 }],
    };
    const updatedEvent = {
      ...mockEvent,
      ticket_classes: [{ name: 'VIP', quantity: 10 }],
    };

    store.events = [mockEvent];
    put.mockResolvedValue({ ok: true });

    await store.updateTicketQuantity(1, 'VIP', 10);

    expect(store.events[0].ticket_classes[0].quantity).toBe(10);
    expect(put).toHaveBeenCalledWith('events/1', updatedEvent);
  });

  it('fails to update ticket quantity when event is not found', async () => {
    store.events = [];
    await store.updateTicketQuantity(1, 'VIP', 10);
    expect(store.events.length).toBe(0);
  });

  it('deletes an event successfully', async () => {
    const mockEvent = { id: 1, name: 'Event 1' };
    store.events = [mockEvent];
    del.mockResolvedValue({});

    await store.deleteEvent(1);

    expect(store.events.length).toBe(0);
    expect(del).toHaveBeenCalledWith('events/1');
  });

  it('does not delete an event if event is not found', async () => {
    store.events = [];
    await store.deleteEvent(1);
    expect(store.events.length).toBe(0);
  });

  it('updates event successfully', async () => {
    const mockEvent = { id: 1, name: 'Event 1' };
    const updatedEventData = { name: 'Updated Event 1' };
    const updatedEvent = { id: 1, name: 'Updated Event 1' };

    store.events = [mockEvent];
    put.mockResolvedValue({ ok: true });

    await store.updateEvent(1, updatedEventData);

    expect(store.events[0]).toEqual(updatedEvent);
    expect(put).toHaveBeenCalledWith('events/1', updatedEvent);
  });

  it('adds a speaker to an event successfully', async () => {
    const mockEvent = { id: 1, name: 'Event 1', speakers: [] };
    const speaker = { id: 1, name: 'Speaker 1' };

    store.events = [mockEvent];
    put.mockResolvedValue({ ok: true });

    await store.addSpeaker(1, speaker);

    expect(store.events[0].speakers).toContainEqual(speaker);
    expect(put).toHaveBeenCalledWith('events/1', store.events[0]);
  });

  it('adds a topic to an event successfully', async () => {
    const mockEvent = { id: 1, name: 'Event 1', topics: [] };
    const topic = { id: 1, name: 'Topic 1' };

    store.events = [mockEvent];
    put.mockResolvedValue({ ok: true });

    await store.addTopic(1, topic);

    expect(store.events[0].topics).toContainEqual(topic);
    expect(put).toHaveBeenCalledWith('events/1', store.events[0]);
  });

  it('deletes a topic from an event successfully', async () => {
    const mockEvent = { id: 1, name: 'Event 1', topics: [{ id: 1, name: 'Topic 1' }] };
    store.events = [mockEvent];
    put.mockResolvedValue({ ok: true });

    await store.deleteTopic(1, 0);

    expect(store.events[0].topics.length).toBe(0);
    expect(put).toHaveBeenCalledWith('events/1', store.events[0]);
  });

  it('retrieves a speaker by event and speaker ID', async () => {
    const mockEvent = {
      id: 1,
      name: 'Event 1',
      speakers: [{ id: 1, name: 'Speaker 1' }],
    };
    store.events = [mockEvent];
  
    const speaker = await store.getSpeakerByEventAndSpeakerId(1, 1); // Await the promise
    expect(speaker).toEqual({ id: 1, name: 'Speaker 1' });
  });
  
  it('returns null when speaker is not found by event and speaker ID', async () => {
    const mockEvent = {
      id: 1,
      name: 'Event 1',
      speakers: [{ id: 1, name: 'Speaker 1' }],
    };
    store.events = [mockEvent];
  
    const speaker = await store.getSpeakerByEventAndSpeakerId(1, 2); // Await the promise
    expect(speaker).toBeNull();
  });
  
});
