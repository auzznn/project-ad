from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.reverse import reverse
from django.contrib.sites.models import Site

from .models import MyUser, Student, MigrateStudent, Classroom
from .const import TOKEN_REFRESH_PATH_NAME


class MyTokenObtenPairSerializer(TokenObtainPairSerializer):
    
    def _get_refresh_url(self) -> str:
        request = self.context.get('request')
        module_name = 'authentication'
        view_name = TOKEN_REFRESH_PATH_NAME
        reverse_lookup = f'{module_name}:{view_name}'
        return reverse(reverse_lookup, request=request)

    def validate(self, attrs):
        data = super().validate(attrs)
        data["first_name"] = self.user.first_name
        data["last_name"] = self.user.last_name
        data["role"] = self.user.role
        
        data['refresh_url'] = self._get_refresh_url()
        
        return data


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