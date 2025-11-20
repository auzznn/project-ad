from django.shortcuts import render
from django.utils import timezone
from django.http.request import HttpRequest
from django.db.models.manager import BaseManager
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .serializer import StudentAttendanceSerializer
from .models import StudentAttendance

# Create your views here.
class StudentAttendanceViewSet(viewsets.ModelViewSet):
  queryset = StudentAttendance.objects.all()
  serializer_class = StudentAttendanceSerializer

  @action(detail=False, methods=["get"])
  def daily(self, request: HttpRequest):
    queryset = self.get_queryset()
    queryset = queryset.filter(created_at__date=timezone.now())
    
    serializer = self.serializer_class(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)