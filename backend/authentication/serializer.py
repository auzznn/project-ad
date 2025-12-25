from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.reverse import reverse
from django.conf import settings

from .models import MyUser, Student, MigrateStudent, Classroom
from .const import TOKEN_REFRESH_PATH_NAME


class MyTokenObtenPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def _get_refresh_url(cls) -> str:
        domain_name = settings.DOMAIN_NAME
        module_name = 'authentication'
        view_name = TOKEN_REFRESH_PATH_NAME
        reverse_lookup = f'{module_name}:{view_name}'
        relative_url = reverse(reverse_lookup)
        return f'{domain_name.rstrip("/")}{relative_url}'
    
    @classmethod
    def get_token(cls, user: MyUser):
        token = super().get_token(user)
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['role'] = user.role
        token['refresh_url'] = cls._get_refresh_url()
        return token


class MyUserRetrieveSerializer(ModelSerializer):
    class Meta:
        model = MyUser
        fields = ["id", "fullname"]


class MyUserCreateSerializer(ModelSerializer):
    class Meta:
        model = MyUser
        fields = ["username", "first_name", "last_name", "email", "password", "role"]
        extra_kwargs = {"password": {"write_only": True}}
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        
        instance.save()
        return instance


class StudentSerializer(ModelSerializer):
    name = serializers.CharField(source="fullname")
    section = serializers.CharField(source="class_room.class_section")
    grade = serializers.IntegerField(source="class_room.grade")

    class Meta:
        model = MigrateStudent
        fields = ["id", "name", "grade", "section", "academic_year", "rmt_elligible", "qr_code"]

    def create(self, validated_data):
        request = self.context.get('request')
        student = self.Meta.model(**validated_data)
        student.generate_qr(request=request)
        student.save()
        return student


class CreateStudentSerializer(ModelSerializer):
    class Meta:
        model = MigrateStudent
        fields = '__all__'

class ClassroomSerializer(ModelSerializer):
    class Meta:
        model = Classroom
        fields = '__all__'