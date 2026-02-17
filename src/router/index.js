import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/universo', name: 'universo', component: () => import('../views/UniversoView.vue') },
        { path: '/carreira', name: 'carreira', component: () => import('../views/CarreiraView.vue') },
        { path: '/premios', name: 'premios', component: () => import('../views/PremiosView.vue') },
        { path: '/rankings', name: 'rankings', component: () => import('../views/RankingsView.vue') },
        { path: '/backup', name: 'backup', component: () => import('../views/BackupView.vue') },
        { path: '/season/:id', name: 'season-detail', component: () => import('../views/SeasonDetailView.vue') },
        { path: '/competicao/:id/historico', name: 'competition-history', component: () => import('../views/CompetitionHistoryView.vue') },
        { path: '/pais/:id/historico', name: 'country-history', component: () => import('../views/CountryHistoryView.vue') },
        { path: '/pais/:id/matriz', name: 'country-matrix', component: () => import('../views/CountrySeasonMatrixView.vue') },
        { path: '/checklist', name: 'season-checklist', component: () => import('../views/SeasonChecklistView.vue') },
        { path: '/sala-de-trofeus', name: 'trophy-room', component: () => import('../views/TrophyRoomView.vue') },
    ],
});

export default router;
