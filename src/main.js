import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.config.errorHandler = (err) => {
    document.body.innerHTML = `<div style="padding:20px; color:red;">运行时错误: ${err.message}</div>`;
    console.error(err);
}
app.use(createPinia())
app.use(router)
app.mount('#app')
