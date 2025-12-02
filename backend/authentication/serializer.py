from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.reverse import reverse
from django.contrib.sites.models import Site

from .models import MyUser, Student, Classroom
from .const import TOKEN_REFRESH_PATH_NAME

class MyTokenObtenPairSerializer(TokenObtainPairSerializer):
  
  @classmethod
  def get_token(cls, user: MyUser) -> dict[str, any]:
    domain = Site.objects.get_current().domain
    token = super().get_token(user)
    
    token['first_name'] = user.first_name
    token['last_name'] = user.last_name
    token['role'] = user.role
    token['url'] = {
      'refresh': f'https://{domain}{reverse(TOKEN_REFRESH_PATH_NAME)}'
    }
    return token

class MyUserRetrieveSerializer(ModelSerializer):
  class Meta:
    model = MyUser
    fields = ['id', 'fullname']

class MyUserCreateSerializer(ModelSerializer):
  class Meta:
    model = MyUser
    fields = ['username', 'first_name', 'last_name', 'email', 'password', 'role']
    extra_kwargs = {
      'password': {'write_only': True}
    }
  
  def create(self, validated_data: dict[str, any]) -> MyUser:
    instance = MyUser.objects.create(**validated_data)
    if instance.role == 'student':
      student_instance_data = {
        'user': instance,
      }
      student_instance = Student.objects.create(**student_instance_data)
      student_instance.save()
    return instance

class StudentSerializer(ModelSerializer):
  fullname = serializers.CharField(source="user.fullname")
  student_id = serializers.IntegerField(source="user.id")
  class_room = serializers.CharField(source="class_room.name")
  
  class Meta:
    model = Student
    fields =  ["student_id", "fullname", "class_room"]