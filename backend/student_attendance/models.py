from django.db import models
from django.utils import timezone
from authentication.models import MigrateStudent
from datetime import time
from django.conf import settings
import pytz

from . import const
from base.utils import default_datetime as _default_datetime, set_timezone


class StudentAttendanceQuerySet(models.QuerySet):
    def today(self):
        # Centralized timezone-aware 'today' logic
        today_date = _default_datetime().date()
        return self.filter(date=today_date)


# Create your models here.
class StudentAttendance(models.Model):
    ON_TIME_CODE = "on-time"
    ABSENT_CODE = "absent"

    def default_datetime():
        return _default_datetime()

    DEFAULT_STATUS = const.ABSENT_STATUS_KEY
    ON_TIME = time(hour=7, minute=40)
    ABSENT_TIME = default_datetime().time()

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
    objects = StudentAttendanceQuerySet.as_manager()

    def __str__(self) -> str:
        return self.migrate_student_id.fullname

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
