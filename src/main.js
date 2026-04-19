import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import './styles/pages/Home.css'
import './styles/pages/Builder.css'
import './styles/pages/Runner.css'
import './styles/pages/Admin.css'
import './styles/pages/NotFound.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
