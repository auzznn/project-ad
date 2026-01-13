from rest_framework.serializers import (
    ModelSerializer,
    IntegerField,
    ValidationError,
    Serializer,
    FloatField,
    BooleanField,
    SerializerMethodField,
    DateField
)
from django.utils import timezone
from authentication.serializer import StudentSerializer
from base.utils import set_timezone
from .models import RMTRecord

class RMTRecordSerializer(ModelSerializer):
  student = StudentSerializer(source='student_id')
  
  class Meta:
    model = RMTRecord
    fields = ['student', 'date', 'timestamp', 'is_present']

class RecordRMTRecordSerializer(ModelSerializer):
    student_id = IntegerField(write_only=True)

    class Meta:
        model = RMTRecord
        fields = ["student_id", "timestamp"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.rmt_record_instance = None

    def update(self, instance: RMTRecord, validated_data):
        instance.timestamp = validated_data.get("timestamp", instance.timestamp)
        instance.save()

        return instance

    def _get_instance(self, student_id: int) -> Meta.model:
        if self.rmt_record_instance:
            return self.rmt_record_instance

        today = set_timezone(timezone.now()).date()
        self.rmt_record_instance = self.Meta.model.objects.get(
            student_id=student_id, date=today
        )
        return self.rmt_record_instance

    def validate_student_id(self, student_id: int):
        try:
            self._get_instance(student_id=student_id)
        except self.Meta.model.DoesNotExist:
            raise ValidationError(
                f"unable to find record of rmt with id {student_id} or the student is not elligible"
            )

        return student_id

    def validate(self, data):
        student_id = data.get("student_id")
        self.instance = self._get_instance(student_id=student_id)
        assert self.instance.student_id.rmt_elligible
        
        # Check if already clocked in (Logic moved from update)
        no_changes = RMTRecord.default_datetime()
        if set_timezone(self.instance.timestamp) != no_changes:
            raise ValidationError(
                f"RMT Record for {self.instance.student_id.fullname} has already been recorded"
            )
        return data

class StudentRMTAnalyticsSerializer(Serializer):
    student_id = IntegerField()
    fullname = SerializerMethodField()
    average_rmt_percentage = FloatField()
    today_is_present = BooleanField()
    latest_present = DateField()
    class_room = SerializerMethodField()
    
    def get_fullname(self, obj):
        first_name_field = "student_id__first_name"
        last_name_field = "student_id__last_name"
        
        return f"{obj[first_name_field]} {obj[last_name_field]}"
    
    def get_class_room(self, obj):
        class_section_field = 'student_id__class_room__class_section'
        class_grade_field = 'student_id__class_room__grade'
        
        return f"{obj[class_grade_field]}{obj[class_section_field]}"