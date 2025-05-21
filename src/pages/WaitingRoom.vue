<template>
  <div class="q-pa-md">
    <h5 class="q-mt-none q-mb-md">Sala de Espera</h5>

    <q-list bordered separator>
      <template v-for="patient in waitingPatients" :key="patient.id">
        <q-item
          :class="{
            'bg-red-1': patient.urgency === 'Urgent',
            'bg-orange-1': patient.waitTime > 20 && patient.urgency !== 'Urgent',
          }"
        >
          <q-item-section avatar>
            <q-avatar :color="getAvatarColor(patient)" text-color="white">
              {{ getInitials(patient.name) }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ patient.name }}</q-item-label>
            <q-item-label caption lines="2">
              <div class="row items-center">
                <div>ID: {{ patient.id }}</div>
                <q-separator vertical inset spaced />
                <div>
                  <q-icon name="access_time" size="xs" class="q-mr-xs" />
                  Waiting: {{ patient.waitTime }}m
                </div>
                <q-separator vertical inset spaced />
                <div>
                  <q-badge :color="patient.type === 'Appointment' ? 'primary' : 'accent'" outline>
                    {{ patient.type }}
                  </q-badge>
                </div>
                <div v-if="patient.appointmentTime" class="q-ml-sm">
                  <q-badge color="secondary" outline>
                    {{ patient.appointmentTime }}
                  </q-badge>
                </div>
              </div>
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <div class="text-grey-8 q-gutter-xs">
              <q-badge :color="getUrgencyColor(patient.urgency)">
                {{ patient.urgency }}
              </q-badge>
              <div class="text-caption q-mt-sm">
                {{ patient.doctor }}
              </div>
            </div>
          </q-item-section>

          <q-item-section side>
            <div class="row items-center q-gutter-sm">
              <q-btn
                flat
                round
                size="sm"
                color="primary"
                icon="notifications"
                @click="callPatient(patient)"
              >
                <q-tooltip>Call Patient</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                size="sm"
                color="secondary"
                icon="medical_services"
                @click="assignDoctor(patient)"
              >
                <q-tooltip>Assign Doctor</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

interface WaitingRoomPatient {
  id: string;
  name: string;
  waitTime: number;
  type: 'Appointment' | 'Walk-in';
  appointmentTime?: string;
  urgency: 'Urgent' | 'Medium' | 'Low';
  doctor: string;
}

const $q = useQuasar();

// Datos de ejemplo para probar
const waitingPatients = ref<WaitingRoomPatient[]>([
  {
    id: 'P-1001',
    name: 'Ana García',
    waitTime: 5,
    type: 'Appointment',
    appointmentTime: '09:30',
    urgency: 'Low',
    doctor: 'Dr. Martínez',
  },
  {
    id: 'P-1002',
    name: 'Juan López',
    waitTime: 25,
    type: 'Walk-in',
    urgency: 'Medium',
    doctor: 'Dra. Sánchez',
  },
  {
    id: 'P-1003',
    name: 'María Rodríguez',
    waitTime: 10,
    type: 'Appointment',
    appointmentTime: '10:00',
    urgency: 'Urgent',
    doctor: 'Dr. Fernández',
  },
  {
    id: 'P-1004',
    name: 'Carlos Jiménez',
    waitTime: 15,
    type: 'Walk-in',
    urgency: 'Low',
    doctor: 'Dra. González',
  },
  {
    id: 'P-1005',
    name: 'Sofía Pérez',
    waitTime: 30,
    type: 'Appointment',
    appointmentTime: '10:30',
    urgency: 'Medium',
    doctor: 'Dr. Martínez',
  },
]);

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'Urgent':
      return 'negative';
    case 'Medium':
      return 'warning';
    default:
      return 'primary';
  }
};

const getAvatarColor = (patient: WaitingRoomPatient) => {
  if (patient.urgency === 'Urgent') return 'negative';
  if (patient.waitTime > 20) return 'warning';
  return patient.type === 'Appointment' ? 'primary' : 'accent';
};

const callPatient = (patient: WaitingRoomPatient) => {
  $q.notify({
    message: `Llamando a ${patient.name}`,
    color: 'primary',
    icon: 'notifications',
  });
};

const assignDoctor = (patient: WaitingRoomPatient) => {
  $q.notify({
    message: `Asignando doctor a ${patient.name}`,
    color: 'secondary',
    icon: 'medical_services',
  });
};
</script>

<style lang="scss" scoped>
// Additional styling could be added here if needed
</style>
