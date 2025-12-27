from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status

from .models import RMTRecord
from .serializer import RMTRecordSerializer, RecordRMTRecordSerializer
from base.pagination import StandardResultsSetPagination

# Create your views here.
class RMTView(ModelViewSet):
  queryset = RMTRecord.objects.all().order_by("-date")
  serializer_class = RMTRecordSerializer
  pagination_class = StandardResultsSetPagination
  
  def get_serializer_class(self):
      if self.action == 'record':
          return RecordRMTRecordSerializer
      return super().get_serializer_class()
  
  @action(detail=False, methods=['patch'])
  def record(self, request: Request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    instance = serializer.save()
    return_response = RecordRMTRecordSerializer(instance)
    return Response(return_response.data, status=status.HTTP_200_OK)