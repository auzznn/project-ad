import string
import random
from io import BytesIO

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.files import File
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils import timezone
from rest_framework.reverse import reverse
import qrcode as qr

from base.const import STUDENT_BASENAME_PATH
from base.models import GeneralQuerySet

class MigrateStudentQuerySet(GeneralQuerySet):
    pass

class MyUser(AbstractUser):
    """
    Custom user model for the system.
    Extends AbstractUser to include role-based access control (Admin, Teacher, Parent).
    """
    ROLE_CHOICE = [
        ("admin", "admin"),
        ("teacher", "teacher"),
        ("parent", "parent"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICE, default="parent")

    @property
    def fullname(self) -> str:
        """Returns the user's combined first and last name."""
        return f"{self.first_name} {self.last_name}"


class Classroom(models.Model):
    """
    Represents a school classroom defined by a grade level and a unique section.
    """

    def default_section() -> str:
        """Generates a random 15-character string to serve as a default section name."""
        LENGTH = 15
        characters = string.ascii_letters
        return "".join(random.choice(characters) for i in range(LENGTH))

    grade = models.IntegerField(
        default=1,
        validators=[
            MinValueValidator(1, "class grade can't be below 1"),
            MaxValueValidator(6, "class grade can't be above 6"),
        ],
        help_text="Primary school grade level (1-6)."
    )
    class_section = models.CharField(
        max_length=50, default=default_section,
        help_text="The section identifier (e.g., 'A', 'Bestari', or a random string)."
    )

    supervisor = models.CharField(blank=True, null=True, max_length=50)

    def __str__(self) -> str:
        return f"{self.grade}{self.class_section}"

    @property
    def name(self) -> str:
        """Alias for the string representation of the classroom."""
        return self.__str__()


class MigrateStudent(models.Model):
    """
    The primary model for student data. 
    Handles relationships to parents and classrooms, and manages unique QR identity codes.
    """
    QR_IMAGE_FORMAT = "jpeg"

    class_room = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="migrate_student",
    )
    qr_code = models.ImageField(upload_to="qrcodes/", blank=True, null=True)
    rmt_elligible = models.BooleanField(default=False, null=True)
    date_of_birth = models.DateTimeField(default=timezone.now)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    parent = models.ForeignKey(
        MyUser,
        on_delete=models.CASCADE,
        related_name="children",
        blank=True,
        null=True,
        limit_choices_to={"role": "parent"},
        help_text="Link to a MyUser instance with the 'parent' role."
    )
    
    objects = MigrateStudentQuerySet.as_manager()

    @property
    def fullname(self) -> str:
        """Returns the student's combined first and last name."""
        return f"{self.first_name} {self.last_name}"

    @classmethod
    def generate_qr_image(cls, url_link: str) -> File:
        """
        Takes a URL string and generates a JPEG image file containing a QR code.
        Returns a Django File object ready to be saved to an ImageField.
        """
        qr_image = qr.make(url_link)
        buffer = BytesIO()
        qr_image.save(buffer, format=cls.QR_IMAGE_FORMAT)
        buffer.seek(0)
        return File(buffer, name=f"qr.{cls.QR_IMAGE_FORMAT}")

    @staticmethod
    def get_student_data_url(pk, request=None, base_url=None) -> str:
        """
        Constructs the absolute URL for the student's detail API endpoint.
        Used as the payload for the student's QR code.
        """
        module_name = "authentication"
        base_name = STUDENT_BASENAME_PATH
        action_name = "detail"

        url_name = f"{module_name}:{base_name}-{action_name}"
        url_path = reverse(url_name, args=[pk])
        
        if request:
            return request.build_absolute_uri(url_path)
        if base_url:
            return f"{base_url.rstrip('/')}{url_path}"
        return url_path

    def generate_qr(self, request=None, base_url=None) -> None:
        """
        Orchestrates the creation of a QR code based on the student's ID.
        Saves the resulting image to the qr_code field.
        """
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
        """Returns the current calendar year as the academic year string."""
        return str(timezone.now().year)

    def clean(self):
        """
        Performs custom validation to ensure that any assigned parent 
        possesses the correct user role.
        """
        super().clean()
        if self.parent and self.parent.role != "parent":
            raise models.ValidationError(
                {"parent": "The assigned user must have the 'parent' role."}
            )