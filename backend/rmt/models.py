from django.db import models
import pytz
from django.utils import timezone

from authentication.models import MigrateStudent


# Create your models here.
class RMTRecord(models.Model):
    def default_datetime():
        kl_tz = pytz.timezone("Asia/Kuala_Lumpur")
        now_kl = timezone.now().astimezone(kl_tz)
        return now_kl.replace(hour=0, minute=0, second=0, microsecond=0)

    """ student_id = models.ForeignKey(
        Student, blank=False, null=False, on_delete=models.CASCADE
    ) """
    migrate_student_id = models.ForeignKey(
        MigrateStudent,
        related_name="rmt",
        on_delete=models.CASCADE,
        null=True,
    )
    created_at = models.DateTimeField(default=default_datetime)
    updated_at = models.DateTimeField(default=default_datetime)
