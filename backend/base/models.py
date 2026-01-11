from django.db import models

# Create your models here.
class GeneralQuerySet(models.QuerySet):
    def all(self):
        return super().all().order_by("pk")
    
    def filter(self, *args, **kwargs):
        return self.all().__super_filter(*args, **kwargs)
    
    def __super_filter(self, *args, **kwargs):
        return super().filter(*args, **kwargs)