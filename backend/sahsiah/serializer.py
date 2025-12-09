from rest_framework import serializers
from .models import SahsiahType, SahsiahRecord
from django.utils import timezone
from authentication.models import Student

class SahsiahTypeSerializer(serializers.ModelSerializer):

  class Meta:
    model = SahsiahType
    fields = '__all__'

class SahsiahRecordSerializer(serializers.ModelSerializer):

  class Meta:
    model = SahsiahRecord
    fields = '__all__'

class SahsiahLeaderboardSerializer(serializers.ModelSerializer):
  student_id = serializers.IntegerField(source='user.id')
  student_name = serializers.CharField(source='user.fullname')
  sahsiah_point = serializers.SerializerMethodField()
  class_room = serializers.CharField(source='class_room.name')

  class Meta:
    model = Student
    fields = ['student_id', 'student_name', 'sahsiah_point', 'class_room']
  
  def get_sahsiah_point(self, obj: Student) -> int:
    ACADEMIC_YEAR_START = timezone.now().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    ACADEMIC_YEAR_END = timezone.now().replace(month=11, day=30, hour=0, minute=0, second=0, microsecond=0)
    
    sahsiah_point_list = obj.sahsiah.filter(timestamp__range=(ACADEMIC_YEAR_START, ACADEMIC_YEAR_END)).values('sahsiah_type__points')

    total_sahsiah_point = 0
    for sahsiah_point in sahsiah_point_list:
      total_sahsiah_point += sahsiah_point['sahsiah_type__points']

    return total_sahsiah_point