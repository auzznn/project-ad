from rest_framework.serializers import ModelSerializer, ValidationError
from django.utils import timezone

from authentication.serializer import StudentSerializer
from authentication.models import Student
from .models import StudentAttendance
from sahsiah.models import SahsiahType, SahsiahRecord

class StudentAttendanceSerializer(ModelSerializer):
  student = StudentSerializer(source='student_id', many=False)

  class Meta:
    model = StudentAttendance
    fields = ['id', 'student', 'status', 'date', 'timestamp']

class RecordStudentAttendanceSerializer(ModelSerializer):

  class Meta:
    model = StudentAttendance
    fields = ['student_id', 'timestamp']

  def create_punctuality_sahsiah(self, student: Student, timestamp: timezone.datetime):
    try:
      punctuality_sahsiah = SahsiahType.objects.get(name='Punctuality')
    except SahsiahType.DoesNotExist:
      raise ValidationError(f'unable to find sahsiah punctuality')
    
    SahsiahRecord.objects.create(student_id=student, sahsiah_type=punctuality_sahsiah, timestamp=timestamp)
  
  def update(self, instance: StudentAttendance, validated_data):
    new_timestamp = validated_data.get('timestamp', self.instance)

    if instance.timestamp != StudentAttendance.default_datetime():
      raise ValidationError(f'student attendance for {instance.student_id.user.fullname} has already been created')
    
    instance.timestamp = new_timestamp
    instance.save()

    if instance.status == StudentAttendance.ON_TIME_CODE:
      self.create_punctuality_sahsiah(student=instance.student_id, timestamp=instance.timestamp)

    return instance