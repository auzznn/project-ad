from rest_framework.serializers import ModelSerializer

from authentication.serializer import StudentSerializer
from .models import StudentAttendance

class StudentAttendanceSerializer(ModelSerializer):
  student = StudentSerializer(source="student_id", many=False)

  class Meta:
    model = StudentAttendance
    fields = ["student", "status", "created_at", "updated_at"]