from rest_framework import viewsets
from .models import SahsiahType
from .serializer import SahsiahTypeSerializer

# Create your views here.
class SahsiahTypeView(viewsets.ModelViewSet):
  queryset = SahsiahType.objects.all()
  serializer_class = SahsiahTypeSerializer