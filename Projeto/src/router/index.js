import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/useUserStore"; // Importando o store de usuário
import Home from "@/views/HomeView.vue";
import Login from "@/views/LoginView.vue";
import Profile from "@/views/ProfileView.vue";
import SpeakerProfile from "@/views/SpeakerProfileView.vue";
import ProductList from "@/components/ProductList.vue"; // Renomeado de Product para ProductList
import EventDetails from "@/components/EventDetails.vue";
import Register from "@/views/RegisterView.vue";
import Cart from "@/components/Cart.vue";
import Dashboard from "@/views/AdminDashboard.vue";
import AddVolunteer from "@/components/AddVolunteer.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/speaker/:id",
    name: "SpeakerProfile",
    component: SpeakerProfile,
    props: true, // Recebe o parâmetro 'id' da URL
  },
  {
    path: "/event/:id/produtos", // Rota para os produtos de um evento específico
    name: "EventProducts",
    component: ProductList,
    props: true, // Passa o parâmetro 'id' para o componente como prop
  },
  {
    path: "/produtos", // Rota para os produtos de um evento específico
    name: "Products",
    component: ProductList,
    props: true, // Passa o parâmetro 'id' para o componente como prop
  },
  {
    path: "/event/:id", // Detalhes do evento
    name: "EventDetails",
    component: EventDetails,
    props: true, // Passa o parâmetro 'id' para o componente como prop
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/cart",
    name: "Cart",
    component: Cart,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore();

      // Verifica se o usuário está autenticado e tem o papel de admin
      if (userStore.isAuthenticated && userStore.isAdmin) {
        next(); // Permite o acesso ao dashboard
      } else {
        next({ name: "Login" }); // Redireciona para o login se o usuário não for admin
      }
    },
  },
  {
    path: "/event/:id/speaker/:name", // Rota para o perfil do palestrante
    name: "SpeakerProfile",
    component: SpeakerProfile,
  },
  {
    path: "/add-volunteer",
    name: "AddVolunteer",
    component: AddVolunteer,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
