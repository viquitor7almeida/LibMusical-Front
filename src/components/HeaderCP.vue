<template>
  <header class="header">
    <div class="icon-group">
      <router-link to="/">
        <img :src="iconSource" alt="Home" class="icon" @mouseover="handleMouseOver" @mouseleave="handleMouseLeave" />
      </router-link>
    </div>

    <ul class="menu">
      <li v-if="!isLoggedIn">
        <router-link to="/login">Entrar</router-link>
      </li>

      <li v-else class="user-menu-container">
        <UserDropdown
          :user-email="userEmail"
          @logout="handleLogout"
        />
      </li>
    </ul>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import libery from '../assets/whiteicon.png';
import liberyopen from '../assets/whiteiconopen.png';
import UserDropdown from './UserDropdownCP.vue';

const router = useRouter();

const isLoggedIn = ref(false);
const userEmail = ref('');
const userRole = ref('');
const iconSource = ref(libery);

const checkAuth = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    isLoggedIn.value = true;
    userEmail.value = user.email || '';
    userRole.value = user.role || '';
  } else {
    isLoggedIn.value = false;
    userEmail.value = '';
    userRole.value = '';
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

const handleLogout = () => {
  logout();
  checkAuth();
  router.push('/login');
};

const handleMouseOver = () => {
  iconSource.value = liberyopen;
};

const handleMouseLeave = () => {
  iconSource.value = libery;
};

onMounted(() => {
  checkAuth();
  window.addEventListener('auth-change', checkAuth);
});

onUnmounted(() => {
  window.removeEventListener('auth-change', checkAuth);
});
</script>

<style scoped>
.header {
  padding: 15px 20px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  border-bottom: 2px solid #ffffff;
  position: relative;
  z-index: 100;
}

.icon-group {
  display: flex;
  gap: 25px;
  grid-column: 1;
  justify-self: start;
  padding-left: 20px;
}

.icon {
  height: 50px;
  width: auto;
  cursor: pointer;
  /* A transição agora é controlada pelo JS/Vue ao mudar a src,
     então removemos o 'transition: opacity 0.2s;' daqui
     e mantemos apenas para o efeito de opacidade. */
  transition: opacity 0.2s;
}

.icon:hover {
  opacity: 0.7;
}

.menu {
  display: flex;
  gap: 30px;
  list-style: none;
  margin: 0;
  padding: 0;
  padding-right: 20px;
  align-items: center;
  grid-column: 3;
  justify-self: end;
}

.menu li a {
  position: relative;
  color: #ffffff;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 1.1rem;
  padding-bottom: 3px;
  transition: color 0.3s ease;
}

.menu li > a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 0;
  background-color: #ffffff;
  transition: width 0.3s ease;
}

.menu li > a:hover::after {
  width: 100%;
}

.user-menu-container {
  position: relative;
}

.slide-navbar-enter-active,
.slide-navbar-leave-active {
  transition: all 0.3s ease-out;
}

.slide-navbar-enter-from,
.slide-navbar-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-navbar-enter-to,
.slide-navbar-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>