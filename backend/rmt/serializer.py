from rest_framework.serializers import (
    ModelSerializer,
    IntegerField,
    ValidationError
)
from django.utils import timezone
from authentication.serializer import StudentSerializer
from base.utils import set_timezone
from .models import RMTRecord

class RMTRecordSerializer(ModelSerializer):
  student = StudentSerializer(source='migrate_student_id')
  
  class Meta:
    model = RMTRecord
    fields = ['student', 'date', 'timestamp']

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

    def _get_instance(self, migrate_student_id: int) -> Meta.model:
        if self.rmt_record_instance:
            return self.rmt_record_instance

        today = set_timezone(timezone.now()).date()
        self.rmt_record_instance = self.Meta.model.objects.get(
            migrate_student_id=migrate_student_id, date=today
        )
        return self.rmt_record_instance

    def validate_student_id(self, student_id: int):
        try:
            self._get_instance(migrate_student_id=student_id)
        except self.Meta.model.DoesNotExist:
            raise ValidationError(
                f"unable to find record of rmt with id {student_id} or the student is not elligible"
            )

        return student_id

    def validate(self, data):
        student_id = data.get("student_id")
        self.instance = self._get_instance(migrate_student_id=student_id)
        assert self.instance.migrate_student_id.rmt_elligible
        
        # Check if already clocked in (Logic moved from update)
        no_changes = RMTRecord.default_datetime()
        if set_timezone(self.instance.timestamp) != no_changes:
            raise ValidationError(
                f"RMT Record for {self.instance.migrate_student_id.fullname} has already been recorded"
            )
        return data