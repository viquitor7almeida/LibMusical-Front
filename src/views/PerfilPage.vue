<template>
  <div class="profile-container">
    <div class="top-nav">
      <button @click="$router.push('/')" class="back-link">« Voltar para a Biblioteca</button>
    </div>

    <div class="profile-book">
      <div class="paper">
        <div class="spine-shadow"></div>
        
        <div class="profile-header">
          <span class="ink-icon">✒️</span>
          <h2>Perfil do Compositor</h2>
          <p class="subtitle">Identidade e Segurança do Manuscrito</p>
        </div>

        <div v-if="!isEditing" class="profile-info">
          <div class="info-item">
            <span class="label">Nome Artístico</span>
            <span class="value">{{ form.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">E-mail de Registro</span>
            <span class="value">{{ form.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">Status das Credenciais</span>
            <span class="value">Protegido por Criptografia</span>
          </div>
          
          <div class="form-actions">
            <button @click="startEditing" class="action-btn">Editar Informações</button>
          </div>
        </div>

        <form v-else @submit.prevent="handleUpdate" class="profile-form" autocomplete="off">
          <div class="form-group">
            <label>Nome Artístico</label>
            <input v-model="editForm.name" type="text" />
          </div>

          <div class="form-group">
            <label>E-mail (Inalterável)</label>
            <input :value="form.email" type="email" disabled class="disabled-input" />
          </div>

          <hr class="divider" />

          <div class="form-group">
            <label>Nova Senha</label>
            <input 
              v-model="editForm.newPassword" 
              type="password" 
              placeholder="Deixe em branco para não alterar"
              autocomplete="new-password" 
            />
          </div>

          <div class="form-group">
            <label>Confirmar Nova Senha</label>
            <input 
              v-model="editForm.confirmPassword" 
              type="password"
              autocomplete="new-password" 
            />
          </div>

          <div class="form-actions-edit">
            <button type="button" @click="cancelEdit" class="cancel-btn" :disabled="loading">Cancelar</button>
            <button type="submit" :disabled="loading" class="save-btn">
              {{ loading ? 'Gravando...' : 'Confirmar Mudanças' }}
            </button>
          </div>
        </form>

        <transition name="fade">
          <div v-if="message" :class="['status-message', messageType]">
            {{ message }}
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { getUser, getUserId, saveSession, getToken } from '../services/AuthService.js';
import { updateUserProfile } from '../services/UserService.js';

export default {
  name: 'ProfileView',
  data() {
    return {
      isEditing: false,
      loading: false,
      message: '',
      messageType: '',
      form: { name: '', email: '' },
      editForm: {
        name: '',
        newPassword: '',
        confirmPassword: ''
      }
    };
  },
  methods: {
    initData() {
      const user = getUser();
      if (user) {
        this.form.name = user.name;
        this.form.email = user.email;
      }
    },
    startEditing() {
      this.editForm = {
        name: this.form.name,
        newPassword: '',
        confirmPassword: ''
      };
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    async handleUpdate() {
      if (this.editForm.newPassword && this.editForm.newPassword !== this.editForm.confirmPassword) {
        this.setStatus('As novas senhas não coincidem', 'error');
        return;
      }

      this.loading = true;
      try {
        const userId = getUserId();
        const payload = { 
          name: this.editForm.name,
          email: this.form.email,
          password: this.editForm.newPassword
        };
        
        const updatedUser = await updateUserProfile(userId, payload);
        saveSession(getToken(), updatedUser);
        
        this.form.name = updatedUser.name;
        this.setStatus('Perfil atualizado!', 'success');
        this.isEditing = false;
      } catch (error) {
        this.setStatus('Erro ao processar atualização', 'error');
      } finally {
        this.loading = false;
      }
    },
    setStatus(msg, type) {
      this.message = msg;
      this.messageType = type;
      setTimeout(() => this.message = '', 3000);
    }
  },
  mounted() {
    this.initData();
  }
};
</script>

<style scoped>
.profile-container { 
  max-width: 850px; 
  margin: 40px auto; 
  perspective: 1000px; 
}

.top-nav {
  margin-bottom: 15px;
}

.back-link {
  background: none;
  border: none;
  color: #a68b6d;
  font-family: 'Crimson Text', serif;
  font-size: 1.1rem;
  cursor: pointer;
  transition: color 0.3s;
}

.back-link:hover {
  color: #d1c5a5;
}

.profile-book { 
  background: #1a120b; 
  padding: 15px 15px 15px 35px; 
  border-radius: 5px 15px 15px 5px; 
  box-shadow: 15px 15px 40px rgba(0,0,0,0.6); 
}

.paper { 
  background: #2c241e; 
  padding: 60px; 
  border-radius: 2px 10px 10px 2px; 
  position: relative; 
  min-height: 600px; 
  font-family: 'Crimson Text', serif; 
}

.spine-shadow { 
  position: absolute; 
  left: 0; top: 0; bottom: 0; width: 40px; 
  background: linear-gradient(90deg, rgba(0,0,0,0.4) 0%, transparent 100%); 
  pointer-events: none; 
}

.profile-header { text-align: center; margin-bottom: 50px; }
.ink-icon { font-size: 2.2rem; filter: sepia(1); opacity: 0.6; }
h2 { color: #d1c5a5; font-variant: small-caps; letter-spacing: 3px; font-size: 2rem; margin: 15px 0 5px 0; }
.subtitle { color: #6e6448; font-style: italic; font-size: 1rem; }

.profile-info { display: flex; flex-direction: column; gap: 30px; max-width: 500px; margin: 0 auto; }
.info-item { display: flex; flex-direction: column; border-bottom: 1px solid rgba(74, 63, 53, 0.4); padding-bottom: 12px; }
.info-item .label { color: #a68b6d; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; }
.info-item .value { color: #e0d8c3; font-size: 1.3rem; margin-top: 6px; }

.profile-form { display: flex; flex-direction: column; gap: 20px; max-width: 500px; margin: 0 auto; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
label { color: #a68b6d; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
input { background: rgba(0, 0, 0, 0.3); border: 1px solid #4a3f35; padding: 12px; color: #e0d8c3; border-radius: 4px; font-size: 1rem; }
input:focus { outline: none; border-color: #d1c5a5; background: rgba(0, 0, 0, 0.4); }
.disabled-input { background: rgba(0, 0, 0, 0.15); color: #6e6448; cursor: not-allowed; border-style: dashed; }
.divider { border: 0; border-top: 1px solid rgba(74, 63, 53, 0.4); margin: 15px 0; }

.form-actions { margin-top: 30px; text-align: center; }
.form-actions-edit { display: flex; gap: 15px; margin-top: 30px; }

.action-btn, .save-btn { 
  background: #3d3128; 
  color: #d1c5a5; 
  border: 1px solid #4a3f35; 
  padding: 14px; 
  cursor: pointer; 
  font-weight: bold; 
  text-transform: uppercase; 
  transition: 0.3s;
  letter-spacing: 1px;
}

.cancel-btn { 
  flex: 1; 
  background: transparent; 
  color: #6e6448; 
  border: 1px solid #4a3f35; 
  padding: 14px;
  cursor: pointer; 
  text-transform: uppercase;
}

.save-btn { flex: 2; }
.action-btn:hover, .save-btn:hover:not(:disabled) { background: #4a3f35; color: #fff; }
.cancel-btn:hover { border-color: #b36b6b; color: #b36b6b; }

.status-message { margin-top: 25px; text-align: center; font-style: italic; font-size: 1rem; }
.success { color: #8fa37d; }
.error { color: #b36b6b; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>