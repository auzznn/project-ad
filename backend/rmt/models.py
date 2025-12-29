from django.db import models
from django.utils import timezone

from authentication.models import MigrateStudent
from base.utils import default_datetime as _default_datetime, set_timezone

class RMTRecordQueryset(models.QuerySet):
    def today(self):
        return self.filter(date=set_timezone(timezone.now()))

# Create your models here.
class RMTRecord(models.Model):
    def default_datetime():
        return _default_datetime()
    objects = RMTRecordQueryset.as_manager()
    
    migrate_student_id = models.ForeignKey(
        MigrateStudent,
        related_name="rmt",
        on_delete=models.CASCADE,
        null=True,
    )
    is_present = models.BooleanField(default=False, null=False, blank=False)
    date = models.DateField(default=default_datetime)
    timestamp = models.DateTimeField(default=default_datetime)
    
    def save(self, *args, **kwargs):
        self.is_present = self.timestamp != _default_datetime()
        return super().save(*args, **kwargs)
