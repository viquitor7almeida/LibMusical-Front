<template>
  <div class="dropdown-wrapper" ref="wrapper">
    <div class="user-icon-wrapper" @click="toggle">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
        class="icon user-icon">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>

    <transition name="fade">
      <div v-if="open" class="user-dropdown">
        <div class="dropdown-arrow"></div>

        <div class="user-info">
          <p class="user-greeting">Olá!</p>
          <p class="user-email" :title="userEmail">{{ userEmail }}</p>
        </div>

        <hr />

        <router-link to="/perfil" class="dropdown-item" @click="close">
          Visualizar Perfil
        </router-link>

        <hr />

        <button @click="onLogout" class="dropdown-item logout-button">
          Sair
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
const props = defineProps({
  userEmail: { type: String, default: '' },
});
const emit = defineEmits(['logout']);

const open = ref(false);
const wrapper = ref(null);

const toggle = () => {
  open.value = !open.value;
};

const close = () => {
  open.value = false;
};

const onLogout = () => {
  emit('logout');
  close();
};

const handleClickOutside = (e) => {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch(open, (v) => {
});
</script>

<style scoped>

.user-icon-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.user-icon-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.user-dropdown {
  position: absolute;
  top: 130%;
  right: -10px;
  width: 260px;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 8px 0;
  z-index: 1000;
  text-align: left;
}

.dropdown-arrow {
  position: absolute;
  top: -6px;
  right: 20px;
  width: 12px;
  height: 12px;
  background-color: #fff;
  border-top: 1px solid #e5e5e5;
  border-left: 1px solid #e5e5e5;
  transform: rotate(45deg);
}

.user-info {
  padding: 15px 20px;
}

.user-greeting {
  margin: 0;
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.user-email {
  margin: 5px 0 0 0;
  font-size: 0.9rem;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-dropdown hr {
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 8px 0;
}

.dropdown-item {
  display: block;
  padding: 12px 20px;
  color: #444;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.dropdown-item:hover {
  background-color: #f9f9f9;
  color: #000;
}

.user-dropdown a::after {
  display: none;
}

.admin-link {
  color: #0056b3;
  font-weight: 500;
}

.admin-link:hover {
  background-color: #eef6fc;
  color: #004494;
}

.logout-button {
  color: #d93025;
  font-weight: 500;
}

.logout-button:hover {
  background-color: #fff5f5;
  color: #c62828;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
