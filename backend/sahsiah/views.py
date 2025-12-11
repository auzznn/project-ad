from rest_framework import viewsets
from rest_framework.response import Response
from django.db.models import F, When, Case, Sum, IntegerField
from django.utils import timezone

from rest_framework import status
from authentication.models import Student
from .models import SahsiahType, SahsiahRecord
from .serializer import (
  SahsiahTypeSerializer, 
  SahsiahRecordSerializer, 
  SahsiahLeaderboardSerializer,
)
from rest_framework.decorators import action

# Create your views here.
class SahsiahTypeView(viewsets.ModelViewSet):
  queryset = SahsiahType.objects.all()
  serializer_class = SahsiahTypeSerializer

class SahsiahRecordView(viewsets.ModelViewSet):
  queryset = SahsiahRecord.objects.all()
  serializer_class = SahsiahRecordSerializer

class SahsiahLeaderboardView(viewsets.ReadOnlyModelViewSet):
  ACADEMIC_YEAR_START = timezone.now().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
  ACADEMIC_YEAR_END = timezone.now().replace(month=12, day=30, hour=0, minute=0, second=0, microsecond=0)
  
  queryset = Student.objects.annotate(
    total_sahsiah_point=Sum(
      Case(
          # Only sum points for records within the academic year
          When(
              sahsiah__timestamp__range=(ACADEMIC_YEAR_START, ACADEMIC_YEAR_END),
              then=F('sahsiah__sahsiah_type__points')
          ),
          default=0,
          output_field=IntegerField()
      )
    )
  ).order_by('-total_sahsiah_point').select_related('user', 'class_room')

  def create_ranking_student(self, queryset=None):
    if not queryset:
      queryset = self.get_queryset()
    
    ranked_data = []
    rank = 0
    last_points = None

    for i, student in enumerate(queryset):
      current_points = student.total_sahsiah_point or 0
      
      # Use 'dense' ranking: same points get the same rank
      if current_points != last_points:
        rank = i + 1
      last_points = current_points
      
      # Create a dictionary for the serializer to process
      ranked_data.append({
        'student_id': student.user.id,
        'student_name': student.user.fullname,
        'class_room': student.class_room.name,
        'sahsiah_point': current_points,
        'ranking': rank # ADD THE RANK HERE
      })
  
    serializer = SahsiahLeaderboardSerializer(ranked_data, many=True)
    return serializer
    

  def list(self, request, *args, **kwargs):
    queryset = self.get_queryset()
    serializer = self.create_ranking_student(queryset=queryset)
    return Response(serializer.data, status=status.HTTP_200_OK)

  @action(detail=False, url_path=r"(?P<grade>[0-9]+)/(?P<section>[^/.]+)")
  def group_by_class(self, request, grade: int, section: str, *args, **kwargs):
    queryset = self.get_queryset().filter(class_room__grade=grade, class_room__class_section__exact=section)
    serializer = self.create_ranking_student(queryset=queryset)
    return Response(serializer.data, status=status.HTTP_200_OK)
  
  @action(detail=False, url_path=r"(?P<grade>[0-9]+)")
  def group_by_grade(self, request, grade: int, *args, **kwargs):
    queryset = self.get_queryset().filter(class_room__grade=grade)
    serializer = self.create_ranking_student(queryset=queryset)
    return Response(serializer.data, status=status.HTTP_200_OK)