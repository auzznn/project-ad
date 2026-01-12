import random
from datetime import date, time, timedelta, datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
import pytz

# Import your models and serializer
from authentication.models import MigrateStudent
from student_attendance.models import StudentAttendance
from student_attendance.serializer import RecordStudentAttendanceSerializer

from base.utils import set_timezone


class Command(BaseCommand):
    help = "Generates attendance records using the logic from RecordStudentAttendanceSerializer"

    def add_arguments(self, parser):
        parser.add_argument("--start", type=str, help="Start date (YYYY-MM-DD)")
        parser.add_argument("--end", type=str, help="End date (YYYY-MM-DD)")

    def handle(self, *args, **options):
        # Parse dates or default to last 5 days
        start_str = (
            options.get("start")
            or (timezone.now().date() - timedelta(days=5)).isoformat()
        )
        end_str = options.get("end") or timezone.now().date().isoformat()

        date_start = date.fromisoformat(start_str)
        date_end = date.fromisoformat(end_str)

        students = MigrateStudent.objects.all()
        current_date = date_start

        while current_date <= date_end:
            # Skip weekends
            if current_date.weekday() >= 5:
                current_date += timedelta(days=1)
                continue

            self.stdout.write(f"Processing {current_date}...")

            for student in students:
                # 1. Create the 'Absent' base record for the day
                # We use set_timezone on the default_datetime to stay consistent
    
                absent_ts = timezone.datetime.combine(date=current_date, time=time.min)
                absent_ts = set_timezone(absent_ts)
                print(f"absent_ts: {absent_ts}")

                attendance_base, created = StudentAttendance.objects.get_or_create(
                    student_id=student,
                    date=current_date,
                    defaults={"timestamp": absent_ts},
                )

                # 2. 15% chance to remain absent (skip serializer call)
                if random.random() < 0.15:
                    continue

                # 3. Generate a random clock-in time (07:00 - 08:00)
                naive_dt = datetime.combine(current_date, time(7, 0))
                random_ts = naive_dt + timedelta(seconds=random.randint(0, 3600))

                # Use your utility to make it 'Aware' and set to project TZ
                aware_ts = set_timezone(random_ts)
                print(f'aware_ts: {aware_ts}')

                # 4. Use the Serializer
                # We pass the attendance_base as the instance so validate() bypasses the 'today' lock
                data = {"student_id": student.id, "timestamp": aware_ts}

                serializer = RecordStudentAttendanceSerializer(
                    instance=attendance_base, data=data
                )

                if serializer.is_valid():
                    serializer.save()
                else:
                    # If it's already clocked in, the serializer validation will catch it
                    self.stdout.write(
                        self.style.WARNING(
                            f"Skipped {student.fullname}: {serializer.errors.get('non_field_errors', ['Unknown error'])[0]}"
                        )
                    )

            current_date += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS("Attendance seeding complete!"))
