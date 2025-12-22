from celery import shared_task
from django.utils import timezone
from authentication.models import MigrateStudent
from student_attendance.models import StudentAttendance
from base.utils import set_timezone

@shared_task
def create_student_attendance() -> str:
   n_create: int = 0
   for student in MigrateStudent.objects.all():
      query = StudentAttendance.objects.filter(migrate_student_id=student, date=set_timezone(timezone.now()))
      if len(query) != 0:
         continue
      StudentAttendance.objects.create(migrate_student_id=student)
      n_create += 1
   
   return f'Successfully create {n_create} student attendance'