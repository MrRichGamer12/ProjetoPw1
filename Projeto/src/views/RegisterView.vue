<script setup>
import { reactive, ref } from 'vue';
import { useUserStore } from '@/stores/useUserStore';
import { useRouter } from 'vue-router';

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const isSubmitting = ref(false); // Estado para desabilitar o botão durante o envio
const userStore = useUserStore();
const router = useRouter();

const register = async () => {
  // Validação para verificar se as senhas coincidem
  if (form.password.trim() !== form.confirmPassword.trim()) {
    alert("As senhas não coincidem!");
    return;
  }

  // Evitar múltiplos envios do formulário
  isSubmitting.value = true;

  try {
    const response = await userStore.register(form.name, form.email, form.password);
    if (response.success) {
      router.push('/login'); // Redireciona para a página de login após o cadastro
    } else {
      alert(response.message); // Exibe erro caso o registro falhe
    }
  } catch (error) {
    console.error('Erro ao tentar registrar:', error);
    alert('Ocorreu um erro inesperado. Tente novamente mais tarde.');
  } finally {
    // Restaura o estado após a requisição
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="register-container">
    <h2>Criar Conta</h2>
    <form @submit.prevent="register" class="register-form">
      <div class="form-group">
        <label for="name">Nome:</label>
        <input id="name" v-model="form.name" type="text" required />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" v-model="form.email" type="email" required />
      </div>

      <div class="form-group">
        <label for="password">Senha:</label>
        <input id="password" v-model="form.password" type="password" required />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirmar Senha:</label>
        <input id="confirmPassword" v-model="form.confirmPassword" type="password" required />
      </div>

      <!-- Botão de envio, desabilitado enquanto o formulário está sendo enviado -->
      <button type="submit" :disabled="isSubmitting" class="submit-btn">Criar Conta</button>

      <p>
        Já tem uma conta? <router-link to="/login">Fazer login</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
/* Estilos gerais do formulário de registro */
.register-container {
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

.register-form {
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
