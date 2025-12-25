from rest_framework.serializers import ModelSerializer
from authentication.serializer import StudentSerializer
from .models import RMTRecord

class RMTRecordSerializer(ModelSerializer):
  student = StudentSerializer(source='migrate_student_id')
  
  class Meta:
    model = RMTRecord
    fields = ['student', 'date', 'timestamp']
