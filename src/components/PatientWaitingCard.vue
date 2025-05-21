<template>
  <div
    class="patient-card q-pa-sm q-mt-sm"
    :class="[
      patient.urgency === 'Urgent'
        ? 'bg-red-1'
        : patient.waitTime > 15
          ? 'bg-orange-1'
          : 'bg-blue-1',
    ]"
  >
    <q-card>
      <q-card-section class="q-pb-xs">
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-subtitle1 text-weight-bold">{{ patient.name }}</div>
            <div class="text-caption">ID: {{ patient.id }}</div>
          </div>
          <div class="col-auto">
            <q-badge :color="getUrgencyColor(patient.urgency)">
              {{ patient.urgency }}
            </q-badge>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-xs q-pb-xs">
        <div class="row items-center">
          <div class="col-8">
            <div class="text-caption">
              <q-icon name="access_time" size="xs" /> Waiting: {{ patient.waitTime }}m
            </div>
            <div class="text-caption">
              <q-icon name="person" size="xs" />
              {{ patient.type === 'Appointment' ? 'Scheduled' : 'Walk-in' }}
            </div>
          </div>
          <div class="col-4 text-right">
            <div class="text-caption">
              <q-icon name="medical_services" size="xs" />
              {{ shortenDoctorName(patient.doctor) }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat dense size="sm" color="primary" icon="call">
          <q-tooltip>Call Patient</q-tooltip>
        </q-btn>
        <q-btn flat dense size="sm" color="secondary" icon="badge">
          <q-tooltip>Patient Info</q-tooltip>
        </q-btn>
        <q-btn flat dense size="sm" color="accent" icon="send">
          <q-tooltip>Send to Doctor</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps({
  patient: {
    type: Object,
    required: true,
  },
});

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

const shortenDoctorName = (name: string) => {
  if (name === 'Next Available') return name;
  return name.replace('Dr. ', '');
};
</script>

<style lang="scss" scoped>
.patient-card {
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>
