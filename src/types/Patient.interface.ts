export interface Appointment {
  date: string;
  doctor: string;
  reason: string;
  status: string;
}

export interface MedicalRecord {
  date: string;
  doctor: string;
  diagnosis: string;
  notes: string;
  treatments: string[];
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  address: string;
  insuranceProvider: string | null;
  insuranceNumber: string;
  lastVisit: string | null;
  nextAppointment: string | null;
  hasUrgentFlag: boolean;
  appointments: Appointment[];
  medicalHistory: MedicalRecord[];
  notes?: string;
}
