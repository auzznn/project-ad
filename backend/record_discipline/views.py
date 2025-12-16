from django.shortcuts import render
from rest_framework import viewsets, status
from authentication.models import Student
from .models import DisciplineRecord, DisciplineType
from django.db.models import Sum, Case, When, F, IntegerField
from django.conf import settings
from .serializer import (
  DisciplineRecordSerializer,
  DisciplineTypeSerializer,
  DisciplineLeaderboardSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response

# Create your views here.
class DisciplineTypeView(viewsets.ModelViewSet):
  queryset = DisciplineType.objects.all()
  serializer_class = DisciplineTypeSerializer

class DisciplineRecordView(viewsets.ModelViewSet):
  queryset = DisciplineRecord.objects.all()
  serializer_class = DisciplineRecordSerializer

class DisciplineLeaderboardView(viewsets.ReadOnlyModelViewSet):  
  queryset = Student.objects.annotate(
    total_discipline_point=Sum(
      Case(
          # Only sum points for records within the academic year
          When(
              sahsiah__timestamp__range=(settings.ACADEMIC_YEAR_START, settings.ACADEMIC_YEAR_END),
              then=F('discipline__discipline_type__points')
          ),
          default=0,
          output_field=IntegerField()
      )
    )
  ).order_by('-total_discipline_point').select_related('user', 'class_room')

  serializer_class = DisciplineLeaderboardSerializer

  def create_ranking_student(self, queryset=None):
    if not queryset:
      queryset = self.get_queryset()
    
    ranked_data = []
    rank = 0
    last_points = None

    for i, student in enumerate(queryset):
      current_points = student.total_discipline_point or 0
      
      # Use 'dense' ranking: same points get the same rank
      if current_points != last_points:
        rank = i + 1
      last_points = current_points
      
      # Create a dictionary for the serializer to process
      ranked_data.append({
        'student_id': student.user.id,
        'student_name': student.user.fullname,
        'class_room': student.class_room.name,
        'discipline_point': current_points,
        'ranking': rank # ADD THE RANK HERE
      })
  
    serializer = self.get_serializer(ranked_data, many=True)
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