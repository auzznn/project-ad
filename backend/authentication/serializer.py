from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.reverse import reverse
from django.conf import settings

from .models import MyUser, MigrateStudent, Classroom
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
    
    def update(self, instance, validated_data):
        # 1. Handle standard fields directly on the MigrateStudent model
        instance.rmt_elligible = validated_data.get('rmt_elligible', instance.rmt_elligible)
        if instance.rmt_elligible is None:
            instance.rmt_elligible = False

        # 2. Handle nested source fields (class_room)
        # Note: This assumes instance.class_room already exists.
        if 'class_room' in validated_data:
            classroom_data = validated_data.pop('class_room')
            for attr, value in classroom_data.items():
                setattr(instance.class_room, attr, value)
            instance.class_room.save()

        # 3. Logic for QR code (matching your create method)
        request = self.context.get('request')
        instance.generate_qr(request=request)
        
        instance.save()
        return instance

class MyUserRetrieveSerializer(ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = MyUser
        fields = ["id", "first_name", "last_name", "role", "children"]
    
    def get_children(self, instance: Meta.model):
        if not instance.role == 'parent':
            return None
        serializer = StudentSerializer(instance.children.all(), many=True)
        return serializer.data


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


class CreateStudentSerializer(ModelSerializer):
    class Meta:
        model = MigrateStudent
        fields = '__all__'

class ClassroomSerializer(ModelSerializer):
    class Meta:
        model = Classroom
        fields = '__all__'

class StudentBulkUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        if not value.name.endswith(('.xlsx', '.xls')):
            raise serializers.ValidationError("Invalid file format. Please upload an Excel file.")
        return value