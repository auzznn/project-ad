from django.db import models
from django.core import validators
from django.utils import timezone
from authentication.models import MigrateStudent

from base.models import GeneralQuerySet

class DisciplineRecordQuerySet(GeneralQuerySet):
    pass

class DisciplineTypeQuerySet(GeneralQuerySet):
    pass

# Create your models here.
class DisciplineType(models.Model):
    name = models.CharField(max_length=100, blank=False)
    description = models.CharField(max_length=256, blank=False)
    points = models.IntegerField(
        default=-1, validators=[validators.MaxValueValidator(-1)]
    )
    tag = models.CharField(max_length=50, blank=False)
    
    objects = DisciplineTypeQuerySet.as_manager()

    def __str__(self) -> str:
        return self.name

    def clean(self):
        # Optional: ensure internal logic also respects the rule
        if self.points >= 0:
            from django.core.exceptions import ValidationError

            raise ValidationError({"points": "Points must be a negative integer."})


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
    
    objects = DisciplineRecordQuerySet.as_manager()
