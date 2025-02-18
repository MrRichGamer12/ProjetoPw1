<template>
  <div id="app">
    <!-- Cabeçalho -->
    <header>
      <nav>
        <ul>
          <li><router-link to="/">Início</router-link></li>

          <div class="auth-links">
            <li v-if="isAuthenticated && isAdmin">
              <router-link to="/dashboard">Dashboard</router-link>
            </li>
            <li v-if="isAuthenticated || isVolunteer">
              <router-link to="/cart">Carrinho</router-link>
            </li>
            <li v-if="!isAuthenticated && !isVolunteer" class="login-link">
              <router-link to="/add-volunteer">Voluntariar-se</router-link>
            </li>
            <li v-if="!isAuthenticated && !isVolunteer" class="login-link">
              <router-link to="/login">Login/Cadastrar</router-link>
            </li>
            <li v-if="isAuthenticated || isVolunteer" class="login-link">
              <router-link to="/profile">Perfil</router-link>
            </li>
            <li v-if="isAuthenticated || isVolunteer" class="login-link">
              <button @click="logout" class="logout-button">Logout</button>
            </li>
          </div>
        </ul>
      </nav>
    </header>


    <main>
      <router-view />
    </main>

    <footer>
      <p>&copy; 2025 - Todos os direitos reservados. Este site é operado pelo Centro de Convenções ExpoTech, São Paulo,
        Brasil.</p>
    </footer>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/useUserStore'; // Importa o store de utilizador
import { useVolunteerStore } from '@/stores/useVolunteerStore'; // Importa a store de voluntário
import { useRouter } from 'vue-router'; // Importa o router
import { storeToRefs } from 'pinia'; // Importa storeToRefs para acessar as propriedades reativas
import { onMounted } from 'vue';

// Acessa os stores de utilizador e voluntário
const userStore = useUserStore();
const volunteerStore = useVolunteerStore();

// Usa storeToRefs para acessar as propriedades reativas dos stores
const { isAuthenticated, isAdmin } = storeToRefs(userStore);
const { isVolunteer } = storeToRefs(volunteerStore); // Acessa o getter isVolunteer diretamente

// Acede ao router para redirecionar o utilizador
const router = useRouter();

// Função de logout que chama o método logout do store
const logout = () => {
  // Verifica o tipo de usuário baseado no role
  if (userStore.isAuthenticated) {
    // Se for um usuário normal, chama o logout na store de usuário
    userStore.logout();
  } else if (volunteerStore.isAuthenticated) {
    // Se for um voluntário, chama o logout na store de voluntário
    volunteerStore.logout();
  }

  // Redireciona para a página de login após o logout
  router.push('/login');
};

// Carregar o utilizador do localStorage ao iniciar a app
userStore.loadUserFromStorage();

volunteerStore.loadVolunteerFromStorage();

onMounted(() => {
  userStore.loadUserFromStorage();
  volunteerStore.loadVolunteerFromStorage();
});

</script>



<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 15px;
}

nav ul {
  display: flex;
  list-style-type: none;
  padding: 0;
  justify-content: space-between;
  width: 100%;
}

nav ul li {
  margin-right: 20px;
}

nav ul li a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  /* Garante que todos os links tenham o mesmo peso de fonte */
  padding: 5px 10px;
  /* Adiciona um padding para garantir que o texto não fique colado às bordas */
  border-radius: 5px;
  /* Deixa os links mais arredondados */
}

nav ul li a:hover {
  text-decoration: underline;
  background-color: rgba(255, 255, 255, 0.1);
  /* Adiciona um efeito de fundo ao passar o mouse */
}

nav ul li button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
}

nav ul li button:hover {
  text-decoration: underline;
  background-color: rgba(255, 255, 255, 0.1);
  /* Similar ao efeito dos links */
}

.auth-links {
  display: flex;
  justify-content: flex-end;
  /* Alinha os links de login, perfil, carrinho e logout à direita */
  gap: 15px;
  /* Adiciona espaço entre os itens */
}

.auth-links li {
  list-style-type: none;
  margin: 0;
  /* Remove a margem extra dos itens */
}

.auth-links li a,
.auth-links li button {
  color: white;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: 500;
}

.auth-links li a:hover,
.auth-links li button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  /* Mesmo efeito de hover nos links e botões */
}

@media (max-width: 768px) {
  nav ul {
    flex-direction: column;
    align-items: center;
  }

  .auth-links {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
}

router-view {
  flex-grow: 1;
  padding: 20px;
  width: 100%;
}

footer {
  background-color: #333;
  color: white;
  padding: 20px;
  text-align: center;
  margin-top: auto;
}

footer p {
  margin: 0;
}

footer a {
  color: white;
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}


body {
  background: url('@/assets/pawel-czerwinski-TYB5Nosz-y4-unsplash.jpg') no-repeat center center fixed;
  background-size: cover;
  font-family: 'Poppins', sans-serif;
  color: #fff;
}
</style>
