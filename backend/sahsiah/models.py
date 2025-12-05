from django.db import models

# Create your models here.
class SahsiahType (models.Model):
  name = models.CharField(max_length=100, blank=False)
  description = models.CharField(max_length=256, blank=False)
  points = models.IntegerField(default=0)
  tag = models.CharField(max_length=50, blank=False)

  def __str__(self) -> str:
    return self.name