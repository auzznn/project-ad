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
