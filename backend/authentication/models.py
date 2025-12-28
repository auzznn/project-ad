from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.files import File
from django.contrib.sites.models import Site
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils import timezone

from io import BytesIO
from rest_framework.reverse import reverse
import qrcode as qr
import string
import random

from base.const import STUDENT_BASENAME_PATH


# Create your models here.
class MyUser(AbstractUser):
    ROLE_CHOICE = [
        ("admin", "admin"),
        ("teacher", "teacher"),
        ("student", "student"),
        ("parent", "parent"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICE, default="student")

    @property
    def fullname(self) -> str:
        return f"{self.first_name} {self.last_name}"


class Classroom(models.Model):

    def default_section() -> str:
        LENGTH = 15
        characters = string.ascii_letters

        random_section_name = "".join(random.choice(characters) for i in range(LENGTH))
        return random_section_name

    grade = models.IntegerField(
        blank=False,
        null=False,
        default=1,
        validators=[
            MinValueValidator(1, "class grade can't be below 1"),
            MaxValueValidator(6, "class grade can't be above 6"),
        ],
    )
    class_section = models.CharField(
        max_length=50, blank=False, null=False, default=default_section
    )

    supervisor = models.CharField(blank=True, null=True, max_length=50)

    def __str__(self) -> str:
        return f"{self.grade}{self.class_section}"

    @property
    def name(self) -> str:
        return self.__str__()


class Student(models.Model):
    QR_IMAGE_FORMAT = "jpeg"

    user = models.OneToOneField(
        MyUser, on_delete=models.CASCADE, primary_key=True, related_name="student"
    )
    class_room = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="student",
    )
    qr_code = models.ImageField(upload_to="qrcodes/", blank=True, null=True)
    rmt_elligible = models.BooleanField(default=False, blank=False, null=True)
    date_of_birth = models.DateTimeField(blank=False, null=False, default=timezone.now)

    def __str__(self) -> str:
        return f"{self.user.first_name} {self.user.last_name}"

    @property
    def academic_year(self) -> str:
        return_value = timezone.now().year

        return f"{return_value}"


class MigrateStudent(models.Model):
    QR_IMAGE_FORMAT = "jpeg"

    class_room = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="migrate_student",
    )
    qr_code = models.ImageField(upload_to="qrcodes/", blank=True, null=True)
    rmt_elligible = models.BooleanField(default=False, blank=False, null=True)
    date_of_birth = models.DateTimeField(blank=False, null=False, default=timezone.now)
    first_name = models.CharField(max_length=50, blank=False, null=False)
    last_name = models.CharField(max_length=50, blank=False, null=False)

    parent = models.ForeignKey(
        MyUser,
        on_delete=models.CASCADE,
        related_name="children",
        blank=True,
        null=True,
        limit_choices_to={"role": "parent"},
    )

    @property
    def fullname(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @classmethod
    def generate_qr_image(cls, url_link: str) -> File:
        qr_image = qr.make(url_link)
        buffer = BytesIO()
        qr_image.save(buffer, format=cls.QR_IMAGE_FORMAT)
        buffer.seek(0)
        return File(buffer, name=f"qr.{cls.QR_IMAGE_FORMAT}")

    @staticmethod
    def get_student_data_url(pk, request=None, base_url=None) -> str:
        module_name = "authentication"
        base_name = STUDENT_BASENAME_PATH
        action_name = "detail"

        url_name = f"{module_name}:{base_name}-{action_name}"

        url_path = reverse(url_name, args=[pk])
        if request:
            return request.build.absoulte_uri(url_path)
        if base_url:
            return f"{base_url.rstrip('/')}{url_path}"

    def generate_qr(self, request=None, base_url=None) -> None:
        student_data_url = self.get_student_data_url(
            pk=self.pk, request=request, base_url=base_url
        )
        qr_file = self.generate_qr_image(student_data_url)
        self.qr_code.save(
            f"student_qr_{self.pk}.{self.QR_IMAGE_FORMAT}", qr_file, save=False
        )
        self.save()

    def __str__(self) -> str:
        return self.fullname

    @property
    def academic_year(self) -> str:
        return_value = timezone.now().year

        return f"{return_value}"

    def clean(self):
        super().clean()
        if self.parent and self.parent.role != "parent":
            raise models.ValidationError(
                {"parent": "The assigned user must have the 'parent' role."}
            )
