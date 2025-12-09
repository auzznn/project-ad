from rest_framework import viewsets
from .models import SahsiahType, SahsiahRecord
from .serializer import SahsiahTypeSerializer, SahsiahRecordSerializer

# Create your views here.
class SahsiahTypeView(viewsets.ModelViewSet):
  queryset = SahsiahType.objects.all()
  serializer_class = SahsiahTypeSerializer

class SahsiahRecordView(viewsets.ModelViewSet):
  queryset = SahsiahRecord.objects.all()
  serializer_class = SahsiahRecordSerializer