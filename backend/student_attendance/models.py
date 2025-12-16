from django.db import models
from django.utils import timezone
from authentication.models import Student
from datetime import time
from django.conf import settings
import pytz

def set_timezone(datetime: timezone.datetime):
  tz = pytz.timezone(settings.TIME_ZONE)
  return datetime.astimezone(tz)

# Create your models here.
class StudentAttendance(models.Model):
  ON_TIME_CODE = "on-time"
  ABSENT_CODE = "absent"
  
  STATUS_ATTENDANCE = [
    (ABSENT_CODE, "Absent"), 
    (ON_TIME_CODE, "On time"), 
    ("late", "Late")
  ]
  
  def default_datetime():
    now_kl = set_timezone(timezone.now())
    return now_kl.replace(hour=0, minute=0, second=0, microsecond=0)
  
  DEFAULT_STATUS = "absent"
  ON_TIME = time(hour=7, minute=40)
  ABSENT_TIME = default_datetime().time()

  
  student_id = models.ForeignKey(Student, related_name="attendance", on_delete=models.CASCADE)
  status = models.CharField(choices=STATUS_ATTENDANCE, default=DEFAULT_STATUS, max_length=15)
  date = models.DateField(default=timezone.now)
  timestamp = models.DateTimeField(default=default_datetime)
  note = models.TextField(blank=True, null=True)

  def __str__(self) -> str:
    return f"{self.student_id.user} {self.date}"

  def save(self, *args, **kwargs):
    if set_timezone(self.timestamp).time() == self.ABSENT_TIME:
      self.status = self.ABSENT_CODE
      return super().save(*args, **kwargs)  
    status_index = 2 if self.timestamp.time() > self.ON_TIME else 1
    self.status = self.STATUS_ATTENDANCE[status_index][0]
    return super().save(*args, **kwargs)