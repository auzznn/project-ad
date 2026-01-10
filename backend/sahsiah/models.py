from django.db import models
from django.utils import timezone
from authentication.models import MigrateStudent

from base.models import GeneralQuerySet

class SahsiahTypeQuerySet(GeneralQuerySet):
    pass

class SahsiahRecordQuerySet(GeneralQuerySet):
    pass

# Create your models here.
class SahsiahType(models.Model):
    name = models.CharField(max_length=100, blank=False)
    description = models.CharField(max_length=256, blank=False)
    points = models.IntegerField(default=0)
    tag = models.CharField(max_length=50, blank=False)
    
    objects = SahsiahTypeQuerySet.as_manager() 

    def __str__(self) -> str:
        return self.name


class SahsiahRecord(models.Model):
    student_id = models.ForeignKey(
        MigrateStudent,
        on_delete=models.CASCADE,
        related_name="sahsiah",
        null=True,
    )
    sahsiah_type = models.ForeignKey(SahsiahType, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now, blank=False)
    objects = SahsiahRecordQuerySet.as_manager()
