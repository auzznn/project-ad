from django.db import models
from django.utils import timezone
from authentication.models import MigrateStudent
from datetime import time
from . import const

from django.conf import settings
import pytz


def set_timezone(datetime: timezone.datetime):
    tz = pytz.timezone(settings.TIME_ZONE)
    return datetime.astimezone(tz)


# Create your models here.
class StudentAttendance(models.Model):
    ON_TIME_CODE = "on-time"
    ABSENT_CODE = "absent"

    def default_datetime():
        now_kl = set_timezone(timezone.now())
        return now_kl.replace(hour=0, minute=0, second=0, microsecond=0)

    DEFAULT_STATUS = const.ABSENT_STATUS_KEY
    ON_TIME = time(hour=7, minute=40)
    ABSENT_TIME = default_datetime().time()

    """ student_id = models.ForeignKey(
        Student, related_name="attendance", on_delete=models.CASCADE
    ) """
    migrate_student_id = models.ForeignKey(
        MigrateStudent,
        related_name="attendance",
        on_delete=models.CASCADE,
        null=True,
    )
    status = models.CharField(
        choices=const.STUDENT_ATTENDANCE_STATUS, default=DEFAULT_STATUS, max_length=15
    )
    date = models.DateField(default=timezone.now)
    timestamp = models.DateTimeField(default=default_datetime)
    note = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.student_id.user} {self.date}"

    def save(self, *args, **kwargs):
        if set_timezone(self.timestamp).time() == self.ABSENT_TIME:
            self.status = const.ABSENT_STATUS_KEY
            return super().save(*args, **kwargs)
        new_status = (
            const.LATE_STATUS_KEY
            if self.timestamp.time() > self.ON_TIME
            else const.ON_TIME_STATUS_KEY
        )
        self.status = new_status
        return super().save(*args, **kwargs)
