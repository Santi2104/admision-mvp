<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <h4 class="q-my-md">
          <q-icon name="medical_services" size="sm" class="q-mr-sm" />
          Doctor Management
        </h4>
      </div>

      <!-- Doctor Status Cards -->
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3" v-for="doctor in doctors" :key="doctor.id">
            <q-card
              :class="[
                'doctor-card',
                doctor.status === 'Available'
                  ? 'bg-green-1'
                  : doctor.status === 'Busy'
                    ? 'bg-orange-1'
                    : 'bg-red-1',
              ]"
            >
              <q-card-section class="text-center">
                <q-avatar size="80px" color="primary" text-color="white">
                  {{ getInitials(doctor.name) }}
                </q-avatar>
                <div class="text-h6 q-mt-sm">{{ doctor.name }}</div>
                <q-badge :color="getStatusColor(doctor.status)" class="q-mt-xs">
                  {{ doctor.status }}
                </q-badge>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <div class="col-6 text-grey-8">Specialty:</div>
                  <div class="col-6">{{ doctor.specialty }}</div>
                </div>
                <div class="row items-center q-mb-sm">
                  <div class="col-6 text-grey-8">Today's Patients:</div>
                  <div class="col-6">{{ doctor.todayPatients }}</div>
                </div>
                <div class="row items-center">
                  <div class="col-6 text-grey-8">Next Available:</div>
                  <div class="col-6">{{ doctor.nextAvailable || 'Now' }}</div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section v-if="doctor.currentPatient">
                <div class="text-subtitle2">Currently with:</div>
                <q-item dense class="q-px-none">
                  <q-item-section avatar>
                    <q-avatar color="accent" text-color="white" size="md">
                      {{ getInitials(doctor.currentPatient) }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ doctor.currentPatient }}</q-item-label>
                    <q-item-label caption>
                      Since {{ doctor.patientStartTime }}
                      <q-badge outline color="primary" class="q-ml-sm">
                        {{ doctor.patientReason }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>

              <q-separator />

              <q-card-actions align="center">
                <q-btn
                  :color="doctor.status === 'Available' ? 'primary' : 'grey-7'"
                  :label="doctor.status === 'Available' ? 'Assign Patient' : 'View Schedule'"
                  :disable="doctor.status === 'Unavailable'"
                />
                <q-btn color="secondary" icon="edit" flat round @click="editDoctorSchedule(doctor)">
                  <q-tooltip>Edit Schedule</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Doctor Schedule -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section class="row items-center">
            <div class="text-h6">Doctor Schedules</div>
            <q-space />
            <q-btn
              color="primary"
              icon="add_circle"
              label="Add Doctor"
              @click="openNewDoctorDialog"
            />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-table
              :rows="doctorSchedules"
              :columns="scheduleColumns"
              row-key="id"
              :pagination="{ rowsPerPage: 10 }"
              :loading="loading"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="doctorName" :props="props">{{ props.row.doctorName }}</q-td>
                  <q-td key="monday" :props="props">{{ props.row.monday }}</q-td>
                  <q-td key="tuesday" :props="props">{{ props.row.tuesday }}</q-td>
                  <q-td key="wednesday" :props="props">{{ props.row.wednesday }}</q-td>
                  <q-td key="thursday" :props="props">{{ props.row.thursday }}</q-td>
                  <q-td key="friday" :props="props">{{ props.row.friday }}</q-td>
                  <q-td key="actions" :props="props">
                    <q-btn
                      size="sm"
                      color="primary"
                      flat
                      dense
                      icon="edit"
                      @click="editDoctorSchedule(props.row)"
                    >
                      <q-tooltip>Edit Schedule</q-tooltip>
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Patient Queue -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="row items-center">
            <div class="text-h6">Doctor Patient Queue</div>
            <q-space />
            <q-btn-group flat>
              <q-btn
                flat
                color="primary"
                label="Auto-Assign"
                icon="shuffle"
                @click="autoAssignPatients"
              />
              <q-btn flat color="secondary" icon="refresh" @click="refreshQueue">
                <q-tooltip>Refresh Queue</q-tooltip>
              </q-btn>
            </q-btn-group>
          </q-card-section>

          <q-separator />

          <q-tabs
            v-model="selectedDoctor"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            narrow-indicator
          >
            <q-tab
              v-for="doctor in doctors"
              :key="doctor.id"
              :name="`doctor-${doctor.id}`"
              :label="doctor.name.replace('Dr. ', '')"
            />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="selectedDoctor" animated>
            <q-tab-panel
              v-for="doctor in doctors"
              :key="doctor.id"
              :name="`doctor-${doctor.id}`"
              class="q-pa-none"
            >
              <q-list separator>
                <q-item-label header>Next Patients</q-item-label>
                <q-item
                  v-for="(patient, index) in getDoctorQueue(doctor.id)"
                  :key="index"
                  class="q-py-md"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :color="
                        patient.isUrgent
                          ? 'negative'
                          : patient.type === 'Appointment'
                            ? 'primary'
                            : 'accent'
                      "
                    >
                      {{ getInitials(patient.name) }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ patient.name }}</q-item-label>
                    <q-item-label caption>
                      {{ patient.reason }} • Waiting: {{ patient.waitTime }}m
                      <q-badge :color="patient.isUrgent ? 'negative' : 'primary'" class="q-ml-sm">
                        {{ patient.type }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round color="primary" icon="call_merge">
                      <q-tooltip>Call in Patient</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-item v-if="getDoctorQueue(doctor.id).length === 0">
                  <q-item-section>
                    <div class="text-grey-6 q-pa-md text-center">No patients in queue</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Edit Doctor Schedule Dialog -->
    <q-dialog v-model="scheduleDialog" persistent maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <div>Doctor Schedule</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pa-md">
          <div v-if="selectedDoctorSchedule" class="row q-col-gutter-md">
            <div class="col-12">
              <div class="text-h6 q-mb-md">Doctor name's Schedule</div>
            </div>

            <div class="col-12">
              <q-tabs
                v-model="scheduleTab"
                class="text-primary"
                active-color="primary"
                indicator-color="primary"
                align="justify"
              >
                <q-tab name="weekly" label="Weekly Schedule" icon="calendar_month" />
                <q-tab name="vacation" label="Vacation/Time Off" icon="flight_takeoff" />
                <q-tab name="settings" label="Settings" icon="settings" />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="scheduleTab" animated>
                <q-tab-panel name="weekly">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6" v-for="day in weekdays" :key="day.value">
                      <q-card flat bordered>
                        <q-card-section class="bg-blue-1">
                          <div class="text-subtitle1 text-weight-medium">{{ day.label }}</div>
                        </q-card-section>
                        <!-- <q-card-section>
                          <div class="row q-gutter-sm">
                            <q-toggle
                              v-model="scheduleForm[day.value].available"
                              :label="
                                scheduleForm[day.value].available ? 'Available' : 'Unavailable'
                              "
                              color="primary"
                            />
                          </div>

                          <div
                            v-if="scheduleForm[day.value].available"
                            class="row q-col-gutter-sm q-mt-md"
                          >
                            <div class="col-6">
                              <q-input
                                v-model="scheduleForm[day.value].startTime"
                                type="time"
                                label="Start Time"
                                outlined
                                dense
                              />
                            </div>
                            <div class="col-6">
                              <q-input
                                v-model="scheduleForm[day.value].endTime"
                                type="time"
                                label="End Time"
                                outlined
                                dense
                              />
                            </div>
                            <div class="col-12 q-mt-sm">
                              <q-input
                                v-model="scheduleForm[day.value].notes"
                                type="textarea"
                                label="Notes"
                                outlined
                                dense
                                rows="2"
                              />
                            </div>
                          </div>
                        </q-card-section> -->
                      </q-card>
                    </div>
                  </div>
                </q-tab-panel>

                <q-tab-panel name="vacation">
                  <div class="row q-mb-md">
                    <div class="col-12">
                      <q-btn color="primary" label="Add Time Off" icon="add" @click="addTimeOff" />
                    </div>
                  </div>

                  <q-list bordered separator>
                    <q-item v-for="(timeOff, index) in timeOffList" :key="index">
                      <q-item-section>
                        <q-item-label>{{
                          formatDateRange(timeOff.startDate, timeOff.endDate)
                        }}</q-item-label>
                        <q-item-label caption>{{ timeOff.reason }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="delete"
                          @click="removeTimeOff(index)"
                        >
                          <q-tooltip>Remove</q-tooltip>
                        </q-btn>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="timeOffList.length === 0">
                      <q-item-section>
                        <div class="text-grey-6 q-pa-md text-center">No time off scheduled</div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-tab-panel>

                <q-tab-panel name="settings">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-card flat bordered>
                        <q-card-section class="bg-blue-1">
                          <div class="text-subtitle1 text-weight-medium">Doctor Information</div>
                        </q-card-section>
                        <q-card-section>
                          <q-input
                            v-model="doctorInfoForm.name"
                            label="Full Name"
                            outlined
                            class="q-mb-md"
                          />
                          <q-input
                            v-model="doctorInfoForm.specialty"
                            label="Specialty"
                            outlined
                            class="q-mb-md"
                          />
                          <q-input
                            v-model="doctorInfoForm.email"
                            label="Email"
                            outlined
                            class="q-mb-md"
                          />
                          <q-input
                            v-model="doctorInfoForm.phone"
                            label="Phone"
                            outlined
                            class="q-mb-md"
                          />
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-card flat bordered>
                        <q-card-section class="bg-blue-1">
                          <div class="text-subtitle1 text-weight-medium">Appointment Settings</div>
                        </q-card-section>
                        <q-card-section>
                          <q-select
                            v-model="doctorInfoForm.appointmentDuration"
                            :options="[15, 20, 30, 45, 60]"
                            label="Default Appointment Duration (minutes)"
                            outlined
                            class="q-mb-md"
                          />
                          <q-select
                            v-model="doctorInfoForm.maxPatients"
                            :options="[10, 15, 20, 25, 30]"
                            label="Max Patients Per Day"
                            outlined
                            class="q-mb-md"
                          />
                          <q-toggle v-model="doctorInfoForm.allowWalkIns" label="Allow Walk-ins" />
                          <q-toggle
                            v-model="doctorInfoForm.allowUrgentCases"
                            label="Accept Urgent Cases"
                          />
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn label="Save Changes" color="primary" @click="saveSchedule" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New Doctor Dialog -->
    <q-dialog v-model="newDoctorDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Add New Doctor</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveNewDoctor" class="q-gutter-md">
            <q-input
              v-model="newDoctorForm.name"
              label="Full Name *"
              outlined
              :rules="[(val) => !!val || 'Name is required']"
            />

            <q-input
              v-model="newDoctorForm.specialty"
              label="Specialty *"
              outlined
              :rules="[(val) => !!val || 'Specialty is required']"
            />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="newDoctorForm.email"
                  label="Email *"
                  outlined
                  type="email"
                  :rules="[(val) => !!val || 'Email is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="newDoctorForm.phone"
                  label="Phone *"
                  outlined
                  :rules="[(val) => !!val || 'Phone is required']"
                />
              </div>
            </div>

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" color="grey-7" flat v-close-popup class="q-mr-sm" />
              <q-btn label="Save" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add Time Off Dialog -->
    <q-dialog v-model="timeOffDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Add Time Off</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveTimeOff" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="timeOffForm.startDate"
                  label="Start Date *"
                  outlined
                  type="date"
                  :rules="[(val) => !!val || 'Start date is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="timeOffForm.endDate"
                  label="End Date *"
                  outlined
                  type="date"
                  :rules="[(val) => !!val || 'End date is required']"
                />
              </div>
            </div>

            <q-select
              v-model="timeOffForm.reason"
              :options="timeOffReasons"
              label="Reason *"
              outlined
              :rules="[(val) => !!val || 'Reason is required']"
            />

            <q-input v-model="timeOffForm.notes" label="Notes" outlined type="textarea" rows="3" />

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" color="grey-7" flat v-close-popup class="q-mr-sm" />
              <q-btn label="Save" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { format } from 'date-fns';

// Interfaces
interface DaySchedule {
  available: boolean;
  startTime: string;
  endTime: string;
  notes: string;
}

interface DoctorScheduleForm {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
}

interface DoctorSchedule {
  id: number;
  doctorName: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
}

interface Doctor {
  id: number;
  name: string;
  status: 'Available' | 'Busy' | 'Unavailable';
  specialty: string;
  todayPatients: number;
  nextAvailable: string | null;
  currentPatient: string | null;
  patientStartTime: string | null;
  patientReason: string | null;
}

interface DoctorInfo {
  name: string;
  specialty: string;
  email: string;
  phone: string;
  appointmentDuration: number;
  maxPatients: number;
  allowWalkIns: boolean;
  allowUrgentCases: boolean;
}

const $q = useQuasar();
const loading = ref(false);
const scheduleDialog = ref(false);
const newDoctorDialog = ref(false);
const timeOffDialog = ref(false);
const selectedDoctor = ref('doctor-1');
const scheduleTab = ref('weekly');
const selectedDoctorSchedule = ref<DoctorSchedule | Doctor | null>(null);

// Sample data
const doctors = ref<Doctor[]>([
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    status: 'Busy',
    specialty: 'General Ophthalmology',
    todayPatients: 12,
    nextAvailable: null,
    currentPatient: 'Robert Smith',
    patientStartTime: '10:05 AM',
    patientReason: 'Annual Exam',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    status: 'Available',
    specialty: 'Retina Specialist',
    todayPatients: 8,
    nextAvailable: null,
    currentPatient: null,
    patientStartTime: null,
    patientReason: null,
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    status: 'Busy',
    specialty: 'Pediatric Ophthalmology',
    todayPatients: 10,
    nextAvailable: null,
    currentPatient: 'James Wilson',
    patientStartTime: '10:15 AM',
    patientReason: 'Eye Irritation',
  },
  {
    id: 4,
    name: 'Dr. David Lee',
    status: 'Unavailable',
    specialty: 'Cornea Specialist',
    todayPatients: 0,
    nextAvailable: 'Tomorrow at 9:00 AM',
    currentPatient: null,
    patientStartTime: null,
    patientReason: null,
  },
]);

const doctorSchedules = ref<DoctorSchedule[]>([
  {
    id: 1,
    doctorName: 'Dr. Sarah Johnson',
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 1:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 5:00 PM',
  },
  {
    id: 2,
    doctorName: 'Dr. Michael Chen',
    monday: '10:00 AM - 6:00 PM',
    tuesday: '10:00 AM - 6:00 PM',
    wednesday: '10:00 AM - 6:00 PM',
    thursday: 'Off',
    friday: '10:00 AM - 6:00 PM',
  },
  {
    id: 3,
    doctorName: 'Dr. Emily Rodriguez',
    monday: '8:00 AM - 4:00 PM',
    tuesday: '8:00 AM - 4:00 PM',
    wednesday: '8:00 AM - 4:00 PM',
    thursday: '8:00 AM - 4:00 PM',
    friday: 'Off',
  },
  {
    id: 4,
    doctorName: 'Dr. David Lee',
    monday: 'Off',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 5:00 PM',
  },
]);

const patientQueue = ref([
  {
    doctorId: 1,
    patients: [
      {
        name: 'Susan Williams',
        waitTime: 10,
        reason: 'Annual Eye Exam',
        type: 'Appointment',
        isUrgent: false,
      },
      {
        name: 'David Wilson',
        waitTime: 5,
        reason: 'Follow-up',
        type: 'Appointment',
        isUrgent: false,
      },
    ],
  },
  {
    doctorId: 2,
    patients: [
      {
        name: 'Maria Garcia',
        waitTime: 15,
        reason: 'Contact Lens Fitting',
        type: 'Appointment',
        isUrgent: false,
      },
      {
        name: 'Ahmed Hassan',
        waitTime: 8,
        reason: 'Eye Irritation',
        type: 'Walk-in',
        isUrgent: true,
      },
    ],
  },
  {
    doctorId: 3,
    patients: [
      {
        name: 'Lisa Taylor',
        waitTime: 20,
        reason: 'Follow-up',
        type: 'Appointment',
        isUrgent: false,
      },
    ],
  },
  { doctorId: 4, patients: [] },
]);

const scheduleColumns: QTableColumn[] = [
  { name: 'doctorName', label: 'Doctor', field: 'doctorName', sortable: true, align: 'left' },
  { name: 'monday', label: 'Monday', field: 'monday', sortable: false, align: 'center' },
  { name: 'tuesday', label: 'Tuesday', field: 'tuesday', sortable: false, align: 'center' },
  { name: 'wednesday', label: 'Wednesday', field: 'wednesday', sortable: false, align: 'center' },
  { name: 'thursday', label: 'Thursday', field: 'thursday', sortable: false, align: 'center' },
  { name: 'friday', label: 'Friday', field: 'friday', sortable: false, align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', sortable: false, align: 'center' },
];

const weekdays = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
];

const scheduleForm = ref<DoctorScheduleForm>({
  monday: { available: true, startTime: '09:00', endTime: '17:00', notes: '' },
  tuesday: { available: true, startTime: '09:00', endTime: '17:00', notes: '' },
  wednesday: { available: true, startTime: '09:00', endTime: '17:00', notes: '' },
  thursday: { available: true, startTime: '09:00', endTime: '17:00', notes: '' },
  friday: { available: true, startTime: '09:00', endTime: '17:00', notes: '' },
});

const doctorInfoForm = ref<DoctorInfo>({
  name: '',
  specialty: '',
  email: '',
  phone: '',
  appointmentDuration: 30,
  maxPatients: 20,
  allowWalkIns: true,
  allowUrgentCases: true,
});

const newDoctorForm = ref({
  name: '',
  specialty: '',
  email: '',
  phone: '',
});

const timeOffForm = ref({
  startDate: '',
  endDate: '',
  reason: null,
  notes: '',
});

const timeOffList = ref([
  { startDate: '2023-10-02', endDate: '2023-10-06', reason: 'Vacation' },
  { startDate: '2023-11-23', endDate: '2023-11-24', reason: 'Holiday' },
]);

const timeOffReasons = ['Vacation', 'Personal Day', 'Sick Leave', 'Conference', 'Holiday', 'Other'];

// Methods
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Available':
      return 'positive';
    case 'Busy':
      return 'warning';
    case 'Unavailable':
      return 'negative';
    default:
      return 'grey';
  }
};

const getDoctorQueue = (doctorId: number) => {
  const queueEntry = patientQueue.value.find((q) => q.doctorId === doctorId);
  return queueEntry ? queueEntry.patients : [];
};

const editDoctorSchedule = (doctor: Doctor | DoctorSchedule) => {
  selectedDoctorSchedule.value = doctor;

  // Initialize the form with doctor's schedule
  const doctorSched = doctorSchedules.value.find((d) => d.id === doctor.id);
  if (doctorSched) {
    // Parse the schedule strings to populate the form
    weekdays.forEach((day) => {
      const dayValue = doctorSched[day.value as keyof DoctorSchedule] as string;
      if (dayValue === 'Off') {
        scheduleForm.value[day.value as keyof DoctorScheduleForm].available = false;
      } else {
        scheduleForm.value[day.value as keyof DoctorScheduleForm].available = true;
        const times = dayValue.split(' - ');
        if (times.length === 2) {
          // Convert AM/PM time to 24h format (simplified)
          scheduleForm.value[day.value as keyof DoctorScheduleForm].startTime = convertTo24Hour(
            times[0] ?? '',
          );
          scheduleForm.value[day.value as keyof DoctorScheduleForm].endTime = convertTo24Hour(
            times[1] ?? '',
          );
        }
      }
    });

    // Initialize doctor info
    const doctorInfo = doctors.value.find((d) => d.id === doctor.id);
    if (doctorInfo) {
      doctorInfoForm.value = {
        name: doctorInfo.name,
        specialty: doctorInfo.specialty,
        email: 'doctor@example.com', // This would come from the database
        phone: '(555) 123-4567', // This would come from the database
        appointmentDuration: 30,
        maxPatients: 20,
        allowWalkIns: true,
        allowUrgentCases: true,
      };
    }
  }

  scheduleDialog.value = true;
};

const convertTo24Hour = (timeStr: string) => {
  // Very simple conversion - would need to be more robust in a real app
  const [time, period] = timeStr.split(' ');
  if (!time) {
    return '';
  }
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours ?? '0');

  if (period === 'PM' && hour < 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${minutes}`;
};

const saveSchedule = () => {
  // if (!selectedDoctorSchedule.value) return;

  // // Update the doctor schedule in the table
  // if (!selectedDoctorSchedule.value) return;
  // const index = doctorSchedules.value.findIndex((d) => d.id === selectedDoctorSchedule.value.id);
  // if (index !== -1) {
  //   // Convert the form data back to display format
  //   const updatedSchedule = { ...doctorSchedules.value[index] };

  //   weekdays.forEach((day) => {
  //     if (scheduleForm.value[day.value as keyof DoctorScheduleForm].available) {
  //       const startTime = formatTimeFor12Hour(
  //         scheduleForm.value[day.value as keyof DoctorScheduleForm].startTime,
  //       );
  //       const endTime = formatTimeFor12Hour(
  //         scheduleForm.value[day.value as keyof DoctorScheduleForm].endTime,
  //       );
  //       (updatedSchedule as any)[day.value] = `${startTime} - ${endTime}`;
  //     } else {
  //       updatedSchedule[day.value as keyof DoctorSchedule] = 'Off';
  //     }
  //   });

  //   doctorSchedules.value[index] = updatedSchedule;

  //   // Update doctor info
  //   const doctorIndex = doctors.value.findIndex((d) => d.id === selectedDoctorSchedule.value.id);
  //   if (doctorIndex !== -1) {
  //     doctors.value[doctorIndex].name = doctorInfoForm.value.name;
  //     doctors.value[doctorIndex].specialty = doctorInfoForm.value.specialty;
  //     // Other fields would be updated here
  //   }

  // }

  $q.notify({
    color: 'positive',
    message: `Schedule updated for ${doctorInfoForm.value.name}`,
    icon: 'check_circle',
  });
  scheduleDialog.value = false;
};

// const formatTimeFor12Hour = (time24: string) => {
//   // Convert 24h format back to 12h with AM/PM
//   const [hours, minutes] = time24.split(':');
//   let hour = parseInt(hours);
//   const period = hour >= 12 ? 'PM' : 'AM';

//   if (hour > 12) {
//     hour -= 12;
//   } else if (hour === 0) {
//     hour = 12;
//   }

//   return `${hour}:${minutes} ${period}`;
// };

const openNewDoctorDialog = () => {
  newDoctorForm.value = {
    name: '',
    specialty: '',
    email: '',
    phone: '',
  };

  newDoctorDialog.value = true;
};

const saveNewDoctor = () => {
  // Add 'Dr. ' prefix if not already present
  let doctorName = newDoctorForm.value.name;
  if (!doctorName.startsWith('Dr. ')) {
    doctorName = `Dr. ${doctorName}`;
  }

  // Create new doctor entries
  const newDoctorId = doctors.value.length + 1;

  // Add to doctors list
  doctors.value.push({
    id: newDoctorId,
    name: doctorName,
    status: 'Available',
    specialty: newDoctorForm.value.specialty,
    todayPatients: 0,
    nextAvailable: null,
    currentPatient: null,
    patientStartTime: null,
    patientReason: null,
  });

  // Add to schedules
  doctorSchedules.value.push({
    id: newDoctorId,
    doctorName: doctorName,
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 5:00 PM',
  });

  // Add empty queue
  patientQueue.value.push({
    doctorId: newDoctorId,
    patients: [],
  });

  $q.notify({
    color: 'positive',
    message: `New doctor added: ${doctorName}`,
    icon: 'check_circle',
  });

  newDoctorDialog.value = false;
};

const addTimeOff = () => {
  timeOffForm.value = {
    startDate: '',
    endDate: '',
    reason: null,
    notes: '',
  };

  timeOffDialog.value = true;
};

const saveTimeOff = () => {
  timeOffList.value.push({
    startDate: timeOffForm.value.startDate,
    endDate: timeOffForm.value.endDate,
    reason: timeOffForm.value.reason ?? '',
  });

  $q.notify({
    color: 'positive',
    message: 'Time off added to schedule',
    icon: 'check_circle',
  });

  timeOffDialog.value = false;
};

const removeTimeOff = (index: number) => {
  timeOffList.value.splice(index, 1);

  $q.notify({
    color: 'info',
    message: 'Time off removed from schedule',
    icon: 'delete',
  });
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
};

// const callInPatient = (doctor: Doctor, patient: Patient) => {
//   if (doctor.status !== 'Available') {
//     $q.dialog({
//       title: 'Doctor is Not Available',
//       message: `${doctor.name} is currently busy. Do you want to assign the patient to another doctor?`,
//       cancel: true,
//       persistent: true,
//     }).onOk(() => {
//       // This would show a dialog to select another doctor
//       $q.notify({
//         color: 'info',
//         message: 'Patient reassignment would be handled here',
//         icon: 'info',
//       });
//     });
//     return;
//   }

//   // Update doctor status
//   const doctorIndex = doctors.value.findIndex((d) => d.id === doctor.id);
//   if (doctorIndex !== -1) {
//     doctors.value[doctorIndex].status = 'Busy';
//     doctors.value[doctorIndex].currentPatient = patient.name;
//     doctors.value[doctorIndex].patientStartTime = format(new Date(), 'h:mm a');
//     doctors.value[doctorIndex].patientReason = patient.reason;
//   }

//   // Remove patient from queue
//   const queueIndex = patientQueue.value.findIndex((q) => q.doctorId === doctor.id);
//   if (queueIndex !== -1) {
//     const patientIndex = patientQueue.value[queueIndex].patients.findIndex(
//       (p) => p.name === patient.name,
//     );
//     if (patientIndex !== -1) {
//       patientQueue.value[queueIndex].patients.splice(patientIndex, 1);
//     }
//   }

//   $q.notify({
//     color: 'positive',
//     message: `${patient.name} is now with ${doctor.name}`,
//     icon: 'check_circle',
//   });
// };

const autoAssignPatients = () => {
  // This would implement a smart algorithm to assign patients to doctors
  // based on specialty, wait time, urgency, etc.

  $q.notify({
    color: 'info',
    message: 'Auto-assignment algorithm would run here',
    icon: 'info',
  });
};

const refreshQueue = () => {
  loading.value = true;

  // Simulate API refresh
  setTimeout(() => {
    loading.value = false;

    $q.notify({
      color: 'positive',
      message: 'Patient queue refreshed',
      icon: 'refresh',
    });
  }, 800);
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
.doctor-card {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
