from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .models import RMTRecord
from .serializer import RMTRecordSerializer

# Create your views here.
class RMTView(ModelViewSet):
  queryset = RMTRecord.objects.all()
  serializer_class = RMTRecordSerializer