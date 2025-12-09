from celery import shared_task
from django.utils import timezone
from .models import RMTRecord
from authentication.models import Student

@shared_task
def create_rmt_record() -> str:
   n_create: int = 0
   for student in Student.objects.filter(rmt_elligible=True):
      query = RMTRecord.objects.filter(student_id=student, created_at__date=timezone.now().date())
      if len(query) != 0:
         continue
      RMTRecord.objects.create(student_id=student)
      n_create += 1
   
   return f'Successfully create {n_create} RMT Record'