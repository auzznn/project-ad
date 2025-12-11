from celery import shared_task
from django.utils import timezone
from authentication.models import Student
from student_attendance.models import StudentAttendance
import pytz

@shared_task
def create_student_attendance() -> str:
   n_create: int = 0
   kuala_lumpur = pytz.timezone('Asia/Kuala_Lumpur')
   for student in Student.objects.all():
      query = StudentAttendance.objects.filter(student_id=student, date=timezone.now().astimezone(kuala_lumpur).date())
      if len(query) != 0:
         continue
      StudentAttendance.objects.create(student_id=student)
      n_create += 1
   
   return f'Successfully create {n_create} student attendance'