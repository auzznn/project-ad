from django.shortcuts import render
from django.utils import timezone
from django.http.request import HttpRequest
from django.db.models.manager import BaseManager
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from authentication.models import Classroom
from .serializer import StudentAttendanceSerializer
from .models import StudentAttendance

# Create your views here.
class StudentAttendanceViewSet(viewsets.ModelViewSet):
  queryset = StudentAttendance.objects.all()
  serializer_class = StudentAttendanceSerializer
  
  @action(detail=False, methods=["get"])
  def daily(self, request: HttpRequest) -> Response:
    queryset = self.get_queryset()
    queryset = queryset.filter(created_at__date=timezone.now())
    
    serializer = self.serializer_class(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

  @action(detail=False, methods=['get'], url_path='daily/(?P<class_room>[^/.]+)')
  def daily_by_class(self, request, class_room=None):
    class_room_instance = Classroom.objects.get(name=class_room)
    if class_room_instance == None:
      response = {
        "message": "Invalid class room name"
      }
      return Response(response, status=status.HTTP_400_BAD_REQUEST)
    
    queryset = self.get_queryset()
    queryset = queryset.filter(created_at__date=timezone.now())
    queryset = queryset.filter(student_id__class_room=class_room_instance)
    serializer = self.serializer_class(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)