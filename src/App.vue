<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <div class="text-weight-bold">OphthalmoClinic</div>
          <div class="text-subtitle2">Admission Module</div>
        </q-toolbar-title>

        <q-space />

        <q-btn-group flat>
          <q-btn flat round dense icon="notifications">
            <q-badge color="accent" floating>2</q-badge>
          </q-btn>
          <q-btn flat round dense icon="person" />
        </q-btn-group>
      </q-toolbar>

      <q-tabs
        v-model="tab"
        class="bg-primary text-white shadow-2"
        align="left"
        narrow-indicator
        dense
      >
        <q-route-tab name="dashboard" to="/" label="Dashboard" icon="dashboard" />
        <q-route-tab name="waitingRoom" to="/waiting-room" label="Waiting Room" icon="people" />
        <q-route-tab name="appointments" to="/appointments" label="Appointments" icon="event" />
        <q-route-tab name="patients" to="/patients" label="Patients" icon="folder_shared" />
        <q-route-tab name="doctors" to="/doctors" label="Doctors" icon="medical_services" />
      </q-tabs>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-grey-8"> Quick Actions </q-item-label>

        <q-item clickable v-ripple @click="openCheckInDialog">
          <q-item-section avatar>
            <q-icon name="add_circle" color="primary" />
          </q-item-section>
          <q-item-section>Check-in Patient</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="openNewAppointmentDialog">
          <q-item-section avatar>
            <q-icon name="event_available" color="secondary" />
          </q-item-section>
          <q-item-section>New Appointment</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/waiting-room">
          <q-item-section avatar>
            <q-icon name="people" color="accent" />
          </q-item-section>
          <q-item-section>Manage Waiting Room</q-item-section>
        </q-item>

        <q-separator />

        <q-item-label header class="text-grey-8"> Daily Status </q-item-label>

        <q-item>
          <q-item-section>
            <q-item-label>Appointments Today</q-item-label>
            <q-item-label caption>28 scheduled</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge color="primary" outline>28</q-badge>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label>Walk-ins</q-item-label>
            <q-item-label caption>5 patients</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge color="accent" outline>5</q-badge>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label>Doctors Available</q-item-label>
            <q-item-label caption>3 of 4</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge color="positive" outline>3</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>

  <!-- Quick Check-in Dialog -->
  <q-dialog v-model="checkInDialogOpen" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center">
        <div class="text-h6">Patient Check-in</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-tabs v-model="checkInTab" class="text-primary">
          <q-tab name="appointment" label="Scheduled" icon="event" />
          <q-tab name="walkin" label="Walk-in" icon="person_add" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="checkInTab" animated>
          <q-tab-panel name="appointment">
            <q-input v-model="searchAppointment" label="Search by name or ID" outlined dense>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <div class="q-pa-md">
              <q-list bordered separator>
                <q-item v-for="n in 3" :key="n" clickable v-ripple>
                  <q-item-section>
                    <q-item-label>John Doe</q-item-label>
                    <q-item-label caption>ID: P-{{ 1000 + n }} • 10:{{ 15 + n }} AM</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn size="sm" color="primary" label="Check-in" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-tab-panel>

          <q-tab-panel name="walkin">
            <q-input v-model="patientId" label="Patient ID" outlined dense class="q-mb-sm">
              <template v-slot:prepend>
                <q-icon name="badge" />
              </template>
            </q-input>
            <q-input v-model="patientName" label="Patient Name" outlined dense class="q-mb-sm">
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
            <q-select
              v-model="urgencyLevel"
              :options="['Normal', 'Urgent', 'Emergency']"
              label="Urgency Level"
              outlined
              dense
              class="q-mb-md"
            />
            <q-btn color="primary" label="Add to Waiting List" class="full-width" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- New Appointment Dialog -->
  <q-dialog v-model="appointmentDialogOpen" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <div class="text-h6">Schedule Appointment</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input v-model="appointmentPatient" label="Patient" outlined dense class="q-mb-sm">
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-select
          v-model="appointmentDoctor"
          :options="['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Rodriguez']"
          label="Doctor"
          outlined
          dense
          class="q-mb-sm"
        />
        <q-input
          v-model="appointmentDate"
          label="Date"
          outlined
          dense
          class="q-mb-sm"
          type="date"
        />
        <q-input
          v-model="appointmentTime"
          label="Time"
          outlined
          dense
          class="q-mb-sm"
          type="time"
        />
        <q-select
          v-model="appointmentType"
          :options="['Initial Consultation', 'Follow-up', 'Eye Exam', 'Procedure']"
          label="Appointment Type"
          outlined
          dense
          class="q-mb-md"
        />
        <q-btn color="secondary" label="Schedule Appointment" class="full-width" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tab = ref('dashboard');
const leftDrawerOpen = ref(false);
const checkInDialogOpen = ref(false);
const appointmentDialogOpen = ref(false);
const checkInTab = ref('appointment');

// Check-in form data
const searchAppointment = ref('');
const patientId = ref('');
const patientName = ref('');
const urgencyLevel = ref('Normal');

// Appointment form data
const appointmentPatient = ref('');
const appointmentDoctor = ref('');
const appointmentDate = ref('');
const appointmentTime = ref('');
const appointmentType = ref('');

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const openCheckInDialog = () => {
  checkInDialogOpen.value = true;
};

const openNewAppointmentDialog = () => {
  appointmentDialogOpen.value = true;
};
</script>

<style lang="scss">
// Global styles can be added here
</style>
