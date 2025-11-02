from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class MyUser(AbstractUser):
  ROLE_CHOICE = [
    ('admin', 'admin'),
    ('teacher', 'teacher'),
    ('student', 'student'),
  ]

  role = models.CharField(max_length=20, choices=ROLE_CHOICE, default="student")

class Classroom(models.Model):
  name = models.CharField(max_length=10, blank=False)
  supervisor = models.CharField(blank=True)

class Student(models.Model):
  user = models.OneToOneField(MyUser, on_delete=models.CASCADE, blank=False)
  class_room = models.ForeignKey(Classroom, on_delete=models.CASCADE, blank=False)
  qr_url = models.URLField()