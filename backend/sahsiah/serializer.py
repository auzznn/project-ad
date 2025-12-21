from rest_framework import serializers
from .models import SahsiahType, SahsiahRecord


class SahsiahTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = SahsiahType
        fields = "__all__"


class SahsiahRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = SahsiahRecord
        fields = "__all__"
