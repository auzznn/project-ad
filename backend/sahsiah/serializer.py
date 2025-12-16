from rest_framework import serializers
from .models import SahsiahType, SahsiahRecord

class SahsiahTypeSerializer(serializers.ModelSerializer):

  class Meta:
    model = SahsiahType
    fields = '__all__'

class SahsiahRecordSerializer(serializers.ModelSerializer):

  class Meta:
    model = SahsiahRecord
    fields = '__all__'

class SahsiahLeaderboardSerializer(serializers.Serializer): 
  student_id = serializers.IntegerField()
  student_name = serializers.CharField()
  sahsiah_point = serializers.IntegerField()
  class_room = serializers.CharField()
  ranking = serializers.IntegerField() 