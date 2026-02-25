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
        <div class="avatar-clean-wrapper" @click="toggleDropdown">
          <img :src="avatarIcon" alt="User Profile" class="avatar-png" />
          <span class="chevron" :class="{ 'rotate': isDropdownOpen }">▾</span>
        </div>

        <transition name="dropdown-anim">
          <div v-if="isDropdownOpen" class="custom-dropdown">
            <div class="dropdown-info">
              <span class="user-label">Sessão ativa</span>
              <div class="dropdown-header">{{ userEmail }}</div>
            </div>
            
            <div class="dropdown-divider"></div>

            <router-link to="/perfil" class="dropdown-item" @click="isDropdownOpen = false">
              <span class="item-text">Perfil</span>
              <span class="item-arrow">→</span>
            </router-link>
            
            <button class="dropdown-item logout-btn" @click="handleLogout">
              <span class="item-text">Sair</span>
              <span class="item-arrow">→</span>
            </button>
          </div>
        </transition>
      </li>
    </ul>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getUser, logout as authLogout, isAuthenticated } from '../services/AuthService.js'; 

import libery from '../assets/whiteicon.png';
import liberyopen from '../assets/whiteiconopen.png';
import avatarIcon from '../assets/avatar.png';

const router = useRouter();

const isLoggedIn = ref(false);
const userEmail = ref('');
const iconSource = ref(libery);
const isDropdownOpen = ref(false);

const checkAuth = () => {
  const user = getUser();
  const auth = isAuthenticated();
  
  if (auth && user) {
    isLoggedIn.value = true;
    userEmail.value = user.email || '';
  } else {
    isLoggedIn.value = false;
    userEmail.value = '';
  }
};

const toggleDropdown = (event) => {
  event.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const handleLogout = () => {
  authLogout();
  checkAuth();
  isDropdownOpen.value = false;
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
  window.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener('auth-change', checkAuth);
  window.removeEventListener('click', closeDropdown);
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
  z-index: 1000;
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

.menu li {
  position: relative;
  display: flex;
  align-items: center;
}

.menu li > a:not(.dropdown-item) {
  position: relative;
  color: #ffffff;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 1.1rem;
  padding-bottom: 3px;
  transition: color 0.3s ease;
}

.user-menu-container {
  position: relative;
}

.avatar-clean-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-clean-wrapper:hover {
  transform: translateY(-2px);
}

.avatar-png {
  height: 42px;
  width: auto;
  display: block;
}

.chevron {
  color: #fff;
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.chevron.rotate {
  transform: rotate(180deg);
}

.custom-dropdown {
  position: absolute;
  top: calc(100% + 20px);
  right: 0;
  background-color: #000000;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 240px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8);
  padding: 10px;
  z-index: 1100;
  overflow: hidden;
}

.dropdown-info {
  padding: 12px 15px;
}

.user-label {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 1px;
  margin-bottom: 4px;
  font-family: 'Inter', sans-serif;
}

.dropdown-header {
  color: #ffffff;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  word-break: break-all;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 15px;
  color: #ffffff !important;
  text-decoration: none !important;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.item-text {
  transition: transform 0.3s ease;
  display: inline-block;
}

.dropdown-item:hover .item-text {
  transform: translateX(3px);
}

.item-arrow {
  opacity: 0;
  transform: translateX(-15px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.dropdown-item:hover .item-arrow {
  opacity: 1;
  transform: translateX(0);
}

.logout-btn {
  color: #ff4d4d !important;
}

.logout-btn:hover {
  background-color: rgba(255, 77, 77, 0.1);
}

.dropdown-anim-enter-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.dropdown-anim-leave-active {
  transition: all 0.15s ease-in;
}

.dropdown-anim-enter-from,
.dropdown-anim-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>