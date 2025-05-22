# Migraciones y Modelos para Laravel basados en los Componentes

Basándome en los componentes e interfaces que has compartido, puedo crear un conjunto de migraciones y modelos para Laravel que representen esta aplicación de gestión médica. Aquí está una implementación completa:

## Migraciones

### 1. Creación de Tablas Base

```bash
php artisan make:migration create_doctors_table --create=doctors
php artisan make:migration create_patients_table --create=patients
php artisan make:migration create_appointments_table --create=appointments
php artisan make:migration create_medical_records_table --create=medical_records
php artisan make:migration create_payments_table --create=payments
php artisan make:migration create_time_offs_table --create=time_offs
php artisan make:migration create_waiting_room_entries_table --create=waiting_room_entries
```

### 2. Implementación de las Migraciones

#### Doctors Table

```php
// database/migrations/xxxx_xx_xx_create_doctors_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('specialty');
            $table->string('email')->unique();
            $table->string('phone');
            $table->enum('status', ['Available', 'Busy', 'Unavailable'])->default('Available');
            $table->integer('appointment_duration')->default(30); // en minutos
            $table->integer('max_patients_per_day')->default(20);
            $table->boolean('allow_walk_ins')->default(true);
            $table->boolean('allow_urgent_cases')->default(true);
            $table->string('current_patient')->nullable();
            $table->string('patient_start_time')->nullable();
            $table->string('patient_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('doctors');
    }
};
```

#### Patients Table

```php
// database/migrations/xxxx_xx_xx_create_patients_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('dob');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_number')->nullable();
            $table->date('last_visit')->nullable();
            $table->boolean('has_urgent_flag')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('patients');
    }
};
```

#### Appointments Table

```php
// database/migrations/xxxx_xx_xx_create_appointments_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('time');
            $table->string('type');
            $table->text('notes')->nullable();
            $table->enum('status', ['Scheduled', 'Checked In', 'With Doctor', 'Completed', 'Cancelled', 'No-show'])->default('Scheduled');
            $table->boolean('is_urgent')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('appointments');
    }
};
```

#### Medical Records Table

```php
// database/migrations/xxxx_xx_xx_create_medical_records_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->string('diagnosis');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('medical_record_treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained()->onDelete('cascade');
            $table->string('treatment');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('medical_record_treatments');
        Schema::dropIfExists('medical_records');
    }
};
```

#### Payments Table

```php
// database/migrations/xxxx_xx_xx_create_payments_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['Appointment', 'Consultation']);
            $table->string('method');
            $table->text('notes')->nullable();
            $table->dateTime('paid_at');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
```

#### Time Offs Table

```php
// database/migrations/xxxx_xx_xx_create_time_offs_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('time_offs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('reason');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('time_offs');
    }
};
```

#### Doctor Schedules Table

```php
// database/migrations/xxxx_xx_xx_create_doctor_schedules_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('doctor_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->boolean('available')->default(true);
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Un doctor solo puede tener un horario por día
            $table->unique(['doctor_id', 'day_of_week']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('doctor_schedules');
    }
};
```

#### Waiting Room Entries

```php
// database/migrations/xxxx_xx_xx_create_waiting_room_entries_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('waiting_room_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['Appointment', 'Walk-in']);
            $table->enum('urgency', ['Urgent', 'Medium', 'Low']);
            $table->dateTime('check_in_time');
            $table->integer('wait_time')->default(0); // en minutos
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('waiting_room_entries');
    }
};
```

## Modelos

### Doctor.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'specialty',
        'email',
        'phone',
        'status',
        'appointment_duration',
        'max_patients_per_day',
        'allow_walk_ins',
        'allow_urgent_cases',
        'current_patient',
        'patient_start_time',
        'patient_reason',
    ];

    protected $casts = [
        'allow_walk_ins' => 'boolean',
        'allow_urgent_cases' => 'boolean',
    ];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(DoctorSchedule::class);
    }

    public function timeOffs(): HasMany
    {
        return $this->hasMany(TimeOff::class);
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function waitingRoomEntries(): HasMany
    {
        return $this->hasMany(WaitingRoomEntry::class);
    }
}
```

### Patient.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'dob',
        'phone',
        'email',
        'address',
        'insurance_provider',
        'insurance_number',
        'last_visit',
        'has_urgent_flag',
        'notes',
    ];

    protected $casts = [
        'dob' => 'date',
        'last_visit' => 'date',
        'has_urgent_flag' => 'boolean',
    ];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function waitingRoomEntries(): HasMany
    {
        return $this->hasMany(WaitingRoomEntry::class);
    }

    // Calculamos la próxima cita programada
    public function getNextAppointmentAttribute()
    {
        return $this->appointments()
            ->where('date', '>=', now()->format('Y-m-d'))
            ->where('status', 'Scheduled')
            ->orderBy('date')
            ->orderBy('time')
            ->first();
    }
}
```

### Appointment.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'date',
        'time',
        'type',
        'notes',
        'status',
        'is_urgent',
    ];

    protected $casts = [
        'date' => 'date',
        'is_urgent' => 'boolean',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function waitingRoomEntry(): HasOne
    {
        return $this->hasOne(WaitingRoomEntry::class);
    }
}
```

### MedicalRecord.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'date',
        'diagnosis',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function treatments(): HasMany
    {
        return $this->hasMany(MedicalRecordTreatment::class);
    }
}
```

### MedicalRecordTreatment.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalRecordTreatment extends Model
{
    use HasFactory;

    protected $fillable = [
        'medical_record_id',
        'treatment',
    ];

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }
}
```

### Payment.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'appointment_id',
        'amount',
        'type',
        'method',
        'notes',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
```

### TimeOff.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeOff extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'start_date',
        'end_date',
        'reason',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
```

### DoctorSchedule.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'day_of_week',
        'available',
        'start_time',
        'end_time',
        'notes',
    ];

    protected $casts = [
        'available' => 'boolean',
    ];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
```

### WaitingRoomEntry.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaitingRoomEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_id',
        'type',
        'urgency',
        'check_in_time',
        'wait_time',
        'is_active',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
```

## Funcionalidad de Consulta

Estos modelos te permiten realizar consultas como:

```php
// Obtener todas las citas de un paciente
$patient = Patient::find(1);
$appointments = $patient->appointments;

// Obtener el historial médico completo de un paciente con sus tratamientos
$medicalHistory = Patient::find(1)->medicalRecords()->with('treatments')->get();

// Obtener todos los pacientes en espera con urgencia alta
$urgentPatients = WaitingRoomEntry::where('urgency', 'Urgent')
    ->where('is_active', true)
    ->with('patient')
    ->get();

// Obtener las citas del día para un doctor
$today = now()->format('Y-m-d');
$doctorAppointments = Doctor::find(1)->appointments()
    ->where('date', $today)
    ->orderBy('time')
    ->get();

// Verificar disponibilidad de un doctor en una fecha
$isAvailable = Doctor::find(1)
    ->timeOffs()
    ->where('start_date', '<=', $checkDate)
    ->where('end_date', '>=', $checkDate)
    ->doesntExist();
```

Esta estructura proporciona una base sólida para desarrollar toda la funcionalidad que muestras en tus componentes Vue, permitiendo la gestión completa de pacientes, médicos, citas, pagos y sala de espera.
