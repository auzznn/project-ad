from django.contrib import admin
from .models import MyUser, MigrateStudent, Classroom

# Register your models here.
admin.site.register(MyUser)
admin.site.register(MigrateStudent)
admin.site.register(Classroom)