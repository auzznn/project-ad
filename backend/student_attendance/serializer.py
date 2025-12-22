from rest_framework.serializers import ModelSerializer, ValidationError, IntegerField
from django.utils import timezone
from django.conf import settings

from authentication.serializer import StudentSerializer
from authentication.models import Student
from .models import StudentAttendance
from base.utils import set_timezone
from sahsiah.models import SahsiahType, SahsiahRecord
import pytz


class StudentAttendanceSerializer(ModelSerializer):
    student = StudentSerializer(source="migrate_student_id", many=False)

    class Meta:
        model = StudentAttendance
        fields = ["id", "student", "status", "date", "timestamp", "note"]


class RecordStudentAttendanceSerializer(ModelSerializer):
    student_id = IntegerField(write_only=True)
    
    class Meta:
        model = StudentAttendance
        fields = ["student_id", "timestamp"]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attendance_instance = None

    def create_punctuality_sahsiah(
        self, student: Student, timestamp: timezone.datetime
    ):
        try:
            punctuality_sahsiah = SahsiahType.objects.get(name="Punctuality")
        except SahsiahType.DoesNotExist:
            raise ValidationError(f"unable to find sahsiah punctuality")

        SahsiahRecord.objects.create(
            migrate_student_id=student,
            sahsiah_type=punctuality_sahsiah,
            timestamp=timestamp,
        )

    def update(self, instance: StudentAttendance, validated_data):
        instance.timestamp = validated_data.get("timestamp", instance.timestamp)
        instance.save()

        if instance.status == StudentAttendance.ON_TIME_CODE:
            self.create_punctuality_sahsiah(
                student=instance.migrate_student_id, timestamp=instance.timestamp
            )

        return instance

    def _get_instance(self, migrate_student_id: int) -> Meta.model:
        if self.attendance_instance:
            return self.attendance_instance
        
        today = set_timezone(timezone.now()).date()
        print(f"today: {today}")
        self.attendance_instance = self.Meta.model.objects.get(
            migrate_student_id=migrate_student_id, date=today
        )
        return self.attendance_instance

    def validate_student_id(self, student_id: int):
        try:
            self._get_instance(migrate_student_id=student_id)
        except self.Meta.model.DoesNotExist:
            raise ValidationError(
                f"unable to find record of student attendance with id {student_id}"
            )

        return student_id

    def validate(self, data):
        student_id = data.get("student_id")
        self.instance = self._get_instance(migrate_student_id=student_id)

        # Check if already clocked in (Logic moved from update)
        absent_time = StudentAttendance.default_datetime()
        if set_timezone(self.instance.timestamp) != absent_time:
            raise ValidationError(
                f"student attendance for {self.instance.migrate_student_id.fullname} has already been recorded"
            )

        return data


class AddNoteSerializer(ModelSerializer):
    class Meta:
        model = StudentAttendance
        fields = ["note"]

    def update(self, instance: StudentAttendance, validated_data):
        new_note = validated_data.get("note")
        print(new_note)
        if new_note is None:
            raise ValidationError(f"note can not be empty")

        instance.note = new_note
        instance.save(update_fields=["note"])

        return instance
