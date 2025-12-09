from rest_framework.serializers import ModelSerializer
from .models import RMTRecord

class RMTRecordSerializer(ModelSerializer):
  class Meta:
    model = RMTRecord
    fields = '__all__'