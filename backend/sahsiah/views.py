from rest_framework import viewsets

from authentication.models import Student
from .models import SahsiahType, SahsiahRecord
from .serializer import SahsiahTypeSerializer, SahsiahRecordSerializer, SahsiahLeaderboardSerializer

# Create your views here.
class SahsiahTypeView(viewsets.ModelViewSet):
  queryset = SahsiahType.objects.all()
  serializer_class = SahsiahTypeSerializer

class SahsiahRecordView(viewsets.ModelViewSet):
  queryset = SahsiahRecord.objects.all()
  serializer_class = SahsiahRecordSerializer

class SahsiahLeaderboardView(viewsets.ReadOnlyModelViewSet):
  serializer_class = SahsiahLeaderboardSerializer
  queryset = Student.objects.all()