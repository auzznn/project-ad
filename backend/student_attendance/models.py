from django.db import models
from django.utils import timezone
from authentication.models import Student

# Create your models here.
class StudentAttendance(models.Model):
  STATUS_ATTENDANCE = [
    ("absent", "Absent"), 
    ("on-time", "On time"), 
    ("late", "Late")
  ]
  DEFAULT_STATUS = "absent"
  
  student_id = models.ForeignKey(Student, related_name="student", on_delete=models.CASCADE)
  status = models.CharField(choices=STATUS_ATTENDANCE, default=DEFAULT_STATUS, max_length=15)
  created_at = models.DateTimeField(default=timezone.now)
  updated_at = models.DateTimeField(default=timezone.now)

  def __str__(self) -> str:
    return f"{self.student_id.user} {self.created_at.strftime('%d/%M/%Y')}"