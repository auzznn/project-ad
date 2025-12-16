from django.contrib import admin
from .models import DisciplineRecord, DisciplineType

# Register your models here.
admin.site.register(DisciplineType)
admin.site.register(DisciplineRecord)