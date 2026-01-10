from django.db import models
from django.utils import timezone
from authentication.models import MigrateStudent
from datetime import time

from . import const
from base.utils import default_datetime as _default_datetime, set_timezone
from base.models import GeneralQuerySet


class StudentAttendanceQuerySet(GeneralQuerySet):
    def today(self):
        # Centralized timezone-aware 'today' logic
        today_date = _default_datetime().date()
        return self.filter(date=today_date)
    
    def by_year(self, year: int):
        return self.filter(date__year=year)
    
    def by_student(self, student):
        return self.filter(student_id=student)
    
    def by_month(self, month):
        return self.filter(date__month=month)


# Create your models here.
class StudentAttendance(models.Model):
    def default_datetime():
        return _default_datetime()

    DEFAULT_STATUS = const.ABSENT_STATUS_KEY
    ON_TIME = time(hour=7, minute=40)
    ABSENT_TIME = default_datetime().time()

    student_id = models.ForeignKey(
        MigrateStudent,
        related_name="attendance",
        on_delete=models.CASCADE,
        null=True,
    )
    status = models.CharField(
        choices=const.ATTENDANCE_STATUS_LOOKUP.items(), default=DEFAULT_STATUS, max_length=15
    )
    date = models.DateField(default=timezone.now)
    timestamp = models.DateTimeField(default=default_datetime)
    note = models.TextField(blank=True, null=True)
    objects = StudentAttendanceQuerySet.as_manager()

    def __str__(self) -> str:
        return self.student_id.fullname

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
