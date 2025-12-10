from celery import shared_task
from authentication.models import Student

@shared_task
def update_qr_code() -> str:
  n_create: int = 0
  for student in Student.objects.iterator():
    qr_code = student.qr_code
    if qr_code and qr_code.storage.exists(qr_code.name):
      continue
    qr_code.delete(save=True)
    student.save()
    n_create += 1
  return f'Successfully update {n_create} qr code'