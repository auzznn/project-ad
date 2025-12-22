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