<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-black text-white p-6">
    <h1 class="text-5xl font-bold text-center mb-6">Eventos de Tecnologia</h1>
    <div v-show="eventStore.events.length === 0" class="text-xl">Carregando eventos...</div>

    <swiper v-if="eventStore.events.length > 0"
    :slidesPerView="1" 
    :spaceBetween="30" 
    :loop="true" 
    :autoplay="{ delay: 5000, disableOnInteraction: false }"
    :pagination="{ clickable: true }" 
    class="swiper-container">
      <swiper-slide v-for="event in eventStore.events" :key="event.id">
        <div class="event-item" :style="{ backgroundImage: `url(${event.image})` }">
          <!-- Número do Evento no canto superior esquerdo -->
          <div class="event-id">{{ event.id }}</div>

          <div class="event-info">
            <h2 class="text-3xl font-semibold">{{ event.name }}</h2>
            <p class="text-lg">{{ event.description }}</p>
            <p class="text-lg font-bold mt-2">{{ countdowns[event.id]?.label }}</p>
            <div class="text-2xl font-semibold bg-white/10 backdrop-blur-lg p-2 rounded-xl mt-1">
              {{ countdowns[event.id]?.days }}d {{ countdowns[event.id]?.hours }}h
              {{ countdowns[event.id]?.minutes }}m {{ countdowns[event.id]?.seconds }}s
            </div>
            <router-link :to="`/event/${event.id}`" class="event-link mt-4">Ver Detalhes</router-link>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import { ref, watchEffect, onMounted, onUnmounted } from 'vue';
import { useEventStore } from '@/stores/useEventStore';

const eventStore = useEventStore();

const countdowns = ref({});

const updateCountdowns = () => {
  const now = new Date();
  eventStore.events.forEach(event => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    let timeLeft;

    if (now < start) {
      const difference = start - now;
      timeLeft = {
        label: 'Inicia em:',
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else if (now < end) {
      const difference = end - now;
      timeLeft = {
        label: 'Termina em:',
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { label: 'Evento finalizado', days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    countdowns.value[event.id] = timeLeft;
  });
};

let interval;
onMounted(() => {
  updateCountdowns();
  interval = setInterval(updateCountdowns, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});

watchEffect(() => {
  eventStore.fetchEvents();
});
</script>

<style scoped>
.swiper-container {
  width: 100%;
  height: 400px;
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.event-item {
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100%;
  width: 100%;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.event-info {
  background-color: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 8px;
  color: white;
  text-align: center;
  max-width: 80%;
  position: absolute;
}

.event-info h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.event-info p {
  font-size: 16px;
  margin-bottom: 10px;
}

.event-link {
  text-decoration: none;
  color: #ff7b72;
  font-weight: bold;
}

.event-link:hover {
  text-decoration: underline;
}

/* Estilo para o número do evento */
.event-id {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 5px;
}
.swiper-container {
  width: 100%;
  height: 400px;
}

</style>
