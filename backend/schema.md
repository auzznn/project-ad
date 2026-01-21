# Django Model Schema Documentation

Generated for QR-Based School Management System Backend

---

## Table of Contents

- [Authentication](#authentication)
- [Record Discipline](#record-discipline)
- [RMT](#rmt)
- [Sahsiah](#sahsiah)
- [Student Attendance](#student-attendance)

---

## Authentication

### MyUser
Extends Django's AbstractUser model.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| username | CharField | unique | Username (inherited) |
| password | CharField | - | Password (inherited) |
| first_name | CharField | max_length=150 | First name (inherited) |
| last_name | CharField | max_length=150 | Last name (inherited) |
| email | EmailField | blank=True | Email (inherited) |
| role | CharField | choices: admin, teacher, student, parent | User role |

**Properties:**
- `fullname`: Returns `{first_name} {last_name}`

---

### Classroom
Represents a school classroom.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | Primary Key | Auto-generated ID |
| grade | IntegerField | min=1, max=6 | Class grade level |
| class_section | CharField | max_length=50 | Class section identifier |
| supervisor | CharField | max_length=50, nullable | Class supervisor name |

**Properties:**
- `name`: Returns `{grade}{class_section}`

---

### Student
Represents a student in the system.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| user | OneToOneField | Primary Key, related_name="student" | Link to MyUser |
| class_room | ForeignKey | nullable, related_name="student" | Link to Classroom |
| qr_code | ImageField | nullable, upload_to="qrcodes/" | Student QR code image |
| rmt_elligible | BooleanField | default=False | Eligibility for RMT program |
| date_of_birth | DateTimeField | - | Student's date of birth |

**Properties:**
- `fullname`: Returns `{user.first_name} {user.last_name}`
- `academic_year`: Returns current year

---

### MigrateStudent
Represents a student record (migration model).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | Primary Key | Auto-generated ID |
| class_room | ForeignKey | nullable, related_name="migrate_student" | Link to Classroom |
| qr_code | ImageField | nullable, upload_to="qrcodes/" | Student QR code image |
| rmt_elligible | BooleanField | default=False | Eligibility for RMT program |
| date_of_birth | DateTimeField | - | Student's date of birth |
| first_name | CharField | max_length=50, required | Student's first name |
| last_name | CharField | max_length=50, required | Student's last name |
| parent | ForeignKey | nullable, related_name="children", limit_choices_to={"role": "parent"} | Link to parent MyUser |

**Properties:**
- `fullname`: Returns `{first_name} {last_name}`
- `academic_year`: Returns current year

**Methods:**
- `generate_qr_image(url_link)`: Generates QR code image from URL
- `get_student_data_url(pk, request, base_url)`: Returns student data URL
- `generate_qr(request, base_url)`: Generates and saves QR code for student

---

## Record Discipline

### DisciplineType
Defines types of disciplinary actions.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | Primary Key | Auto-generated ID |
| name | CharField | max_length=100, required | Discipline type name |
| description | CharField | max_length=256, required | Description of discipline type |
| points | IntegerField | default=0 | Points associated with this discipline |
| tag | CharField | max_length=50, required | Tag for categorization |

---

### DisciplineRecord
Records disciplinary actions for students.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | Primary Key | Auto-generated ID |
| student_id | ForeignKey | nullable, related_name="discipline" | Link to MigrateStudent |
| discipline_type | ForeignKey | related_name="record" | Link to DisciplineType |
| timestamp | DateTimeField | default=timezone.now | When the record was created |

---

## RMT (Rancangan Makanan Tambahan)

### RMTRecord
Records RMT (Additional Meal Plan) participation.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | Primary Key | Auto-generated ID |
| migrate_student_id | ForeignKey | nullable, related_name="rmt" | Link to MigrateStudent |
| is_present | BooleanField | default=False | Whether student was present |
| date | DateField | default=timezone.now | Date of RMT record |
| timestamp | DateTimeField | default=timezone.now | Timestamp of record |

**Custom Manager:**
- `RMTRecordQueryset`: Provides custom queryset methods
  - `today()`: Filter records for today's date

**Methods:**
- `save()`: Automatically sets `is_present` based on timestamp

---

## Sahsiah (Student Character Evaluation)

### SahsiahType
Defines types of character evaluations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | Primary Key | Auto-generated ID |
| name | CharField | max_length=100, required | Sahsiah type name |
| description | CharField | max_length=256, required | Description of sahsiah type |
| points | IntegerField | default=0 | Points associated with this sahsiah |
| tag | CharField | max_length=50, required | Tag for categorization |

---

### SahsiahRecord
Records character evaluations for students.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | Primary Key | Auto-generated ID |
| migrate_student_id | ForeignKey | nullable, related_name="sahsiah" | Link to MigrateStudent |
| sahsiah_type | ForeignKey | - | Link to SahsiahType |
| timestamp | DateTimeField | default=timezone.now | When the record was created |

---

## Student Attendance

### StudentAttendance
Records student attendance.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | AutoField | Primary Key | Auto-generated ID |
| migrate_student_id | ForeignKey | nullable, related_name="attendance" | Link to MigrateStudent |
| status | CharField | max_length=15, choices | Attendance status (on-time, late, absent) |
| date | DateField | default=timezone.now | Date of attendance record |
| timestamp | DateTimeField | default=timezone.now | Timestamp of check-in |
| note | TextField | nullable | Additional notes |

**Constants:**
- `ON_TIME_CODE = "on-time"`
- `ABSENT_CODE = "absent"`
- `ON_TIME = time(hour=7, minute=40)` (7:40 AM)

**Custom Manager:**
- `StudentAttendanceQueryset`: Provides custom queryset methods
  - `today()`: Filter records for today's date
  - `by_year(year)`: Filter records by year
  - `by_student(student)`: Filter records by student
  - `by_month(month)`: Filter records by month

**Methods:**
- `save()`: Automatically determines status based on timestamp:
  - If timestamp equals default time: `ABSENT`
  - If timestamp > 7:40 AM: `LATE`
  - Otherwise: `ON_TIME`

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AUTHENTICATION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐        │
│  │   MyUser     │         │  Classroom   │         │  Student     │        │
│  ├──────────────┤         ├──────────────┤         ├──────────────┤        │
│  │ id (PK)      │         │ id (PK)      │         │ user (1:1)   │──┐     │
│  │ username     │         │ grade        │         │   → MyUser   │  │     │
│  │ password     │         │ class_section│         │ class_room   │  │     │
│  │ first_name   │         │ supervisor   │         │   → Classroom│  │     │
│  │ last_name    │         └──────┬───────┘         │ qr_code      │  │     │
│  │ email        │              │                 │ rmt_elligible │  │     │
│  │ role         │◄─────────────┘                 │ date_of_birth│  │     │
│  └──────┬───────┘                                └──────┬───────┘  │     │
│         │                                                │          │     │
│         │ 1:N                                            │          │     │
│         │ (children)                                     │          │     │
│         │                                                │          │     │
│  ┌──────▼────────────────────────────────────────────────┘          │     │
│  │                                                                  │     │
│  │  ┌─────────────────┐                                            │     │
│  │  │ MigrateStudent  │                                            │     │
│  │  ├─────────────────┤                                            │     │
│  │  │ id (PK)         │                                            │     │
│  │  │ class_room      │──┐                                         │     │
│  │  │   → Classroom   │  │                                         │     │
│  │  │ qr_code         │  │                                         │     │
│  │  │ rmt_elligible   │  │                                         │     │
│  │  │ date_of_birth   │  │                                         │     │
│  │  │ first_name      │  │                                         │     │
│  │  │ last_name       │  │                                         │     │
│  │  │ parent          │──┼─────────────────────────────────────────┘     │
│  │  └─────────────────┘  │                                               │
│  │                        │                                               │
│  └────────────────────────┘                                               │
│                           │                                                │
└───────────────────────────┼────────────────────────────────────────────────┘
                            │
                            │ 1:N
                            │
┌───────────────────────────┼────────────────────────────────────────────────┐
│                           │                                                │
│  ┌────────────────────────▼──────────────────────────────────────────────┐   │
│  │                        RECORD DISCIPLINE                              │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                        │   │
│  │  ┌─────────────────┐         ┌─────────────────┐                       │   │
│  │  │ DisciplineType  │         │ DisciplineRecord│                       │   │
│  │  ├─────────────────┤         ├─────────────────┤                       │   │
│  │  │ id (PK)         │         │ id (PK)         │                       │   │
│  │  │ name            │         │ student_id      │──┐                     │   │
│  │  │ description     │         │   → MigrateStudent│                     │   │
│  │  │ points          │         │ discipline_type │──┐                     │   │
│  │  │ tag             │         │   → DisciplineType│                     │   │
│  │  └─────────────────┘         │ timestamp       │  │                     │   │
│  │                              └─────────────────┘  │                     │   │
│  │                                                     │                     │   │
│  └─────────────────────────────────────────────────────┼─────────────────────┘   │
│                                                        │                         │
├────────────────────────────────────────────────────────┼─────────────────────────┤
│                                                        │                         │
│  ┌─────────────────────────────────────────────────────▼──────────────────────┐ │
│  │                              RMT                                            │ │
│  ├────────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌─────────────────┐                                                    │ │
│  │  │   RMTRecord     │                                                    │ │
│  │  ├─────────────────┤                                                    │ │
│  │  │ id (PK)         │                                                    │ │
│  │  │ migrate_student_id│──┐                                               │ │
│  │  │   → MigrateStudent │                                               │ │
│  │  │ is_present      │                                                    │ │
│  │  │ date            │                                                    │ │
│  │  │ timestamp       │                                                    │ │
│  │  └─────────────────┘                                                    │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                        │                         │
├────────────────────────────────────────────────────────┼─────────────────────────┤
│                                                        │                         │
│  ┌─────────────────────────────────────────────────────▼──────────────────────┐ │
│  │                              SAHSIAH                                        │ │
│  ├────────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌─────────────────┐         ┌─────────────────┐                       │ │
│  │  │  SahsiahType    │         │  SahsiahRecord  │                       │ │
│  │  ├─────────────────┤         ├─────────────────┤                       │ │
│  │  │ id (PK)         │         │ id (PK)         │                       │ │
│  │  │ name            │         │ migrate_student_id│──┐                 │ │
│  │  │ description     │         │   → MigrateStudent │                 │ │
│  │  │ points          │         │ sahsiah_type    │──┐                 │ │
│  │  │ tag             │         │   → SahsiahType   │                 │ │
│  │  └─────────────────┘         │ timestamp       │  │                 │ │
│  │                              └─────────────────┘  │                 │ │
│  │                                                     │                 │ │
│  └─────────────────────────────────────────────────────┼─────────────────┘ │
│                                                        │                   │
├────────────────────────────────────────────────────────┼───────────────────┤
│                                                        │                   │
│  ┌─────────────────────────────────────────────────────▼─────────────────┐ │
│  │                        STUDENT ATTENDANCE                            │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌─────────────────┐                                                    │ │
│  │  │ StudentAttendance│                                                   │ │
│  │  ├─────────────────┤                                                    │ │
│  │  │ id (PK)         │                                                    │ │
│  │  │ migrate_student_id│──┐                                               │ │
│  │  │   → MigrateStudent │                                               │ │
│  │  │ status          │                                                    │ │
│  │  │ date            │                                                    │ │
│  │  │ timestamp       │                                                    │ │
│  │  │ note            │                                                    │ │
│  │  └─────────────────┘                                                    │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                        │                   │
└────────────────────────────────────────────────────────┘                   │
                                                                         │
                                                                         │
                                                                         │
```

---

## Relationships Summary

### Authentication App
- **MyUser** (1:1) → **Student**
- **MyUser** (1:N) → **MigrateStudent** (as parent)
- **Classroom** (1:N) → **Student**
- **Classroom** (1:N) → **MigrateStudent**

### Record Discipline App
- **MigrateStudent** (1:N) → **DisciplineRecord**
- **DisciplineType** (1:N) → **DisciplineRecord**

### RMT App
- **MigrateStudent** (1:N) → **RMTRecord**

### Sahsiah App
- **MigrateStudent** (1:N) → **SahsiahRecord**
- **SahsiahType** (1:N) → **SahsiahRecord**

### Student Attendance App
- **MigrateStudent** (1:N) → **StudentAttendance**

---

## Notes

1. **MigrateStudent** is the central model that connects to all record types (Discipline, RMT, Sahsiah, Attendance)
2. **MyUser** with role "parent" can have multiple children (MigrateStudent records)
3. **Classroom** can have multiple students (both Student and MigrateStudent models)
4. All record models (DisciplineRecord, RMTRecord, SahsiahRecord, StudentAttendance) include timestamps for tracking when records were created
5. **RMTRecord** and **StudentAttendance** have custom querysets for filtering records by date
6. **StudentAttendance** automatically determines status (on-time, late, absent) based on the timestamp of check-in
