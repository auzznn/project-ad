from django.db import models
from django.utils import timezone
from authentication.models import MigrateStudent


# Create your models here.
class DisciplineType(models.Model):
    name = models.CharField(max_length=100, blank=False)
    description = models.CharField(max_length=256, blank=False)
    points = models.IntegerField(default=0)
    tag = models.CharField(max_length=50, blank=False)

    def __str__(self) -> str:
        return self.name


class DisciplineRecord(models.Model):
    student_id = models.ForeignKey(
        MigrateStudent,
        related_name="discipline",
        on_delete=models.CASCADE,
        null=True,
    )
    discipline_type = models.ForeignKey(
        DisciplineType, on_delete=models.CASCADE, related_name="record"
    )
    timestamp = models.DateTimeField(default=timezone.now, blank=False)
