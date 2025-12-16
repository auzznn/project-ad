from django.db.models import Q

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated 
from rest_framework_simplejwt.views import (
  TokenObtainPairView,
  TokenRefreshView
)
from rest_framework.viewsets import ModelViewSet

from .models import MyUser, Student
from .serializer import (
  MyTokenObtenPairSerializer,
  MyUserCreateSerializer,
  MyUserRetrieveSerializer,
  StudentSerializer
)

# Create your views here.
class TokenView(TokenObtainPairView):
  serializer_class = MyTokenObtenPairSerializer 

class MyUserView(ModelViewSet):
  queryset = MyUser.objects.all()
  permission_classes = [IsAuthenticated]

  def get_serializer_class(self):
    return MyUserCreateSerializer if self.action == 'create' else MyUserRetrieveSerializer

  def get_queryset(self):
    if self.action in ['list', 'retrieve']:
      return self.queryset.select_related('student')
    return super().get_queryset()

  def list(self, request, *args, **kwargs):
    non_student_user = self.get_queryset().filter(~Q(role='student'))
    students = Student.objects.all().select_related('user')

    non_student_user_serializer = MyUserRetrieveSerializer(instance=non_student_user, many=True)
    student_user_serializer = StudentSerializer(instance=students, many=True)
    merged_data = non_student_user_serializer.data + student_user_serializer.data

    return Response(merged_data, status=status.HTTP_200_OK)
  
  def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer_class = self.get_serializer_class()

    if instance.role == "student":
      serializer = StudentSerializer(instance=instance.student)
    else:
      serializer = serializer_class(instance=instance)
    
    return Response(serializer.data, status=status.HTTP_200_OK)