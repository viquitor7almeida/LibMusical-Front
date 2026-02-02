<template>
    <div class="login-container">
        <div 
            class="background-blur"
            :style="{ backgroundImage: 'url(' + BackgroundImage + ')' }"
        ></div>

        <div class="login-content">
            <div class="auth-modal" :class="{ 'register-mode': isRegistering }">
                
                <button v-if="isRegistering" class="back-button" @click="toggleMode">
                    ←
                </button>

                <img :src="libLogo" class="logo"/>
                
                <div v-if="!isRegistering" class="form-section login-section">
                    <form @submit.prevent="handleLogin">
                        <div v-if="errorMessage" class="error-message">
                            {{ errorMessage }}
                        </div>

                        <div class="input-group">
                            <label for="login-email">E-mail</label>
                            <input id="login-email" type="email" v-model="loginData.email" required>
                        </div>

                        <div class="input-group">
                            <label for="login-password">Senha</label>
                            <input id="login-password" type="password" v-model="loginData.password" required>
                        </div>

                        <button type="submit" class="action-button black-button">
                            Entrar
                        </button>
                    </form>
                    
                    <p class="switch-text">
                        Não tem uma conta? 
                        <span @click="toggleMode" class="switch-link">Cadastre-se</span>
                    </p>
                </div>

                <div v-else class="form-section register-section">
                    <form @submit.prevent="handleRegister">
                         <div v-if="errorMessage" class="error-message">
                            {{ errorMessage }}
                        </div>
                        <div v-if="successMessage" class="success-message">
                            {{ successMessage }}
                        </div>

                        <div class="input-group">
                            <label for="reg-name">Nome Completo</label>
                            <input id="reg-name" type="text" v-model="registerData.name" required>
                        </div>

                        <div class="input-group">
                            <label for="reg-email">E-mail</label>
                            <input id="reg-email" type="email" v-model="registerData.email" required>
                        </div>

                        <div class="form-row">
                            <div class="input-group">
                                <label for="reg-pass">Senha</label>
                                <input id="reg-pass" type="password" v-model="registerData.password" required minlength="6">
                            </div>
                             <div class="input-group">
                                <label for="reg-confirm">Confirmar Senha</label>
                                <input id="reg-confirm" type="password" v-model="confirmPassword" required>
                            </div>
                        </div>

                        <button type="submit" class="action-button black-button">
                            Criar Conta
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { saveSession, logout } from '../services/AuthService.js';
import { loginUser, registerUser } from '../services/UserService.js';
import BackgroundImage from '../assets/home.jpg';
import libLogo from '../assets/icon.png'

const router = useRouter();
const isRegistering = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

const loginData = reactive({ email: '', password: '' });
const registerData = reactive({ name: '', email: '', password: '' });
const confirmPassword = ref('');

const toggleMode = () => {
    isRegistering.value = !isRegistering.value;
    errorMessage.value = null;
    successMessage.value = null;
    loginData.password = '';
    registerData.password = '';
    confirmPassword.value = '';
};

const handleLogin = async () => {
    errorMessage.value = null;
    logout();

    try {
        const response = await loginUser(loginData);
        const token = response.token || (response.data && response.data.token);
        
        if (token) {
            // Pegamos o id, name e email que o seu Java deve retornar no JSON
            saveSession(token, { 
                id: response.id, // ESSENCIAL: Certifique-se que o Java envia o id
                name: response.name || "Usuário", 
                email: response.email || loginData.email 
            });
            
            router.push({ name: 'HomePage' });
        } else {
            console.error("Estrutura da resposta:", response);
            errorMessage.value = "Erro na estrutura da resposta do servidor.";
        }
    } catch (error) {
        console.error("Erro no login:", error);
        errorMessage.value = "E-mail ou senha incorretos.";
    }
};

const handleRegister = async () => {
    errorMessage.value = null;
    if (registerData.password !== confirmPassword.value) {
        errorMessage.value = "As senhas não coincidem.";
        return;
    }
    try {
        await registerUser(registerData);
        successMessage.value = "Conta criada com sucesso!";
        setTimeout(() => toggleMode(), 2000);
    } catch (error) {
        errorMessage.value = "Erro ao cadastrar.";
    }
};
</script>

<style scoped>
.login-container {
    position: relative; width: 100vw; height: 100vh; overflow: hidden;
    font-family: 'Inter', sans-serif;
}
.background-blur {
    position: absolute; top: -20px; left: -20px; right: -20px; bottom: -20px;
    background-size: cover; background-position: center; filter: blur(8px);
}
.login-content {
    position: relative; z-index: 10; width: 100%; height: 100%;
    display: flex; justify-content: center; align-items: center;
}
.auth-modal {
    background-color: #5c3d2e8b; padding: 40px; border-radius: 12px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.3);
    width: 90%; max-width: 450px; text-align: center; position: relative;
    transition: all 0.4s ease-in-out; overflow: hidden;
}
.auth-modal.register-mode { max-width: 550px; }
.back-button {
    position: absolute; top: 15px; left: 15px; background: none; border: none;
    font-size: 1.5rem; color: #555; cursor: pointer; transition: color 0.2s;
}
.back-button:hover { color: #000; }
.logo { width: 120px; height: auto; margin: 0 auto 30px auto; display: block; }
.form-section { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.error-message { background-color: #ffebee; color: #c62828; border: 1px solid #c62828; padding: 10px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; }
.success-message { background-color: #e8f5e9; color: #2e7d32; border: 1px solid #2e7d32; padding: 10px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; }
.input-group { margin-bottom: 20px; text-align: left; }
.input-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #ffffff; font-size: 0.9rem; }
.input-group input {
    width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px;
    box-sizing: border-box; font-size: 1rem; transition: border-color 0.3s;
}
.input-group input:focus { outline: none; border-color: #000; }
.form-row { display: flex; gap: 15px; }
.form-row .input-group { flex: 1; }
.action-button {
    width: 100%; padding: 14px; margin-top: 10px; border: none; border-radius: 8px;
    font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: opacity 0.3s;
}
.black-button { background-color: #000; color: white; }
.black-button:hover { opacity: 0.9; }
.switch-text { margin-top: 25px; color: #666; font-size: 0.95rem; }
.switch-link { color: #000; font-weight: 700; cursor: pointer; text-decoration: underline; }
</style>