from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.viewsets import ModelViewSet
from rest_framework import status, parsers
from rest_framework.response import Response
from rest_framework.decorators import action

from django.db import transaction
from django.contrib.auth.hashers import make_password

import pandas as pd

from .models import MyUser, MigrateStudent, Classroom
from .serializer import (
    MyTokenObtenPairSerializer,
    MyUserCreateSerializer,
    MyUserRetrieveSerializer,
    StudentSerializer,
    CreateStudentSerializer,
    ClassroomSerializer,
    StudentBulkUploadSerializer,
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


class StudentView(ModelViewSet):
    queryset = MigrateStudent.objects.all()
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateStudentSerializer
        if self.action == self.bulk_upload.__name__:
            return StudentBulkUploadSerializer
        return StudentSerializer

    @action(detail=False, url_path="bulk_upload", methods=["post"])
    def bulk_upload(self, request, *args, **kwargs):
        """
        Upload an Excel file to bulk create students.
        
        The Excel file must contain the following columns:
        - First Name
        - Last Name
        - Classroom (e.g., '1A', '2B')
        - parent first name
        - parent last name
        - parent email
        """
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        file_obj = serializer.validated_data["file"]

        if not file_obj:
            return Response(
                {"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Read Excel into a DataFrame
            df = pd.read_excel(file_obj)

            # Map Excel columns to variables (clean whitespace)
            df.columns = [c.strip() for c in df.columns]

            results = {"created": 0, "errors": []}

            # Use an atomic transaction so if one fails, we don't get partial data
            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        # 1. Handle Parent (MyUser)
                        email = str(row["parent email"]).strip()
                        parent_user, created = MyUser.objects.get_or_create(
                            email=email,
                            defaults={
                                "username": email,  # Using email as username
                                "first_name": row["parent first name"],
                                "last_name": row["parent last name"],
                                "role": "parent",
                                "password": make_password(
                                    email
                                ),  # Set password as email
                            },
                        )

                        # 2. Handle Classroom
                        # Assuming 'Classroom' in Excel is stored as "1A", "2B", etc.
                        # Extracting grade (first digit) and section (rest of string)
                        raw_classroom = str(row["Classroom"]).strip()
                        grade = int(raw_classroom[0])
                        section = raw_classroom[1:]

                        classroom, _ = Classroom.objects.get_or_create(
                            grade=grade, class_section=section
                        )

                        # 3. Handle Student (MigrateStudent)
                        student, s_created = MigrateStudent.objects.get_or_create(
                            first_name=row["First Name"].strip(),
                            last_name=row["Last Name"].strip(),
                            parent=parent_user,
                            defaults={
                                "class_room": classroom,
                            },
                        )

                        # Generate QR if it's a new student
                        if s_created:
                            # student.generate_qr(request=request)
                            results["created"] += 1

                    except Exception as e:
                        results["errors"].append(f"Row {index + 2}: {str(e)}")

            return Response(results, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Failed to process file: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ClassroomView(ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]
