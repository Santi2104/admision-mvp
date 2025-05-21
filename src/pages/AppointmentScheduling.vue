<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <h4 class="q-my-md">
          <q-icon name="event" size="sm" class="q-mr-sm" />
          Appointment Scheduling
        </h4>
      </div>

      <!-- Calendar and Form Section -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-tabs
            v-model="viewType"
            class="text-primary"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="day" label="Day" icon="view_day" />
            <q-tab name="week" label="Week" icon="view_week" />
            <q-tab name="month" label="Month" icon="calendar_month" />
            <q-tab name="list" label="List" icon="view_list" />
          </q-tabs>

          <q-separator />

          <q-card-section class="q-pa-md">
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">{{ calendarTitle }}</div>
              </div>
              <div class="col-auto">
                <q-btn-group flat>
                  <q-btn icon="chevron_left" flat dense @click="navigateCalendar('prev')" />
                  <q-btn label="Today" flat dense @click="navigateCalendar('today')" />
                  <q-btn icon="chevron_right" flat dense @click="navigateCalendar('next')" />
                </q-btn-group>
              </div>
            </div>

            <!-- Placeholder for Calendar - In a real app, this would be a full calendar component -->
            <div class="calendar-container">
              <!-- Day View -->
              <div v-if="viewType === 'day'" class="calendar-day-view">
                <div class="row justify-between items-center q-mb-md">
                  <div class="text-subtitle1">{{ formatDate(selectedDate) }}</div>
                  <q-btn
                    color="secondary"
                    label="Add Appointment"
                    @click="openNewAppointmentDialog"
                  />
                </div>

                <div class="time-slots">
                  <div v-for="hour in officeHours" :key="hour" class="time-slot">
                    <div class="time-label">{{ formatHour(hour) }}</div>
                    <div class="time-content">
                      <div
                        v-for="appt in getAppointmentsForTime(hour)"
                        :key="appt.id"
                        class="appointment-card q-pa-sm q-ml-md"
                        :class="getAppointmentClass(appt)"
                      >
                        <div class="text-weight-medium">{{ appt.patientName }}</div>
                        <div class="text-caption">{{ appt.type }} • {{ appt.doctor }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Week View -->
              <div v-if="viewType === 'week'" class="calendar-week-view">
                <div class="text-subtitle1 q-mb-md">
                  Week view placeholder - would show a full week calendar
                </div>
                <div class="week-container bg-blue-1 q-pa-md text-center">
                  In a complete implementation, this would show a week view with all days and
                  appointments
                </div>
              </div>

              <!-- Month View -->
              <div v-if="viewType === 'month'" class="calendar-month-view">
                <div class="text-subtitle1 q-mb-md">
                  Month view placeholder - would show a full month calendar
                </div>
                <div class="month-container bg-blue-1 q-pa-md text-center">
                  In a complete implementation, this would show a month view with all days and
                  appointment indicators
                </div>
              </div>

              <!-- List View -->
              <div v-if="viewType === 'list'" class="calendar-list-view">
                <q-list separator>
                  <q-item-label header>Upcoming Appointments</q-item-label>
                  <q-item
                    v-for="appt in sortedAppointments"
                    :key="appt.id"
                    clickable
                    v-ripple
                    :class="{ 'bg-red-1': appt.isUrgent }"
                  >
                    <q-item-section avatar>
                      <q-avatar :color="getAvatarColor(appt)">
                        {{ getPatientInitials(appt.patientName) }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ appt.patientName }}</q-item-label>
                      <q-item-label caption>
                        {{ formatTime(appt.time) }} • {{ appt.type }} • {{ appt.doctor }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn-group flat>
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="edit"
                          @click.stop="editAppointment(appt)"
                        >
                          <q-tooltip>Edit</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="delete"
                          @click.stop="confirmDeleteAppointment(appt)"
                        >
                          <q-tooltip>Cancel</q-tooltip>
                        </q-btn>
                      </q-btn-group>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions and Stats -->
      <div class="col-12 col-md-4">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Quick Actions</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-list>
              <q-item clickable v-ripple @click="openNewAppointmentDialog">
                <q-item-section avatar>
                  <q-icon color="primary" name="add_circle" />
                </q-item-section>
                <q-item-section>New Appointment</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="findNextAvailable">
                <q-item-section avatar>
                  <q-icon color="secondary" name="search" />
                </q-item-section>
                <q-item-section>Find Next Available Slot</q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon color="accent" name="print" />
                </q-item-section>
                <q-item-section>Print Schedule</q-item-section>
              </q-item>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon color="info" name="send" />
                </q-item-section>
                <q-item-section>Send Reminders</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Today's Schedule</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-card class="bg-primary text-white text-center q-pa-sm">
                  <div class="text-h4">{{ todayStats.total }}</div>
                  <div class="text-caption">Total</div>
                </q-card>
              </div>
              <div class="col-6">
                <q-card class="bg-positive text-white text-center q-pa-sm">
                  <div class="text-h4">{{ todayStats.completed }}</div>
                  <div class="text-caption">Completed</div>
                </q-card>
              </div>
              <div class="col-6">
                <q-card class="bg-warning text-white text-center q-pa-sm">
                  <div class="text-h4">{{ todayStats.waiting }}</div>
                  <div class="text-caption">Waiting</div>
                </q-card>
              </div>
              <div class="col-6">
                <q-card class="bg-negative text-white text-center q-pa-sm">
                  <div class="text-h4">{{ todayStats.noShow }}</div>
                  <div class="text-caption">No-shows</div>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section>
            <div class="text-h6">Doctor Availability</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-list dense>
              <q-item v-for="doctor in doctors" :key="doctor.id">
                <q-item-section avatar>
                  <q-avatar :color="doctor.available ? 'positive' : 'grey'">
                    {{ getInitials(doctor.name) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ doctor.name }}</q-item-label>
                  <q-item-label caption>
                    <q-badge :color="doctor.available ? 'positive' : 'grey-7'">
                      {{ doctor.available ? 'Available' : 'Unavailable' }}
                    </q-badge>
                    <span v-if="doctor.nextAvailable && !doctor.available" class="q-ml-sm">
                      Next available: {{ doctor.nextAvailable }}
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- New/Edit Appointment Dialog -->
    <q-dialog v-model="appointmentDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editMode ? 'Edit Appointment' : 'New Appointment' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveAppointment" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="appointmentForm.patient"
                  :options="patientOptions"
                  label="Patient *"
                  outlined
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="0"
                  @filter="filterPatients"
                  :rules="[(val) => !!val || 'Patient is required']"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey"> No results </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="appointmentForm.date"
                  label="Date *"
                  outlined
                  type="date"
                  :rules="[(val) => !!val || 'Date is required']"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="appointmentForm.time"
                  label="Time *"
                  outlined
                  type="time"
                  :rules="[(val) => !!val || 'Time is required']"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-select
                  v-model="appointmentForm.doctor"
                  :options="doctorOptions"
                  label="Doctor *"
                  outlined
                  :rules="[(val) => !!val || 'Doctor is required']"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="appointmentForm.type"
                  :options="appointmentTypes"
                  label="Appointment Type *"
                  outlined
                  :rules="[(val) => !!val || 'Appointment type is required']"
                />
              </div>
            </div>

            <q-input
              v-model="appointmentForm.notes"
              label="Notes"
              outlined
              type="textarea"
              rows="3"
            />

            <div class="row items-center">
              <q-toggle
                v-model="appointmentForm.isUrgent"
                label="Mark as Urgent"
                color="negative"
              />
            </div>

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" color="grey-7" flat v-close-popup class="q-mr-sm" />
              <q-btn label="Save" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Find Next Available Dialog -->
    <q-dialog v-model="nextAvailableDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Find Next Available Slot</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="nextAvailableForm.doctor"
                :options="doctorOptions"
                label="Doctor"
                outlined
                emit-value
                map-options
                clearable
              />
            </div>
            <div class="col-12">
              <q-select
                v-model="nextAvailableForm.appointmentType"
                :options="appointmentTypes"
                label="Appointment Type"
                outlined
                clearable
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="nextAvailableForm.fromDate"
                label="From Date"
                outlined
                type="date"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn flat label="Search" color="primary" @click="searchNextAvailable" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Next Available Results Dialog -->
    <q-dialog v-model="availableResultsDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Available Appointments</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-list separator>
            <q-item
              v-for="(slot, index) in availableSlots"
              :key="index"
              clickable
              v-ripple
              @click="selectAvailableSlot(slot)"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" icon="event_available" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ formatDate(slot.date) }}</q-item-label>
                <q-item-label caption
                  >{{ formatTime(slot.time) }} with {{ slot.doctor }}</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="add"
                  @click.stop="selectAvailableSlot(slot)"
                >
                  <q-tooltip>Book this slot</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
            <q-item v-if="availableSlots.length === 0">
              <q-item-section>
                <q-item-label class="text-center text-grey-7"
                  >No available slots found</q-item-label
                >
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { format, addDays } from 'date-fns';

// Importar o declarar interfaces
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  type: string;
  notes: string;
  isUrgent: boolean;
}

interface AvailableSlot {
  date: string;
  time: string;
  doctor: string;
}

interface AppointmentForm {
  id: string;
  patient: PatientOption | null;
  patientName: string;
  date: string;
  time: string;
  doctor: string | null;
  type: string | null;
  notes: string;
  isUrgent: boolean;
}

interface PatientOption {
  id: string;
  name: string;
}

interface Doctor {
  id: number;
  name: string;
  available: boolean;
  nextAvailable: string | null;
}

interface NextAvailableForm {
  doctor: string | null;
  appointmentType: string | null;
  fromDate: string;
}

const $q = useQuasar();
const viewType = ref('day');
const selectedDate = ref(new Date());
const appointmentDialog = ref(false);
const nextAvailableDialog = ref(false);
const availableResultsDialog = ref(false);
const editMode = ref(false);

// Form data con tipado
const appointmentForm = ref<AppointmentForm>({
  id: '',
  patient: null,
  patientName: '',
  date: '',
  time: '',
  doctor: null,
  type: null,
  notes: '',
  isUrgent: false,
});

const nextAvailableForm = ref<NextAvailableForm>({
  doctor: null,
  appointmentType: null,
  fromDate: format(new Date(), 'yyyy-MM-dd'),
});

// Aplicamos la interfaz a appointments
const appointments = ref<Appointment[]>([
  {
    id: 'A001',
    patientId: 'P-1001',
    patientName: 'John Doe',
    date: '2023-09-15',
    time: '09:00',
    doctor: 'Dr. Sarah Johnson',
    type: 'Annual Eye Exam',
    notes: '',
    isUrgent: false,
  },
  {
    id: 'A002',
    patientId: 'P-1002',
    patientName: 'Maria Garcia',
    date: '2023-09-15',
    time: '10:00',
    doctor: 'Dr. Michael Chen',
    type: 'Follow-up',
    notes: 'Post-operation check',
    isUrgent: false,
  },
  {
    id: 'A003',
    patientId: 'P-1003',
    patientName: 'Robert Smith',
    date: '2023-09-15',
    time: '11:00',
    doctor: 'Dr. Sarah Johnson',
    type: 'Cataract Evaluation',
    notes: '',
    isUrgent: true,
  },
  {
    id: 'A004',
    patientId: 'P-1004',
    patientName: 'Susan Williams',
    date: '2023-09-15',
    time: '13:30',
    doctor: 'Dr. Emily Rodriguez',
    type: 'LASIK Consultation',
    notes: '',
    isUrgent: false,
  },
  {
    id: 'A005',
    patientId: 'P-1005',
    patientName: 'James Brown',
    date: '2023-09-15',
    time: '14:30',
    doctor: 'Dr. Michael Chen',
    type: 'Contact Lens Fitting',
    notes: '',
    isUrgent: false,
  },
  {
    id: 'A006',
    patientId: 'P-1006',
    patientName: 'Lisa Taylor',
    date: '2023-09-15',
    time: '15:45',
    doctor: 'Dr. Emily Rodriguez',
    type: 'Eye Irritation',
    notes: 'Recurring issue',
    isUrgent: false,
  },
  {
    id: 'A007',
    patientId: 'P-1007',
    patientName: 'David Wilson',
    date: '2023-09-16',
    time: '09:30',
    doctor: 'Dr. Sarah Johnson',
    type: 'Annual Eye Exam',
    notes: '',
    isUrgent: false,
  },
  {
    id: 'A008',
    patientId: 'P-1008',
    patientName: 'Jennifer Miller',
    date: '2023-09-16',
    time: '10:30',
    doctor: 'Dr. Emily Rodriguez',
    type: 'Glaucoma Screening',
    notes: 'Family history',
    isUrgent: false,
  },
]);

// Aplicamos tipado a las demás variables
const doctors = ref<Doctor[]>([
  { id: 1, name: 'Dr. Sarah Johnson', available: true, nextAvailable: null },
  { id: 2, name: 'Dr. Michael Chen', available: true, nextAvailable: null },
  { id: 3, name: 'Dr. Emily Rodriguez', available: false, nextAvailable: 'Tomorrow at 9:00 AM' },
  { id: 4, name: 'Dr. David Lee', available: false, nextAvailable: 'Sep 20, 2023' },
]);

const patients = ref<PatientOption[]>([
  { id: 'P-1001', name: 'John Doe' },
  { id: 'P-1002', name: 'Maria Garcia' },
  { id: 'P-1003', name: 'Robert Smith' },
  { id: 'P-1004', name: 'Susan Williams' },
  { id: 'P-1005', name: 'James Brown' },
  { id: 'P-1006', name: 'Lisa Taylor' },
  { id: 'P-1007', name: 'David Wilson' },
  { id: 'P-1008', name: 'Jennifer Miller' },
]);

const availableSlots = ref<AvailableSlot[]>([]);
const patientOptions = ref<PatientOption[]>([]);
const doctorOptions = [
  'Dr. Sarah Johnson',
  'Dr. Michael Chen',
  'Dr. Emily Rodriguez',
  'Dr. David Lee',
];
const appointmentTypes = [
  'Annual Eye Exam',
  'Follow-up',
  'Contact Lens Fitting',
  'Eye Irritation/Infection',
  'LASIK Consultation',
  'Cataract Evaluation',
  'Glaucoma Screening',
  'Diabetic Eye Exam',
  'Emergency/Injury',
];

// Office hours for day view
const officeHours = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM

// Computed properties
const calendarTitle = computed(() => {
  if (viewType.value === 'day') {
    return format(selectedDate.value, 'MMMM d, yyyy');
  } else if (viewType.value === 'week') {
    const endDate = addDays(selectedDate.value, 6);
    return `${format(selectedDate.value, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  } else if (viewType.value === 'month') {
    return format(selectedDate.value, 'MMMM yyyy');
  }
  return 'Appointments';
});

const sortedAppointments = computed(() => {
  return [...appointments.value].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
});

const todayStats = computed(() => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.value.filter((appt) => appt.date === today);

  return {
    total: todayAppointments.length,
    completed: 3, // This would be calculated from actual data
    waiting: 2, // This would be calculated from actual data
    noShow: 1, // This would be calculated from actual data
  };
});

// Methods
const formatDate = (dateStr: string | Date) => {
  if (typeof dateStr === 'string') {
    return format(new Date(dateStr), 'EEEE, MMMM d');
  }
  return format(dateStr, 'EEEE, MMMM d');
};

const formatTime = (time: string) => {
  // Simple function to convert 24h to 12h format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours ?? '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatHour = (hour: number) => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:00 ${ampm}`;
};

const getPatientInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getAvatarColor = (appointment: Appointment) => {
  if (appointment.isUrgent) return 'negative';
  return 'primary';
};

const getAppointmentClass = (appointment: Appointment): string => {
  if (appointment.isUrgent) return 'bg-red-2';
  return 'bg-blue-2';
};

const navigateCalendar = (direction: string) => {
  if (direction === 'prev') {
    if (viewType.value === 'day') {
      selectedDate.value = addDays(selectedDate.value, -1);
    } else if (viewType.value === 'week') {
      selectedDate.value = addDays(selectedDate.value, -7);
    } else if (viewType.value === 'month') {
      const date = new Date(selectedDate.value);
      date.setMonth(date.getMonth() - 1);
      selectedDate.value = date;
    }
  } else if (direction === 'next') {
    if (viewType.value === 'day') {
      selectedDate.value = addDays(selectedDate.value, 1);
    } else if (viewType.value === 'week') {
      selectedDate.value = addDays(selectedDate.value, 7);
    } else if (viewType.value === 'month') {
      const date = new Date(selectedDate.value);
      date.setMonth(date.getMonth() + 1);
      selectedDate.value = date;
    }
  } else if (direction === 'today') {
    selectedDate.value = new Date();
  }
};

const getAppointmentsForTime = (hour: number): Appointment[] => {
  const selectedDateStr = format(selectedDate.value, 'yyyy-MM-dd');
  return appointments.value.filter((appt) => {
    if (appt.date !== selectedDateStr) return false;
    const appointmentHour = parseInt('00' + appt.time.split(':')[0]);
    return appointmentHour === hour;
  });
};

const openNewAppointmentDialog = () => {
  appointmentForm.value = {
    id: `A${appointments.value.length + 1}`.padStart(4, '0'),
    patient: null,
    patientName: '',
    date: format(selectedDate.value, 'yyyy-MM-dd'),
    time: '',
    doctor: null,
    type: null,
    notes: '',
    isUrgent: false,
  };
  editMode.value = false;
  appointmentDialog.value = true;
};

const editAppointment = (appointment: Appointment): void => {
  const patient = patients.value.find((p) => p.id === appointment.patientId);

  appointmentForm.value = {
    id: appointment.id,
    patient: patient || null,
    patientName: appointment.patientName,
    date: appointment.date,
    time: appointment.time,
    doctor: appointment.doctor,
    type: appointment.type,
    notes: appointment.notes,
    isUrgent: appointment.isUrgent,
  };

  editMode.value = true;
  appointmentDialog.value = true;
};

const saveAppointment = (): void => {
  if (!appointmentForm.value.patient) return;

  const newAppointment: Appointment = {
    id: appointmentForm.value.id,
    patientId: appointmentForm.value.patient.id,
    patientName: appointmentForm.value.patient.name,
    date: appointmentForm.value.date,
    time: appointmentForm.value.time,
    doctor: appointmentForm.value.doctor || '',
    type: appointmentForm.value.type || '',
    notes: appointmentForm.value.notes,
    isUrgent: appointmentForm.value.isUrgent,
  };

  if (editMode.value) {
    // Update existing appointment
    const index = appointments.value.findIndex((a) => a.id === appointmentForm.value.id);
    if (index !== -1) {
      appointments.value[index] = newAppointment;
    }

    $q.notify({
      color: 'positive',
      message: `Appointment updated for ${newAppointment.patientName}`,
      icon: 'check_circle',
    });
  } else {
    // Add new appointment
    appointments.value.push(newAppointment);

    $q.notify({
      color: 'positive',
      message: `Appointment scheduled for ${newAppointment.patientName}`,
      icon: 'check_circle',
    });
  }

  appointmentDialog.value = false;
};

const confirmDeleteAppointment = (appointment: Appointment) => {
  $q.dialog({
    title: 'Confirm Cancellation',
    message: `Are you sure you want to cancel ${appointment.patientName}'s appointment on ${appointment.date} at ${formatTime(appointment.time)}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = appointments.value.findIndex((a) => a.id === appointment.id);
    if (index !== -1) {
      appointments.value.splice(index, 1);

      $q.notify({
        color: 'negative',
        message: `Appointment cancelled`,
        icon: 'cancel',
      });
    }
  });
};

const findNextAvailable = () => {
  nextAvailableForm.value = {
    doctor: null,
    appointmentType: null,
    fromDate: format(new Date(), 'yyyy-MM-dd'),
  };
  nextAvailableDialog.value = true;
};

const searchNextAvailable = () => {
  // In a real app, this would search for actual available slots based on criteria
  nextAvailableDialog.value = false;

  // Simulate finding available slots
  availableSlots.value = [
    { date: '2023-09-16', time: '09:00', doctor: 'Dr. Sarah Johnson' },
    { date: '2023-09-16', time: '11:30', doctor: 'Dr. Michael Chen' },
    { date: '2023-09-17', time: '14:00', doctor: 'Dr. Emily Rodriguez' },
    { date: '2023-09-18', time: '10:15', doctor: 'Dr. Sarah Johnson' },
  ];

  availableResultsDialog.value = true;
};

const selectAvailableSlot = (slot: AvailableSlot) => {
  availableResultsDialog.value = false;

  appointmentForm.value = {
    id: `A${appointments.value.length + 1}`.padStart(4, '0'),
    patient: null,
    patientName: '',
    date: slot.date,
    time: slot.time,
    doctor: slot.doctor,
    type: nextAvailableForm.value.appointmentType || null,
    notes: '',
    isUrgent: false,
  };

  editMode.value = false;
  appointmentDialog.value = true;
};

const filterPatients = (val: string, update: (cb: () => void) => void) => {
  if (val === '') {
    update(() => {
      patientOptions.value = patients.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    patientOptions.value = patients.value.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
  });
};
</script>

<style lang="scss" scoped>
.calendar-container {
  min-height: 600px;
  border: 1px solid $grey-3;
  border-radius: 4px;
}

.time-slots {
  .time-slot {
    display: flex;
    min-height: 60px;
    border-bottom: 1px solid $grey-3;

    &:last-child {
      border-bottom: none;
    }

    .time-label {
      width: 100px;
      padding: 8px;
      color: $grey-7;
      font-size: 0.9rem;
      text-align: right;
      border-right: 1px solid $grey-3;
    }

    .time-content {
      flex: 1;
      position: relative;

      .appointment-card {
        border-radius: 4px;
        margin-bottom: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
        }
      }
    }
  }
}

.week-container,
.month-container {
  min-height: 400px;
  border-radius: 4px;
}
</style>
