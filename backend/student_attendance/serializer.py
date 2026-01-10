from rest_framework.serializers import (
    ModelSerializer,
    ValidationError,
    IntegerField,
    Serializer,
    CharField,
    SerializerMethodField,
)
from django.utils import timezone

from authentication.serializer import StudentSerializer
from authentication.models import MigrateStudent
from .models import StudentAttendance
from .utils import (
    ATTENDANCE_RATE_STATUS_EXCELLENT,
    ATTENDANCE_RATE_STATUS_GOOD,
    ATTENDANCE_RATE_STATUS_AVERAGE,
    ATTENDANCE_RATE_STATUS_POOR,
)
from base.utils import set_timezone

from sahsiah.const import PUNCTUALITY_NAME
from sahsiah.models import SahsiahType, SahsiahRecord

from record_discipline.models import DisciplineRecord, DisciplineType
from record_discipline.const import LATE_NAME

from . import const


class StudentAttendanceSerializer(ModelSerializer):
    student = StudentSerializer(source="student_id", many=False)
    status = SerializerMethodField()

    class Meta:
        model = StudentAttendance
        fields = ["id", "student", "date", "status", "timestamp", "note"]

    def get_status(self, instance: Meta.model) -> str:
        return const.ATTENDANCE_STATUS_LOOKUP.get(instance.status)


class RecordStudentAttendanceSerializer(ModelSerializer):
    student_id = IntegerField(write_only=True)

    class Meta:
        model = StudentAttendance
        fields = ["student_id", "timestamp"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attendance_instance = None

    def create_punctuality_sahsiah(
        self, student: MigrateStudent, timestamp: timezone.datetime
    ):
        try:
            punctuality_sahsiah = SahsiahType.objects.get(name=PUNCTUALITY_NAME)
        except SahsiahType.DoesNotExist:
            raise ValidationError(f"unable to find sahsiah punctuality")

        SahsiahRecord.objects.create(
            student_id=student,
            sahsiah_type=punctuality_sahsiah,
            timestamp=timestamp,
        )

    def create_late_discipline(self, student: MigrateStudent, timestamp: timezone.datetime):
        try:
            late_discipline_type = DisciplineType.objects.get(name=LATE_NAME)
        except DisciplineType.DoesNotExist:
            raise ValidationError(f"unable to find record discipline {LATE_NAME}")

        DisciplineRecord.objects.create(
            student_id=student,
            discipline_type=late_discipline_type,
            timestamp=timestamp,
        )

    def update(self, instance: StudentAttendance, validated_data):
        instance.timestamp = validated_data.get("timestamp", instance.timestamp)
        instance.save()

        if instance.status == const.ON_TIME_STATUS_KEY:
            self.create_punctuality_sahsiah(
                student=instance.student_id, timestamp=instance.timestamp
            )
        elif instance.status == const.LATE_STATUS_KEY:
            self.create_late_discipline(
                student=instance.student_id, timestamp=instance.timestamp
            )

        return instance

    def _get_instance(self, student_id: int) -> Meta.model:
        if self.attendance_instance:
            return self.attendance_instance

        today = set_timezone(timezone.now()).date()
        print(f"today: {today}")
        self.attendance_instance = self.Meta.model.objects.get(
            student_id=student_id, date=today
        )
        return self.attendance_instance

    def validate_student_id(self, student_id: int):
        try:
            self._get_instance(student_id=student_id)
        except self.Meta.model.DoesNotExist:
            raise ValidationError(
                f"unable to find record of student attendance with id {student_id}"
            )

        return student_id

    def validate(self, data):
        student_id = data.get("student_id")
        self.instance = self._get_instance(student_id=student_id)

        # Check if already clocked in (Logic moved from update)
        absent_time = StudentAttendance.default_datetime()
        if set_timezone(self.instance.timestamp) != absent_time:
            raise ValidationError(
                f"student attendance for {self.instance.student_id.fullname} has already been recorded"
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


class AttendanceStudentRecordStatsSerializer(Serializer):
    student_id = IntegerField(source="id")
    name = CharField(source="fullname")
    grade = IntegerField(source="class_room.grade")
    class_name = CharField(source="class_room.class_section")
    present = IntegerField()
    absent = IntegerField()
    late = IntegerField()
    attendance_rate = SerializerMethodField()
    status = SerializerMethodField()

    def get_attendance_rate(self, obj):
        total = obj.present + obj.absent + obj.late
        if total == 0:
            return 0.0
        return obj.present / total

    def get_status(self, obj):
        rate = self.get_attendance_rate(obj)
        if rate >= 0.95:
            return ATTENDANCE_RATE_STATUS_EXCELLENT
        elif rate >= 0.85:
            return ATTENDANCE_RATE_STATUS_GOOD
        elif rate >= 0.75:
            return ATTENDANCE_RATE_STATUS_AVERAGE
        else:
            return ATTENDANCE_RATE_STATUS_POOR
