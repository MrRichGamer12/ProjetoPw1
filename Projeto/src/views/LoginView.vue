<script setup>
import { reactive, onMounted,ref  } from 'vue';
import { useUserStore } from '@/stores/useUserStore';
import { useVolunteerStore } from '@/stores/useVolunteerStore';
import { useRouter } from 'vue-router';

const credentials = reactive({ email: "", password: "" });
const userStore = useUserStore();
const volunteerStore = useVolunteerStore();
const router = useRouter();
const isSubmitting = ref(false);
const login = async () => {
  try {
    // Exibe um estado de carregamento enquanto o login é processado
    isSubmitting.value = true;

    // Tenta fazer o login do usuário
    let response = await userStore.login(credentials.email, credentials.password);

    if (!response.success) {
      // Tenta autenticar o voluntário caso o login do usuário falhe
      response = await volunteerStore.loginVolunteer(credentials.email, credentials.password);
      if (response.success) {
        volunteerStore.volunteer = response.volunteer;  // Salva o voluntário na store
      }
    }

    // Verifica a resposta do login
    if (response.success) {
      if (volunteerStore.volunteer) {
        // Redireciona para o perfil do voluntário
        router.push('/profile');
      } else if (userStore.user) {
        // Redireciona para a home page
        router.push('/');
      }
    } else {
      alert(response.message);  // Exibe a mensagem de erro de login
    }
  } catch (error) {
    // Exibe um alerta caso haja um erro inesperado
    alert('Ocorreu um erro inesperado. Tente novamente mais tarde.');
  } finally {
    // Reseta o estado de carregamento após o processo de login
    isSubmitting.value = false;
  }
};


// Carrega os voluntários ao montar o componente
onMounted(() => {
  volunteerStore.loadVolunteers();  // Carrega os voluntários antes de tentar o login
});
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login" class="login-form">
      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" v-model="credentials.email" type="email" required />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input id="password" v-model="credentials.password" type="password" required />
      </div>

      <button type="submit" :disabled="isSubmitting" class="submit-btn">Entrar</button>

      <p>
        Não tem uma conta? <router-link to="/register">Criar uma conta</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
/* Estilo para o container de login */
.login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-size: 1rem;
  margin-bottom: 5px;
  color: #444;
}

input {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  margin-top: 5px;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #ff7eb3;
  outline: none;
}

button {
  background: linear-gradient(135deg, #ff7eb3, #ff758c);
  border: none;
  padding: 12px 20px;
  color: white;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s ease;
  margin-top: 20px;
}

button:disabled {
  background: #d1d1d1;
  cursor: not-allowed;
}

button:hover {
  background: linear-gradient(135deg, #ff758c, #ff7eb3);
  transform: scale(1.05);
}

p {
  text-align: center;
  margin-top: 20px;
}

router-link {
  color: #3498db;
  text-decoration: none;
}

router-link:hover {
  text-decoration: underline;
}
</style>
