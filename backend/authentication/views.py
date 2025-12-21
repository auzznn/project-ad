
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.viewsets import ModelViewSet
from .models import MyUser, MigrateStudent, Classroom
from .serializer import (
    MyTokenObtenPairSerializer,
    MyUserCreateSerializer,
    MyUserRetrieveSerializer,
    StudentSerializer,
    CreateStudentSerializer,
    ClassroomSerializer
)
from base.pagination import StandardResultsSetPagination


# Create your views here.
class TokenView(TokenObtainPairView):
    serializer_class = MyTokenObtenPairSerializer


class MyUserView(ModelViewSet):
    queryset = MyUser.objects.all()
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        return (
            MyUserCreateSerializer
            if self.action == "create"
            else MyUserRetrieveSerializer
        )

    def get_queryset(self):
        if self.action in ["list", "retrieve"]:
            return self.queryset.select_related("student")
        return super().get_queryset()

class StudentView(ModelViewSet):
    queryset = MigrateStudent.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateStudentSerializer
        return StudentSerializer
    
class ClassroomView(ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer