from rest_framework import serializers
from .models import DisciplineType, DisciplineRecord

class DisciplineTypeSerializer(serializers.ModelSerializer):

  class Meta:
    model = DisciplineType
    fields = '__all__'

class DisciplineRecordSerializer(serializers.ModelSerializer):

  class Meta:
    model = DisciplineRecord
    fields = '__all__'

class DisciplineLeaderboardSerializer(serializers.Serializer): 
  student_id = serializers.IntegerField()
  student_name = serializers.CharField()
  discipline_point = serializers.IntegerField()
  class_room = serializers.CharField()
  ranking = serializers.IntegerField() 