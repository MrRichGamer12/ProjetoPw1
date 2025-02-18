<template>
    <div v-if="speaker" :style="{ backgroundImage: `url(${event.image})` }" class="speaker-profile">
      <div class="overlay">
        <div class="speaker-info">
          <!-- Imagem do palestrante -->
          <img v-if="speaker.image" :src="speaker.image" :alt="speaker.name" class="speaker-image" />
  
          <div class="speaker-text">
            <h1>{{ speaker.name }}</h1>
            <h3>{{ speaker.role }}</h3>
            <p>{{ speaker.bio }}</p>
          </div>
        </div>
      </div>
    </div>
    <p v-else>Carregando palestrante...</p>
  </template>
  
  <script setup>
  import { useRoute, useRouter } from "vue-router";
  import { useEventStore } from "@/stores/useEventStore";
  import { ref, onMounted } from "vue";
  
  // Obtendo os parâmetros da URL
  const route = useRoute();
  const router = useRouter();
  const speakerName = route.params.name; // Nome do palestrante na URL
  const eventStore = useEventStore();
  const speaker = ref(null);
  const event = ref(null);
  
  // Função para buscar palestrante pelo nome e pegar detalhes do evento
  const fetchSpeakerByName = () => {
    const eventId = parseInt(route.params.id); // ID do evento vindo da URL
    const currentEvent = eventStore.getEventById(eventId);
  
    if (currentEvent) {
      event.value = currentEvent; // Armazena o evento para pegar a imagem de fundo
      // Busca o palestrante pelo nome (ignora maiúsculas/minúsculas)
      speaker.value = currentEvent.speakers.find(speaker => speaker.name.toLowerCase() === speakerName.toLowerCase());
    }
  
    if (!speaker.value) {
      console.error(`Palestrante "${speakerName}" não encontrado`);
      router.push("/404"); // Redireciona para página 404 caso o palestrante não seja encontrado
    }
  };
  
  // Carregar dados ao montar o componente
  onMounted(() => {
    fetchSpeakerByName();
  });
  </script>
  
  <style scoped>
  .speaker-profile {
    background-size: cover;
    background-position: center;
    background-attachment: fixed; /* Mantém o fundo fixo ao rolar */
    padding: 40px 20px;
    color: white;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .overlay {
    background-color: rgba(0, 0, 0, 0.7); /* Melhor contraste para a leitura */
    padding: 30px;
    border-radius: 10px;
    width: 100%;
    max-width: 800px;
    text-align: center;
  }
  
  .speaker-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .speaker-image {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  }
  
  .speaker-text {
    text-align: center;
    max-width: 500px;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
  }
  </style>
  