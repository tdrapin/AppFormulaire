import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'
import './styles/main.css'
import './styles/app-shell.css'

const app = createApp(App)

app.use(router)

// Initialiser l'authentification avant de monter l'application
const { initAuth } = useAuth()
initAuth().then(() => {
  app.mount('#app')
})
