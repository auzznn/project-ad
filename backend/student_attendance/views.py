from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from django.utils import timezone
from django.conf import settings

from authentication.models import Classroom
from .serializer import StudentAttendanceSerializer, RecordStudentAttendanceSerializer, AddNoteSerializer
from .models import StudentAttendance
import pytz

# Create your views here.
class StudentAttendanceViewSet(viewsets.ReadOnlyModelViewSet):
  queryset = StudentAttendance.objects.all()
  serializer_class = StudentAttendanceSerializer

  def _get_current_date_aware(self) -> timezone.datetime:
    tz = pytz.timezone(settings.TIME_ZONE)
    return timezone.now().astimezone(tz).date()
  
  def _get_classroom_instance(self, grade: int, section: str) -> Classroom | None:
    try:
      return Classroom.objects.get(grade=grade, class_section=section)
    except Classroom.DoesNotExist:
      return None

  def _get_attendance_by_date(self, queryset=None, year: int=None, month: int=None, day: int=None):
    if queryset == None:
      queryset = self.get_queryset()
    return queryset.filter(date__year=year, date__month=month, date__day=day)
  
  def get_serializer_class(self):
    endpoint_action = ['record_student_attendance']
    if self.action in endpoint_action:
      return RecordStudentAttendanceSerializer
    if self.action == 'add_note':
      return AddNoteSerializer
    
    return super().get_serializer_class()
  
  @action(detail=False, methods=["get"])
  def daily(self, request: Request) -> Response:
    today = self._get_current_date_aware()
    
    queryset = self.get_queryset()
    queryset = queryset.filter(date=today)
    
    serializer = self.serializer_class(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

  @action(detail=False, methods=['get'], url_path=r'daily/(?P<grade>[0-9]+)/(?P<section>[^/.]+)')
  def daily_by_class(self, request, grade: int=None, section: str=None):
    today = self._get_current_date_aware()
    class_room_instance = self._get_classroom_instance(grade, section)
    
    if class_room_instance == None:
      response = {
        "message": "Invalid class room name"
      }
      return Response(response, status=status.HTTP_400_BAD_REQUEST)
    
    queryset = self.get_queryset()
    queryset = queryset.filter(date=today, student_id__class_room=class_room_instance)
    
    serializer = self.get_serializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
  
  @action(detail=False, methods=['get'], url_path=r'(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/(?P<day>[0-9]{2})')
  def attendance_by_date(self, request: Request, year: int=None, month: int=None, day: int=None) -> Response:
    queryset = self._get_attendance_by_date(queryset=None, year=year, month=month, day=day)
    serializer = self.get_serializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

  @action(detail=False, methods=['get'], url_path=r'(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/(?P<day>[0-9]{2})/(?P<grade>[0-9]+)/(?P<section>[^/.]+)')
  def class_attendance_by_date(self, request: Request, year: int=None, month: int = None, day: int = None, section: str = "", grade: int = None) -> Response:
    
    queryset = self._get_attendance_by_date(queryset=None, year=year, month=month, day=day)
    
    class_room_instance = self._get_classroom_instance(grade, section)
    if class_room_instance == None:
      response = {
        "message": "Invalid class room name"
      }
      return Response(response, status=status.HTTP_400_BAD_REQUEST)
    
    queryset = queryset.filter(student_id__class_room=class_room_instance)
    serializer = self.get_serializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

  @action(detail=False, url_path="record", methods=['patch'])
  def record_student_attendance(self, request: Request) -> Response:
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    student_id = serializer.validated_data.get('student_id')
    timestamp = serializer.validated_data.get('timestamp')
    today = self._get_current_date_aware()

    try:
      instance = StudentAttendance.objects.get(
        student_id=student_id, 
        date=today
      )
    except StudentAttendance.DoesNotExist:
      response = {
        'message': f'unable to find record of student attendance with id {student_id}'
      }
      return Response(response, status=status.HTTP_400_BAD_REQUEST)
    
    updated_serializer = self.get_serializer(instance=instance, data={'timestamp': timestamp}, partial=True)
    updated_serializer.is_valid(raise_exception=True)
    updated_serializer.save()

    return_response = StudentAttendanceSerializer(instance=instance)
    return Response(return_response.data, status=status.HTTP_200_OK)

  @action(detail=True, url_path='note', methods=['patch'])
  def add_note(self, request: Request, pk: int) -> Response:
    """
    API endpoint to add/update the note for a specific StudentAttendance record.
    """
    try:
      instance = self.get_object()
    except Exception:
      return Response(
        {"detail": "Not found."},
        status=status.HTTP_404_NOT_FOUND
      )
    
    serializer_class = self.get_serializer_class()
    
    serializer = serializer_class(instance=instance, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()   

    output_serializer = StudentAttendanceSerializer(instance=instance)
    return Response(output_serializer.data, status=status.HTTP_200_OK)