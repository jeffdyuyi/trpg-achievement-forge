import { createRouter, createWebHashHistory } from 'vue-router'
import ForgeView from '../views/ForgeView.vue'
import ShowcaseView from '../views/ShowcaseView.vue'

const routes = [
    {
        path: '/',
        name: 'forge',
        component: ForgeView
    },
    {
        path: '/showcase',
        name: 'showcase',
        component: ShowcaseView
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
