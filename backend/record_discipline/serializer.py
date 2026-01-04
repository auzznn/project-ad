from rest_framework import serializers
from .models import DisciplineType, DisciplineRecord


class DisciplineTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = DisciplineType
        fields = "__all__"
    
    def validate_points(self, value):
        return -abs(value) if value > 0 else value


class DisciplineRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = DisciplineRecord
        fields = "__all__"
