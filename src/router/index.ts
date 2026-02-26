import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import LoginPage from '../views/LoginPage.vue'
import PerfilPage from '../views/PerfilPage.vue'

const routes = [
  { 
    path: '/', 
    name: 'HomePage', 
    component: Home 
  },
  { 
    path: '/login', 
    name: 'LoginPage', 
    component: LoginPage 
  },

  { 
    path: '/perfil', 
    name: 'PerfilPage', 
    component: PerfilPage 
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router