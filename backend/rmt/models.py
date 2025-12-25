from django.db import models
from authentication.models import MigrateStudent
from base.utils import default_datetime as _default_datetime

# Create your models here.
class RMTRecord(models.Model):
    def default_datetime():
        return _default_datetime()
    
    migrate_student_id = models.ForeignKey(
        MigrateStudent,
        related_name="rmt",
        on_delete=models.CASCADE,
        null=True,
    )
    date = models.DateField(default=default_datetime)
    timestamp = models.DateTimeField(default=default_datetime)
