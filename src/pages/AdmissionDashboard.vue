<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <h4 class="q-my-md">
          <q-icon name="dashboard" size="sm" class="q-mr-sm" />
          Reception Dashboard
        </h4>
      </div>

      <!-- Stats Cards -->
      <div class="col-12 col-md-3">
        <q-card class="dashboard-card bg-primary text-white">
          <q-card-section>
            <div class="text-h6">Today's Appointments</div>
            <div class="text-h3">28</div>
          </q-card-section>
          <q-card-actions>
            <q-btn flat color="white" label="View All" to="/appointments" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="dashboard-card bg-accent text-white">
          <q-card-section>
            <div class="text-h6">Waiting Room</div>
            <div class="text-h3">7</div>
          </q-card-section>
          <q-card-actions>
            <q-btn flat color="white" label="Manage" to="/waiting-room" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="dashboard-card bg-secondary text-white">
          <q-card-section>
            <div class="text-h6">Available Doctors</div>
            <div class="text-h3">3/4</div>
          </q-card-section>
          <q-card-actions>
            <q-btn flat color="white" label="View Status" to="/doctors" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="dashboard-card bg-info text-white">
          <q-card-section>
            <div class="text-h6">Avg. Wait Time</div>
            <div class="text-h3">14m</div>
          </q-card-section>
          <q-card-actions>
            <q-btn flat color="white" label="Details" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12 col-md-4">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Quick Actions</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-list>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon color="primary" name="person_add" />
                </q-item-section>
                <q-item-section>Check-in Patient</q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon color="secondary" name="event_available" />
                </q-item-section>
                <q-item-section>New Appointment</q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon color="accent" name="call" />
                </q-item-section>
                <q-item-section>Log Patient Call</q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon color="info" name="print" />
                </q-item-section>
                <q-item-section>Print Daily Schedule</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Next Appointments -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section class="row items-center">
            <div class="text-h6">Upcoming Appointments</div>
            <q-space />
            <q-btn flat color="primary" icon="refresh" round dense />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <q-table
              dense
              :rows="upcomingAppointments"
              :columns="appointmentColumns"
              row-key="id"
              :pagination="{ rowsPerPage: 5 }"
              :loading="loading"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="time" :props="props">{{ props.row.time }}</q-td>
                  <q-td key="patientName" :props="props">{{ props.row.patientName }}</q-td>
                  <q-td key="doctorName" :props="props">{{ props.row.doctorName }}</q-td>
                  <q-td key="status" :props="props">
                    <q-badge :color="getStatusColor(props.row.status)">
                      {{ props.row.status }}
                    </q-badge>
                  </q-td>
                  <q-td key="actions" :props="props">
                    <q-btn
                      size="sm"
                      color="primary"
                      dense
                      flat
                      icon="check_circle"
                      @click="checkInPatient(props.row)"
                    >
                      <q-tooltip>Check In</q-tooltip>
                    </q-btn>
                    <q-btn
                      size="sm"
                      color="info"
                      dense
                      flat
                      icon="edit"
                      @click="editAppointment(props.row)"
                    >
                      <q-tooltip>Edit</q-tooltip>
                    </q-btn>
                    <q-btn
                      size="sm"
                      color="negative"
                      dense
                      flat
                      icon="cancel"
                      @click="cancelAppointment(props.row)"
                    >
                      <q-tooltip>Cancel</q-tooltip>
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Waiting Room Status -->
      <div class="col-12">
        <q-card>
          <q-card-section class="row items-center">
            <div class="text-h6">Waiting Room Status</div>
            <q-space />
            <q-btn to="/waiting-room" color="primary" label="Manage Waiting Room" />
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div v-for="(patient, index) in waitingPatients" :key="index" class="col-12 col-md-3">
                <patient-waiting-card :patient="patient" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PatientWaitingCard from '../components/PatientWaitingCard.vue';
import { type QTableColumn, useQuasar } from 'quasar';

const $q = useQuasar();
const loading = ref(false);

// Sample data
const upcomingAppointments = ref([
  {
    id: 1,
    time: '10:00 AM',
    patientName: 'John Doe',
    doctorName: 'Dr. Sarah Johnson',
    status: 'Scheduled',
  },
  {
    id: 2,
    time: '10:15 AM',
    patientName: 'Maria Garcia',
    doctorName: 'Dr. Michael Chen',
    status: 'Checked In',
  },
  {
    id: 3,
    time: '10:30 AM',
    patientName: 'Robert Smith',
    doctorName: 'Dr. Sarah Johnson',
    status: 'Scheduled',
  },
  {
    id: 4,
    time: '10:45 AM',
    patientName: 'Susan Williams',
    doctorName: 'Dr. Emily Rodriguez',
    status: 'Scheduled',
  },
  {
    id: 5,
    time: '11:00 AM',
    patientName: 'James Brown',
    doctorName: 'Dr. Michael Chen',
    status: 'Scheduled',
  },
]);

const waitingPatients = ref([
  {
    id: 'P-1002',
    name: 'Maria Garcia',
    waitTime: 12,
    type: 'Appointment',
    doctor: 'Dr. Michael Chen',
    urgency: 'Normal',
  },
  {
    id: 'P-1007',
    name: 'David Wilson',
    waitTime: 5,
    type: 'Walk-in',
    doctor: 'Next Available',
    urgency: 'Normal',
  },
  {
    id: 'P-1010',
    name: 'Lisa Taylor',
    waitTime: 25,
    type: 'Appointment',
    doctor: 'Dr. Emily Rodriguez',
    urgency: 'Normal',
  },
  {
    id: 'P-1015',
    name: 'Ahmed Hassan',
    waitTime: 8,
    type: 'Walk-in',
    doctor: 'Next Available',
    urgency: 'Urgent',
  },
]);

const appointmentColumns: QTableColumn[] = [
  { name: 'time', label: 'Time', field: 'time', sortable: true, align: 'left' },
  { name: 'patientName', label: 'Patient', field: 'patientName', sortable: true, align: 'left' },
  { name: 'doctorName', label: 'Doctor', field: 'doctorName', sortable: true, align: 'left' },
  { name: 'status', label: 'Status', field: 'status', sortable: true, align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'primary';
    case 'Checked In':
      return 'secondary';
    case 'With Doctor':
      return 'accent';
    case 'Completed':
      return 'positive';
    case 'Cancelled':
      return 'negative';
    default:
      return 'grey';
  }
};

type AppointmentRow = {
  id: number;
  time: string;
  patientName: string;
  doctorName: string;
  status: string;
};

const checkInPatient = (row: AppointmentRow) => {
  if (row.status === 'Scheduled') {
    row.status = 'Checked In';

    $q.notify({
      color: 'positive',
      message: `${row.patientName} checked in successfully`,
      icon: 'check_circle',
    });
  }
};

const editAppointment = (row: AppointmentRow) => {
  // Implementation would go here
  $q.notify({
    color: 'info',
    message: `Editing appointment for ${row.patientName}`,
    icon: 'edit',
  });
};

const cancelAppointment = (row: AppointmentRow) => {
  $q.dialog({
    title: 'Confirm Cancellation',
    message: `Are you sure you want to cancel ${row.patientName}'s appointment?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    row.status = 'Cancelled';
    $q.notify({
      color: 'negative',
      message: `Appointment for ${row.patientName} cancelled`,
      icon: 'cancel',
    });
  });
};

onMounted(() => {
  loading.value = true;
  // Simulate API call
  setTimeout(() => {
    loading.value = false;
  }, 800);
});
</script>

<style lang="scss" scoped>
.dashboard-card {
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
}
</style>
