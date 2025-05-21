import AdmissionDashboard from 'src/pages/AdmissionDashboard.vue';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // {
  //   path: '/',
  //   component: () => import('layouts/MainLayout.vue'),
  //   children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  // },
  {
    path: '/',
    name: 'dashboard',
    component: AdmissionDashboard,
  },
  {
    path: '/patients',
    name: 'patients',
    component: () => import('../pages/PatientManagement.vue'),
  },
  {
    path: '/waiting-room',
    name: 'waitingRoom',
    component: () => import('../pages/WaitingRoom.vue'),
  },
  {
    path: '/appointments',
    name: 'appointments',
    component: () => import('../pages/AppointmentScheduling.vue'),
  },
  {
    path: '/doctors',
    name: 'doctors',
    component: () => import('../pages/DoctorManagement.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
