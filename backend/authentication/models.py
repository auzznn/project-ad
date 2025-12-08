from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.files import File
from django.contrib.sites.models import Site
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils import timezone

from io import BytesIO
from rest_framework.reverse import reverse
from .const import USER_DETAIL_PATH_NAME
import qrcode as qr
import string
import random

# Create your models here.
class MyUser(AbstractUser):
  ROLE_CHOICE = [
    ('admin', 'admin'),
    ('teacher', 'teacher'),
    ('student', 'student'),
  ]

  role = models.CharField(max_length=20, choices=ROLE_CHOICE, default="student")

  @property
  def fullname(self) -> str:
    return f"{self.first_name} {self.last_name}"
  
class Classroom(models.Model):
  
  def default_section() -> str:
    LENGTH = 15
    characters = string.ascii_letters

    random_section_name = ''.join(random.choice(characters) for i in range(LENGTH))    
    return random_section_name
  
  grade = models.IntegerField(
    blank=False, null=False, default=1, validators=[
    MinValueValidator(1, 'class grade can\'t be below 1'),
    MaxValueValidator(6, 'class grade can\'t be above 6')
  ])
  class_section = models.CharField(max_length=50, blank=False, null=False, default=default_section)
  
  supervisor = models.CharField(blank=True, null=True, max_length=50)

  def __str__(self) -> str:
    return f'{self.grade}{self.class_section}'

class Student(models.Model):
  QR_IMAGE_FORMAT = "jpeg"
  
  user = models.OneToOneField(MyUser, on_delete=models.CASCADE, primary_key=True, related_name='student')
  class_room = models.ForeignKey(Classroom, on_delete=models.CASCADE, blank=True, null=True, related_name='student')
  qr_code = models.ImageField(upload_to='qrcodes/', blank=True, null=True)
  rmt_elligible = models.BooleanField(default=False, blank=False, null=True)

  @classmethod
  def generate_qr_image(cls, url_link: str) -> File:
    
    qr_image = qr.make(url_link)
    buffer = BytesIO()
    qr_image.save(buffer, format=cls.QR_IMAGE_FORMAT)
    return File(buffer, name=f"qr.{cls.QR_IMAGE_FORMAT}")

  def save(self, *args, **kwargs):
    if not self.qr_code:
      SITE_DOMAIN = Site.objects.get_current().domain
      print(self.user.pk)
      URL_PATH = reverse(USER_DETAIL_PATH_NAME, args=[self.user.pk])
      STUDENT_DATA_URL = f'http://{SITE_DOMAIN}{URL_PATH}'
      qr_file = self.generate_qr_image(STUDENT_DATA_URL)
      self.qr_code.save(f'{self.user.username}.{self.QR_IMAGE_FORMAT}', qr_file, save=False)
    super().save(*args, **kwargs)

  def __str__(self) -> str:
    return f'{self.user.first_name} {self.user.last_name}' 
  
  @property
  def academic_year(self) -> str:
    current_time = timezone.now()
    month_threshold = current_time.replace(month=10, day=1, hour=0, minute=0, second=0, microsecond=0)
    
    start_academic_year = current_time.year
    end_academic_year = start_academic_year + 1

    if current_time < month_threshold:
      start_academic_year -= 1
      end_academic_year -= 1

    return f'{start_academic_year}/{end_academic_year}'