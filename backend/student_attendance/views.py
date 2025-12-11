from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from django.utils import timezone

from authentication.models import Classroom
from .serializer import StudentAttendanceSerializer, RecordStudentAttendanceSerializer
from .models import StudentAttendance

# Create your views here.
class StudentAttendanceViewSet(viewsets.ReadOnlyModelViewSet):
  queryset = StudentAttendance.objects.all()
  serializer_class = StudentAttendanceSerializer

  def query_attendance_by_date(self, queryset=None, year: int=None, month: int=None, day: int=None):
    if queryset == None:
      queryset = self.get_queryset()
    return queryset.filter(date__year=year, date__month=month, date__day=day)
  
  def get_serializer_class(self):
    endpoint_action = ['record_student_attendance']
    if self.action in endpoint_action:
      return RecordStudentAttendanceSerializer 
    
    return super().get_serializer_class()
  
  @action(detail=False, methods=["get"])
  def daily(self, request: Request) -> Response:
    queryset = self.get_queryset()
    queryset = queryset.filter(date=timezone.now())
    
    serializer = self.serializer_class(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

  @action(detail=False, methods=['get'], url_path=r'daily/(?P<grade>[0-9]+)/(?P<section>[^/.]+)')
  def daily_by_class(self, request, grade: int=None, section: str=None):
    class_room_filter = Classroom.objects.filter(grade=grade, class_section=section)
    if len(class_room_filter) == 0:
      response = {
        "message": "Invalid class room name"
      }
      return Response(response, status=status.HTTP_400_BAD_REQUEST)
    
    class_room_instance = class_room_filter[0]
    queryset = self.get_queryset()
    queryset = queryset.filter(date=timezone.now())
    queryset = queryset.filter(student_id__class_room=class_room_instance)
    serializer = self.serializer_class(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
  
  @action(detail=False, methods=['get'], url_path=r'(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/(?P<day>[0-9]{2})')
  def attendance_by_date(self, request: Request, year: int=None, month: int=None, day: int=None) -> Response:
    queryset = self.query_attendance_by_date(queryset=None, year=year, month=month, day=day)
    serializer = self.serializer_class(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

  @action(detail=False, methods=['get'], url_path=r'(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/(?P<day>[0-9]{2})/(?P<grade>[0-9]+)/(?P<section>[^/.]+)')
  def class_attendance_by_date(self, request: Request, year: int=None, month: int = None, day: int = None, section: str = "", grade: int = None) -> Response:
    
    queryset = self.query_attendance_by_date(queryset=None, year=year, month=month, day=day)
    
    class_room_filter = Classroom.objects.filter(class_section=section, grade=grade)
    if len(class_room_filter) == 0:
      response = {
        "message": "Invalid class room name"
      }
      return Response(response, status=status.HTTP_400_BAD_REQUEST)
    class_room_instance = class_room_filter[0]
    
    queryset = queryset.filter(student_id__class_room=class_room_instance)
    serializer = self.serializer_class(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

  @action(detail=False, url_path="record", methods=['patch'])
  def record_student_attendance(self, request: Request) -> Response:
    serializer_class = self.get_serializer_class()
    serializer = serializer_class(data=request.data)
    serializer.is_valid(raise_exception=True)

    student_id = serializer.validated_data.get('student_id')
    updated_at = serializer.validated_data.get('updated_at')

    try:
      instance = StudentAttendance.objects.get(
        student_id=student_id, 
        date=timezone.now().date()
      )
    except StudentAttendance.DoesNotExist:
      response = {
        'message': f'unable to find record of student attendance with id {student_id}'
      }
      return Response(response, status=status.HTTP_400_BAD_REQUEST)
    
    updated_serializer = serializer_class(instance=instance, data={'updated_at': updated_at}, partial=True)
    updated_serializer.is_valid(raise_exception=True)
    updated_serializer.save()

    return_response = StudentAttendanceSerializer(instance=instance)
    return Response(return_response.data, status=status.HTTP_200_OK)