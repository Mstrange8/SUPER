import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/events',
    name: 'Events',
    component: () => import('../views/Events.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/courts',
    name: 'Courts',
    component: () => import('../views/Courts.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/courts/:id',
    name: 'CourtDetail',
    component: () => import('../views/CourtDetail.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('../views/Resources.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/donate',
    name: 'Donate',
    component: () => import('../views/Donate.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/donation-success',
    name: 'DonationSuccess',
    component: () => import('../views/DonationSuccess.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/donation-cancelled',
    name: 'DonationCancelled',
    component: () => import('../views/DonationCancelled.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('../views/Groups.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/groups/:id',
    name: 'GroupDetail',
    component: () => import('../views/GroupDetail.vue'),
    meta: { requiresAuth: false },
  },
  // Additional routes will be added here
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for protected routes
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
