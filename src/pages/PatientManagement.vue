<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <h4 class="q-my-md">
          <q-icon name="folder_shared" size="sm" class="q-mr-sm" />
          Patient Management
        </h4>
      </div>

      <!-- Search and Filters -->
      <div class="col-12">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="search"
                  outlined
                  dense
                  label="Search Patients"
                  placeholder="Name, ID or phone number"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="close" @click="search = ''" class="cursor-pointer" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <div class="row q-col-gutter-sm">
                  <div class="col">
                    <q-select
                      v-model="doctorFilter"
                      :options="doctorOptions"
                      outlined
                      dense
                      label="Doctor"
                      clearable
                    />
                  </div>
                  <div class="col">
                    <q-select
                      v-model="statusFilter"
                      :options="statusOptions"
                      outlined
                      dense
                      label="Status"
                      clearable
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Patient Table -->
      <div class="col-12">
        <q-card>
          <q-card-section class="row items-center">
            <div class="text-h6">Patient Database</div>
            <q-space />
            <q-btn
              color="primary"
              icon="person_add"
              label="New Patient"
              @click="openNewPatientDialog"
            />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pa-none">
            <q-table
              :rows="filteredPatients"
              :columns="patientColumns"
              row-key="id"
              :pagination="{ rowsPerPage: 10 }"
              :loading="loading"
              :filter="search"
            >
              <template v-slot:top-right>
                <q-btn color="secondary" icon="archive" label="Export Data" flat />
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" :class="{ 'bg-red-1': props.row.hasUrgentFlag }">
                  <q-td key="id" :props="props">{{ props.row.id }}</q-td>
                  <q-td key="name" :props="props">{{ props.row.name }}</q-td>
                  <q-td key="phone" :props="props">{{ props.row.phone }}</q-td>
                  <q-td key="email" :props="props">{{ props.row.email }}</q-td>
                  <q-td key="lastVisit" :props="props">{{ props.row.lastVisit }}</q-td>
                  <q-td key="nextAppointment" :props="props">{{
                    props.row.nextAppointment || 'None'
                  }}</q-td>
                  <q-td key="actions" :props="props">
                    <div class="row q-gutter-xs justify-center">
                      <q-btn
                        size="sm"
                        color="primary"
                        flat
                        dense
                        icon="info"
                        @click="viewPatientDetails(props.row)"
                      >
                        <q-tooltip>View Details</q-tooltip>
                      </q-btn>
                      <q-btn
                        size="sm"
                        color="secondary"
                        flat
                        dense
                        icon="edit"
                        @click="editPatient(props.row)"
                      >
                        <q-tooltip>Edit</q-tooltip>
                      </q-btn>
                      <q-btn
                        size="sm"
                        color="accent"
                        flat
                        dense
                        icon="event"
                        @click="scheduleAppointment(props.row)"
                      >
                        <q-tooltip>Schedule</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Patient Details Modal -->
    <q-dialog
      v-model="detailsDialog"
      maximized
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column">
        <q-bar class="bg-primary text-white">
          <div>Patient Details</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pa-md column col-grow" v-if="selectedPatient">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-4">
              <q-card class="bg-blue-1">
                <q-card-section>
                  <div class="text-center q-pb-md">
                    <q-avatar size="100px" color="primary" text-color="white">
                      {{ getInitials(selectedPatient.name) }}
                    </q-avatar>
                    <div class="text-h6 q-mt-md">{{ selectedPatient.name }}</div>
                    <div class="text-subtitle2">ID: {{ selectedPatient.id }}</div>
                  </div>
                  <q-list>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="phone" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ selectedPatient.phone }}</q-item-label>
                        <q-item-label caption>Phone</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="email" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ selectedPatient.email }}</q-item-label>
                        <q-item-label caption>Email</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="cake" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ selectedPatient.dob }}</q-item-label>
                        <q-item-label caption>Date of Birth</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-8">
              <q-tabs v-model="patientTab" class="text-primary">
                <q-tab name="appointments" label="Appointments" icon="event" />
                <q-tab name="history" label="Medical History" icon="history" />
                <q-tab name="notes" label="Notes" icon="note" />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="patientTab" animated>
                <q-tab-panel name="appointments" class="q-pa-none">
                  <q-card flat bordered>
                    <q-card-section class="q-py-sm bg-blue-1">
                      <div class="text-subtitle1 text-weight-medium">Appointment History</div>
                    </q-card-section>
                    <q-list separator>
                      <q-item
                        v-for="(appointment, index) in selectedPatient.appointments"
                        :key="index"
                      >
                        <q-item-section avatar>
                          <q-icon name="event" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ appointment.date }}</q-item-label>
                          <q-item-label caption
                            >{{ appointment.doctor }} • {{ appointment.reason }}</q-item-label
                          >
                        </q-item-section>
                        <q-item-section side>
                          <q-badge :color="getAppointmentStatusColor(appointment.status)">
                            {{ appointment.status }}
                          </q-badge>
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-if="
                          !selectedPatient.appointments || selectedPatient.appointments.length === 0
                        "
                      >
                        <q-item-section>
                          <div class="text-grey-6 text-center q-pa-md">
                            No appointment history found
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                </q-tab-panel>

                <q-tab-panel name="history">
                  <q-timeline color="secondary">
                    <q-timeline-entry
                      v-for="(record, index) in selectedPatient.medicalHistory"
                      :key="index"
                      :title="record.date"
                      :subtitle="record.doctor"
                    >
                      <div>
                        <div class="text-weight-medium">{{ record.diagnosis }}</div>
                        <p>{{ record.notes }}</p>
                        <q-badge
                          v-for="treatment in record.treatments"
                          :key="treatment"
                          color="accent"
                          class="q-mr-xs"
                          >{{ treatment }}</q-badge
                        >
                      </div>
                    </q-timeline-entry>
                    <q-timeline-entry
                      v-if="
                        !selectedPatient.medicalHistory ||
                        selectedPatient.medicalHistory.length === 0
                      "
                      title="No Medical History"
                      icon="info"
                    >
                      <div>No previous medical records found for this patient.</div>
                    </q-timeline-entry>
                  </q-timeline>
                </q-tab-panel>

                <q-tab-panel name="notes">
                  <q-input
                    v-model="patientNotes"
                    filled
                    type="textarea"
                    label="Administrative Notes"
                    rows="6"
                  />
                  <div class="row justify-end q-mt-md">
                    <q-btn color="primary" label="Save Notes" @click="savePatientNotes" />
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white">
          <q-btn flat color="negative" label="Delete Patient" @click="confirmDeletePatient" />
          <q-space />
          <q-btn flat color="grey" label="Close" v-close-popup />
          <q-btn
            color="secondary"
            label="Edit Information"
            @click="editPatient(selectedPatient!)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New/Edit Patient Modal -->
    <q-dialog v-model="patientFormDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editMode ? 'Edit Patient' : 'New Patient' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePatient" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="patientForm.name"
                  label="Full Name *"
                  outlined
                  :rules="[(val) => !!val || 'Name is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="patientForm.dob"
                  label="Date of Birth *"
                  outlined
                  type="date"
                  :rules="[(val) => !!val || 'Date of birth is required']"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="patientForm.phone"
                  label="Phone Number *"
                  outlined
                  :rules="[(val) => !!val || 'Phone is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="patientForm.email" label="Email" outlined type="email" />
              </div>
            </div>

            <q-input v-model="patientForm.address" label="Address" outlined />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="patientForm.insuranceProvider"
                  :options="insuranceOptions"
                  label="Insurance Provider"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="patientForm.insuranceNumber" label="Insurance Number" outlined />
              </div>
            </div>

            <q-toggle
              v-model="patientForm.hasUrgentFlag"
              label="Mark as Priority Patient"
              color="negative"
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" color="grey-7" flat v-close-popup class="q-mr-sm" />
              <q-btn label="Save" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Appointment Scheduling Dialog -->
    <q-dialog v-model="scheduleDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Schedule Appointment</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedPatient">
          <p>
            Scheduling appointment for: <strong>{{ selectedPatient.name }}</strong>
          </p>
          <q-form @submit="saveAppointment" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="appointmentForm.date"
                  label="Date *"
                  outlined
                  type="date"
                  :rules="[(val) => !!val || 'Date is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="appointmentForm.time"
                  label="Time *"
                  outlined
                  type="time"
                  :rules="[(val) => !!val || 'Time is required']"
                />
              </div>
            </div>

            <q-select
              v-model="appointmentForm.doctor"
              :options="doctorOptions"
              label="Doctor *"
              outlined
              :rules="[(val) => !!val || 'Doctor is required']"
            />

            <q-select
              v-model="appointmentForm.reason"
              :options="appointmentReasons"
              label="Reason for Visit *"
              outlined
              :rules="[(val) => !!val || 'Reason is required']"
            />

            <q-input
              v-model="appointmentForm.notes"
              label="Additional Notes"
              outlined
              type="textarea"
              rows="3"
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" color="grey-7" flat v-close-popup class="q-mr-sm" />
              <q-btn label="Schedule" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { type QTableColumn, useQuasar } from 'quasar';
import type { Patient } from 'src/types/Patient.interface';

const $q = useQuasar();
const loading = ref(false);
const search = ref('');
const doctorFilter = ref(null);
const statusFilter = ref(null);
const detailsDialog = ref(false);
const patientFormDialog = ref(false);
const scheduleDialog = ref(false);
const selectedPatient = ref<Patient>();
const editMode = ref(false);
const patientTab = ref('appointments');
const patientNotes = ref('');

// Sample data
const patients = ref<Patient[]>([
  {
    id: 'P-1001',
    name: 'John Doe',
    phone: '(555) 123-4567',
    email: 'john.doe@example.com',
    dob: '1975-06-15',
    address: '123 Main St, Anytown, CA 12345',
    insuranceProvider: 'Blue Cross',
    insuranceNumber: 'BC987654321',
    lastVisit: '2023-08-15',
    nextAppointment: '2023-09-20 10:00 AM',
    hasUrgentFlag: false,
    appointments: [
      {
        date: '2023-08-15',
        doctor: 'Dr. Sarah Johnson',
        reason: 'Annual Eye Exam',
        status: 'Completed',
      },
      {
        date: '2023-05-03',
        doctor: 'Dr. Michael Chen',
        reason: 'Contact Lens Fitting',
        status: 'Completed',
      },
      { date: '2023-09-20', doctor: 'Dr. Sarah Johnson', reason: 'Follow-up', status: 'Scheduled' },
    ],
    medicalHistory: [
      {
        date: '2023-08-15',
        doctor: 'Dr. Sarah Johnson',
        diagnosis: 'Mild Astigmatism',
        notes:
          'Patient reports mild headaches when reading for extended periods. Prescribed corrective lenses.',
        treatments: ['Corrective Lenses', 'Eye Drops'],
      },
      {
        date: '2023-05-03',
        doctor: 'Dr. Michael Chen',
        diagnosis: 'Contact Lens Fitting',
        notes: 'Patient fitted for monthly disposable contacts.',
        treatments: ['Monthly Contacts'],
      },
    ],
  },
  {
    id: 'P-1002',
    name: 'Maria Garcia',
    phone: '(555) 987-6543',
    email: 'maria.garcia@example.com',
    dob: '1980-11-22',
    address: '456 Oak Ave, Somewhere, CA 54321',
    insuranceProvider: 'Aetna',
    insuranceNumber: 'AE123456789',
    lastVisit: '2023-09-01',
    nextAppointment: null,
    hasUrgentFlag: false,
    appointments: [
      {
        date: '2023-09-01',
        doctor: 'Dr. Michael Chen',
        reason: 'Eye Irritation',
        status: 'Completed',
      },
      {
        date: '2023-03-17',
        doctor: 'Dr. Sarah Johnson',
        reason: 'Annual Eye Exam',
        status: 'Completed',
      },
    ],
    medicalHistory: [
      {
        date: '2023-09-01',
        doctor: 'Dr. Michael Chen',
        diagnosis: 'Dry Eye Syndrome',
        notes:
          'Patient experiencing eye irritation and redness. Recommended lubricating eye drops.',
        treatments: ['Lubricating Eye Drops', 'Warm Compresses'],
      },
      {
        date: '2023-03-17',
        doctor: 'Dr. Sarah Johnson',
        diagnosis: 'Hyperopia',
        notes: 'Patient has farsightedness. Prescribed corrective lenses.',
        treatments: ['Corrective Lenses'],
      },
    ],
  },
  {
    id: 'P-1003',
    name: 'Robert Smith',
    phone: '(555) 456-7890',
    email: 'robert.smith@example.com',
    dob: '1965-03-08',
    address: '789 Pine St, Elsewhere, CA 67890',
    insuranceProvider: 'Medicare',
    insuranceNumber: 'MC456789012',
    lastVisit: '2023-07-10',
    nextAppointment: '2023-10-15 2:30 PM',
    hasUrgentFlag: true,
    appointments: [
      {
        date: '2023-07-10',
        doctor: 'Dr. Emily Rodriguez',
        reason: 'Cataract Consultation',
        status: 'Completed',
      },
      {
        date: '2023-10-15',
        doctor: 'Dr. Emily Rodriguez',
        reason: 'Pre-Surgery Evaluation',
        status: 'Scheduled',
      },
    ],
    medicalHistory: [
      {
        date: '2023-07-10',
        doctor: 'Dr. Emily Rodriguez',
        diagnosis: 'Early Cataracts',
        notes:
          'Patient experiencing gradual vision loss. Cataracts developing in both eyes. Scheduled follow-up for surgery evaluation.',
        treatments: ['Surgery Evaluation'],
      },
    ],
  },
  {
    id: 'P-1004',
    name: 'Susan Williams',
    phone: '(555) 789-0123',
    email: 'susan.williams@example.com',
    dob: '1990-12-30',
    address: '321 Maple Dr, Nowhere, CA 13579',
    insuranceProvider: 'United Healthcare',
    insuranceNumber: 'UH789012345',
    lastVisit: '2023-06-22',
    nextAppointment: null,
    hasUrgentFlag: false,
    appointments: [
      {
        date: '2023-06-22',
        doctor: 'Dr. Sarah Johnson',
        reason: 'LASIK Consultation',
        status: 'Completed',
      },
    ],
    medicalHistory: [
      {
        date: '2023-06-22',
        doctor: 'Dr. Sarah Johnson',
        diagnosis: 'Myopia',
        notes:
          'Patient interested in LASIK procedure. Conducted initial evaluation and determined patient is a potential candidate. Recommended returning for pre-operative measurements.',
        treatments: ['LASIK Evaluation'],
      },
    ],
  },
]);

const patientForm = ref<{
  id: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  address: string;
  insuranceProvider: string | null;
  insuranceNumber: string;
  hasUrgentFlag: boolean;
}>({
  id: '',
  name: '',
  phone: '',
  email: '',
  dob: '',
  address: '',
  insuranceProvider: null,
  insuranceNumber: '',
  hasUrgentFlag: false,
});

const appointmentForm = ref({
  date: '',
  time: '',
  doctor: null,
  reason: null,
  notes: '',
});

const patientColumns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'phone', label: 'Phone', field: 'phone', sortable: false, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', sortable: false, align: 'left' },
  { name: 'lastVisit', label: 'Last Visit', field: 'lastVisit', sortable: true, align: 'left' },
  {
    name: 'nextAppointment',
    label: 'Next Appointment',
    field: 'nextAppointment',
    sortable: true,
    align: 'left',
  },
  { name: 'actions', label: 'Actions', field: 'actions', sortable: false, align: 'center' },
];

const doctorOptions = [
  'Dr. Sarah Johnson',
  'Dr. Michael Chen',
  'Dr. Emily Rodriguez',
  'Dr. David Lee',
];

const statusOptions = ['Active', 'Inactive', 'New Patient'];

const insuranceOptions = [
  'Blue Cross',
  'Aetna',
  'Medicare',
  'United Healthcare',
  'Cigna',
  'Kaiser Permanente',
  'Self-pay',
];

const appointmentReasons = [
  'Annual Eye Exam',
  'Follow-up',
  'Contact Lens Fitting',
  'Eye Irritation/Infection',
  'LASIK Consultation',
  'Cataract Evaluation',
  'Glaucoma Screening',
  'Diabetic Eye Exam',
  'Emergency/Injury',
  'Other',
];

// Computed properties
const filteredPatients = computed(() => {
  const result = patients.value;

  if (doctorFilter.value) {
    // This would filter by doctor in a real app
    // For demo purposes, we'll just return all patients
  }

  if (statusFilter.value) {
    // This would filter by status in a real app
    // For demo purposes, we'll just return all patients
  }

  return result;
});

// Methods
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};

const getAppointmentStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'primary';
    case 'Completed':
      return 'positive';
    case 'Cancelled':
      return 'negative';
    case 'No-show':
      return 'warning';
    default:
      return 'grey';
  }
};

const viewPatientDetails = (patient: Patient) => {
  selectedPatient.value = patient;
  patientNotes.value = patient.notes || '';
  detailsDialog.value = true;
};

const editPatient = (patient: Patient) => {
  selectedPatient.value = patient;
  patientForm.value = {
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
    dob: patient.dob,
    address: patient.address,
    insuranceProvider: patient.insuranceProvider ?? null,
    insuranceNumber: patient.insuranceNumber,
    hasUrgentFlag: patient.hasUrgentFlag,
  };
  editMode.value = true;
  patientFormDialog.value = true;
};

const openNewPatientDialog = () => {
  patientForm.value = {
    id: `P-${1000 + patients.value.length + 1}`,
    name: '',
    phone: '',
    email: '',
    dob: '',
    address: '',
    insuranceProvider: null,
    insuranceNumber: '',
    hasUrgentFlag: false,
  };
  editMode.value = false;
  patientFormDialog.value = true;
};

const savePatient = () => {
  if (editMode.value) {
    // Update existing patient
    const index = patients.value.findIndex((p) => p.id === patientForm.value.id);
    if (index !== -1 && patients.value[index]) {
      patients.value[index] = {
        ...patients.value[index],
        ...patientForm.value,
        lastVisit: patients.value[index]?.lastVisit ?? null,
        nextAppointment: patients.value[index]?.nextAppointment ?? null,
        appointments: patients.value[index]?.appointments ?? [],
        medicalHistory: patients.value[index]?.medicalHistory ?? [],
      };
    }

    $q.notify({
      color: 'positive',
      message: `Patient information updated`,
      icon: 'check_circle',
    });
  } else {
    // Add new patient
    patients.value.push({
      ...patientForm.value,
      lastVisit: null,
      nextAppointment: null,
      appointments: [],
      medicalHistory: [],
    });

    $q.notify({
      color: 'positive',
      message: `New patient added: ${patientForm.value.name}`,
      icon: 'check_circle',
    });
  }

  patientFormDialog.value = false;
};

const scheduleAppointment = (patient: Patient) => {
  selectedPatient.value = patient;
  appointmentForm.value = {
    date: '',
    time: '',
    doctor: null,
    reason: null,
    notes: '',
  };
  scheduleDialog.value = true;
};

const saveAppointment = () => {
  if (!selectedPatient.value) return;

  // Format the appointment datetime
  const formattedDateTime = `${appointmentForm.value.date} ${appointmentForm.value.time}`;

  // Update the patient's next appointment
  const index = patients.value.findIndex((p) => p.id === selectedPatient.value!.id);
  if (index !== -1 && patients.value[index]) {
    // Add to appointments array
    if (!patients.value[index].appointments) {
      patients.value[index].appointments = [];
    }

    patients.value[index].appointments.push({
      date: appointmentForm.value.date || '',
      doctor: appointmentForm.value.doctor || '',
      reason: appointmentForm.value.reason || '',
      status: 'Scheduled',
    });

    // Update next appointment
    patients.value[index].nextAppointment = formattedDateTime;

    $q.notify({
      color: 'positive',
      message: `Appointment scheduled for ${selectedPatient.value.name}`,
      icon: 'check_circle',
    });
  }

  scheduleDialog.value = false;
};

const savePatientNotes = () => {
  if (!selectedPatient.value) return;

  if (!selectedPatient.value) return;
  const index = selectedPatient.value
    ? patients.value.findIndex((p) => p.id === selectedPatient.value!.id)
    : -1;
  if (index !== -1) {
    patients.value[index]!.notes = patientNotes.value;

    $q.notify({
      color: 'positive',
      message: 'Patient notes saved',
      icon: 'check_circle',
    });
  }
};

const confirmDeletePatient = () => {
  if (!selectedPatient.value) return;

  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete ${selectedPatient.value.name}'s record? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = patients.value.findIndex((p) => p.id === selectedPatient.value!.id);
    if (index !== -1) {
      patients.value.splice(index, 1);

      $q.notify({
        color: 'negative',
        message: `Patient record deleted`,
        icon: 'delete',
      });

      detailsDialog.value = false;
    }
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
.q-table__card {
  border-radius: 8px;
  overflow: hidden;
}

.patient-card {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
