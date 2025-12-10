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

  def list(self, request, *args, **kwargs):
    queryset = self.get_queryset()
    non_student_user = queryset.filter(~Q(role='student'))
    student_id = queryset.filter(role='student').values_list('id')
    students = Student.objects.filter(user__in=student_id)

    non_student_user_serializer = MyUserRetrieveSerializer(instance=non_student_user, many=True)
    student_user_serializer = StudentSerializer(instance=students, many=True)
    merged_data = non_student_user_serializer.data + student_user_serializer.data

    return Response(merged_data, status=status.HTTP_200_OK)
  
  def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()

    serializer_class = self.get_serializer_class()
    serializer = serializer_class(instance=instance)

    if instance.role == "student":
      serializer = StudentSerializer(instance=instance.student)
    
    return Response(serializer.data, status=status.HTTP_200_OK)