from django.contrib import admin
from .models import MyUser, Student

# Register your models here.
admin.site.register(MyUser)
admin.site.register(Student)