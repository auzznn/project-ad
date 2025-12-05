from rest_framework import serializers
from .models import SahsiahType

class SahsiahTypeSerializer(serializers.ModelSerializer):

  class Meta:
    model = SahsiahType
    fields = '__all__'