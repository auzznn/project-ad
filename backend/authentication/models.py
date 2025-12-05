from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.files import File
from django.contrib.sites.models import Site
from io import BytesIO
from rest_framework.reverse import reverse
from .const import USER_DETAIL_PATH_NAME
import qrcode as qr

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
  name = models.CharField(max_length=10, blank=False)
  supervisor = models.CharField(blank=True, null=True, max_length=50)

class Student(models.Model):
  QR_IMAGE_FORMAT = "jpeg"
  
  user = models.OneToOneField(MyUser, on_delete=models.CASCADE, primary_key=True)
  class_room = models.ForeignKey(Classroom, on_delete=models.CASCADE, blank=True, null=True)
  qr_code = models.ImageField(upload_to='qrcodes/', blank=True, null=True)

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