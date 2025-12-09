from rest_framework.serializers import ModelSerializer, ValidationError
from django.utils import timezone

from authentication.serializer import StudentSerializer
from .models import StudentAttendance

class StudentAttendanceSerializer(ModelSerializer):
  student = StudentSerializer(source='student_id', many=False)

  class Meta:
    model = StudentAttendance
    fields = ['student', 'status', 'created_at', 'updated_at']

class RecordStudentAttendanceSerializer(ModelSerializer):

  class Meta:
    model = StudentAttendance
    fields = ['student_id', 'updated_at']
  
  def update(self, instance: StudentAttendance, validated_data):
    new_time = validated_data.get('updated_at', instance.updated_at)

    if instance.created_at.replace(microsecond=0) != instance.updated_at.replace(microsecond=0):
      raise ValidationError(f'student attendance for {instance.student_id.user.fullname} has already been created')
    
    instance.updated_at = new_time
    instance.save()

    return instance