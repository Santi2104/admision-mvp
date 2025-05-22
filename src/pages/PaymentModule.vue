<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <h4 class="q-my-md">
          <q-icon name="payments" size="sm" class="q-mr-sm" />
          Payment Management
        </h4>
      </div>

      <!-- Payment Processing Section -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-tabs v-model="paymentTab" class="text-primary" align="justify" narrow-indicator dense>
            <q-tab name="appointment" label="Appointment Payment" icon="event_available" />
            <q-tab name="consultation" label="Consultation Payment" icon="medical_services" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="paymentTab" animated>
            <!-- Appointment Payment Panel -->
            <q-tab-panel name="appointment">
              <div class="text-h6 q-mb-md">Process Appointment Payment</div>
              <q-form @submit="processPayment" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-select
                      v-model="appointmentPayment.patient"
                      :options="scheduledPatients"
                      option-label="name"
                      label="Select Patient *"
                      outlined
                      emit-value
                      map-options
                      :rules="[(val) => !!val || 'Please select a patient']"
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                            <q-item-label caption>
                              {{ scope.opt.appointmentTime }} with {{ scope.opt.doctor }}
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-badge color="primary"> ${{ scope.opt.appointmentCost }} </q-badge>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="appointmentPayment.amount"
                      type="number"
                      label="Amount *"
                      outlined
                      prefix="$"
                      :rules="[(val) => !!val || 'Amount is required']"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="appointmentPayment.method"
                      :options="paymentMethods"
                      label="Payment Method *"
                      outlined
                      :rules="[(val) => !!val || 'Payment method is required']"
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      v-model="appointmentPayment.notes"
                      type="textarea"
                      label="Notes"
                      outlined
                      rows="3"
                    />
                  </div>
                </div>

                <div class="row justify-end q-mt-md">
                  <q-btn label="Process Payment" type="submit" color="primary" />
                </div>
              </q-form>
            </q-tab-panel>

            <!-- Consultation Payment Panel -->
            <q-tab-panel name="consultation">
              <div class="text-h6 q-mb-md">Process Consultation Payment</div>
              <q-form @submit="processConsultationPayment" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-select
                      v-model="consultationPayment.patient"
                      :options="waitingPatients"
                      option-label="name"
                      label="Select Patient *"
                      outlined
                      emit-value
                      map-options
                      :rules="[(val) => !!val || 'Please select a patient']"
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                            <q-item-label caption>
                              Waiting Time: {{ scope.opt.waitTime }}m
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-badge :color="scope.opt.isUrgent ? 'negative' : 'primary'">
                              ${{ scope.opt.consultationCost }}
                            </q-badge>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="consultationPayment.amount"
                      type="number"
                      label="Amount *"
                      outlined
                      prefix="$"
                      :rules="[(val) => !!val || 'Amount is required']"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="consultationPayment.method"
                      :options="paymentMethods"
                      label="Payment Method *"
                      outlined
                      :rules="[(val) => !!val || 'Payment method is required']"
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      v-model="consultationPayment.notes"
                      type="textarea"
                      label="Notes"
                      outlined
                      rows="3"
                    />
                  </div>
                </div>

                <div class="row justify-end q-mt-md">
                  <q-btn label="Process Payment" type="submit" color="primary" />
                </div>
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>

      <!-- Payment Summary -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Today's Summary</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-card class="bg-primary text-white text-center q-pa-sm">
                  <div class="text-h4">{{ todayStats.totalPayments }}</div>
                  <div class="text-caption">Payments</div>
                </q-card>
              </div>
              <div class="col-6">
                <q-card class="bg-positive text-white text-center q-pa-sm">
                  <div class="text-h4">${{ todayStats.totalAmount }}</div>
                  <div class="text-caption">Revenue</div>
                </q-card>
              </div>
            </div>

            <q-list separator class="q-mt-md">
              <q-item>
                <q-item-section>
                  <q-item-label>Appointments</q-item-label>
                  <q-item-label caption>{{ todayStats.appointments }} payments</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary" outline>${{ todayStats.appointmentAmount }}</q-badge>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label>Consultations</q-item-label>
                  <q-item-label caption>{{ todayStats.consultations }} payments</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="secondary" outline>${{ todayStats.consultationAmount }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Recent Payments -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6">Recent Payments</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <q-list separator>
              <q-item v-for="payment in recentPayments" :key="payment.id">
                <q-item-section>
                  <q-item-label>{{ payment.patientName }}</q-item-label>
                  <q-item-label caption> {{ payment.date }} • {{ payment.method }} </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-weight-medium">${{ payment.amount }}</div>
                  <q-badge
                    :color="payment.type === 'Appointment' ? 'primary' : 'secondary'"
                    outline
                  >
                    {{ payment.type }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Payment Receipt Dialog -->
    <q-dialog v-model="receiptDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Payment Receipt</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="currentReceipt">
          <div class="text-center q-mb-md">
            <div class="text-h5 text-primary">OphthalmoClinic</div>
            <div class="text-subtitle2">Payment Receipt</div>
          </div>

          <q-separator class="q-my-md" />

          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <div class="text-weight-medium">Patient:</div>
              <div>{{ currentReceipt.patientName }}</div>
            </div>

            <div class="col-6">
              <div class="text-weight-medium">Date:</div>
              <div>{{ currentReceipt.date }}</div>
            </div>

            <div class="col-6">
              <div class="text-weight-medium">Receipt #:</div>
              <div>{{ currentReceipt.id }}</div>
            </div>

            <div class="col-12">
              <div class="text-weight-medium">Service:</div>
              <div>{{ currentReceipt.type }}</div>
            </div>

            <div class="col-6">
              <div class="text-weight-medium">Amount:</div>
              <div>${{ currentReceipt.amount }}</div>
            </div>

            <div class="col-6">
              <div class="text-weight-medium">Payment Method:</div>
              <div>{{ currentReceipt.method }}</div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-center text-grey-8">Thank you for your payment!</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Print" color="primary" icon="print" @click="printReceipt" />
          <q-btn flat label="Email" color="secondary" icon="email" @click="emailReceipt" />
          <q-btn flat label="Close" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

// Define interfaces
interface Patient {
  id: string;
  name: string;
  appointmentTime?: string;
  doctor?: string;
  appointmentCost?: number;
  waitTime?: number;
  isUrgent?: boolean;
  consultationCost?: number;
}

interface PaymentReceipt {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  method: string;
  type: 'Appointment' | 'Consultation';
}

interface PaymentForm {
  patient: Patient | null;
  amount: number | null;
  method: string | null;
  notes: string;
}

const $q = useQuasar();
const paymentTab = ref('appointment');
const receiptDialog = ref(false);

// Sample data
const scheduledPatients: Patient[] = [
  {
    id: 'P1001',
    name: 'John Doe',
    appointmentTime: '10:00 AM',
    doctor: 'Dr. Sarah Johnson',
    appointmentCost: 150,
  },
  {
    id: 'P1002',
    name: 'Maria Garcia',
    appointmentTime: '11:30 AM',
    doctor: 'Dr. Michael Chen',
    appointmentCost: 150,
  },
];

const waitingPatients: Patient[] = [
  {
    id: 'P1003',
    name: 'Robert Smith',
    waitTime: 15,
    isUrgent: true,
    consultationCost: 200,
  },
  {
    id: 'P1004',
    name: 'Lisa Taylor',
    waitTime: 10,
    isUrgent: false,
    consultationCost: 100,
  },
];

const paymentMethods: string[] = ['Cash', 'Credit Card', 'Debit Card', 'Insurance'];

const todayStats = ref({
  totalPayments: 15,
  totalAmount: 2250,
  appointments: 10,
  appointmentAmount: 1500,
  consultations: 5,
  consultationAmount: 750,
});

const recentPayments = ref<PaymentReceipt[]>([
  {
    id: 'PMT001',
    patientName: 'John Doe',
    amount: 150,
    date: '10:15 AM',
    method: 'Credit Card',
    type: 'Appointment',
  },
  {
    id: 'PMT002',
    patientName: 'Maria Garcia',
    amount: 200,
    date: '10:30 AM',
    method: 'Cash',
    type: 'Consultation',
  },
  {
    id: 'PMT003',
    patientName: 'Robert Smith',
    amount: 150,
    date: '11:00 AM',
    method: 'Insurance',
    type: 'Appointment',
  },
]);

const appointmentPayment = ref<PaymentForm>({
  patient: null,
  amount: null,
  method: null,
  notes: '',
});

const consultationPayment = ref<PaymentForm>({
  patient: null,
  amount: null,
  method: null,
  notes: '',
});

// Aplicando la interfaz a currentReceipt
const currentReceipt = ref<PaymentReceipt | null>(null);

const processPayment = () => {
  if (
    !appointmentPayment.value.patient ||
    !appointmentPayment.value.amount ||
    !appointmentPayment.value.method
  ) {
    return;
  }

  // Create receipt with proper typing
  const receipt: PaymentReceipt = {
    id: `PMT${Math.floor(Math.random() * 1000)}`,
    patientName: appointmentPayment.value.patient.name,
    amount: appointmentPayment.value.amount,
    date: new Date().toLocaleTimeString(),
    method: appointmentPayment.value.method,
    type: 'Appointment',
  };

  currentReceipt.value = receipt;
  recentPayments.value.unshift(receipt);

  // Update stats
  todayStats.value.totalPayments++;
  todayStats.value.totalAmount += appointmentPayment.value.amount;
  todayStats.value.appointments++;
  todayStats.value.appointmentAmount += appointmentPayment.value.amount;

  // Show receipt
  receiptDialog.value = true;

  // Reset form
  appointmentPayment.value = {
    patient: null,
    amount: null,
    method: null,
    notes: '',
  };

  $q.notify({
    color: 'positive',
    message: 'Payment processed successfully',
    icon: 'check_circle',
  });
};

const processConsultationPayment = () => {
  if (
    !consultationPayment.value.patient ||
    !consultationPayment.value.amount ||
    !consultationPayment.value.method
  ) {
    return;
  }

  // Create receipt with proper typing
  const receipt: PaymentReceipt = {
    id: `PMT${Math.floor(Math.random() * 1000)}`,
    patientName: consultationPayment.value.patient.name,
    amount: consultationPayment.value.amount,
    date: new Date().toLocaleTimeString(),
    method: consultationPayment.value.method,
    type: 'Consultation',
  };

  currentReceipt.value = receipt;
  recentPayments.value.unshift(receipt);

  // Update stats
  todayStats.value.totalPayments++;
  todayStats.value.totalAmount += consultationPayment.value.amount;
  todayStats.value.consultations++;
  todayStats.value.consultationAmount += consultationPayment.value.amount;

  // Show receipt
  receiptDialog.value = true;

  // Reset form
  consultationPayment.value = {
    patient: null,
    amount: null,
    method: null,
    notes: '',
  };

  $q.notify({
    color: 'positive',
    message: 'Consultation payment processed successfully',
    icon: 'check_circle',
  });
};

const printReceipt = () => {
  $q.notify({
    color: 'info',
    message: 'Printing receipt...',
    icon: 'print',
  });
  // Implement print functionality
};

const emailReceipt = () => {
  $q.notify({
    color: 'info',
    message: 'Sending receipt by email...',
    icon: 'email',
  });
  // Implement email functionality
};
</script>

<style lang="scss" scoped>
.payment-card {
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}
</style>
