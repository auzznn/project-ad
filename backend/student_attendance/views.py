from django.utils import timezone
from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from django.utils import timezone
from django.conf import settings
from django.db.models import (
    Q, Count, 
)

from authentication.models import Classroom, MigrateStudent
from .serializer import (
    StudentAttendanceSerializer,
    RecordStudentAttendanceSerializer,
    AddNoteSerializer,
)
from . import const
from .models import StudentAttendance
from base.pagination import StandardResultsSetPagination
import pytz


# Create your views here.
class StudentAttendanceViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    queryset = StudentAttendance.objects.all()
    serializer_class = StudentAttendanceSerializer
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        endpoint_action = ["record_student_attendance"]
        if self.action in endpoint_action:
            return RecordStudentAttendanceSerializer
        if self.action == "add_note":
            return AddNoteSerializer

        return super().get_serializer_class()

    @action(detail=False, url_path="record", methods=["patch"])
    def record_student_attendance(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return_response = StudentAttendanceSerializer(instance=instance)
        return Response(return_response.data, status=status.HTTP_200_OK)

    @action(detail=True, url_path="note", methods=["patch"])
    def add_note(self, request: Request, pk: int) -> Response:
        """
        API endpoint to add/update the note for a specific StudentAttendance record.
        """
        try:
            instance = self.get_object()
        except Exception:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer_class = self.get_serializer_class()

        serializer = serializer_class(
            instance=instance, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        output_serializer = StudentAttendanceSerializer(instance=instance)
        return Response(output_serializer.data, status=status.HTTP_200_OK)


class GeneralStudentAttendanceViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    def _get_classroom_instance(self, grade: int, section: str) -> Classroom | None:
        try:
            return Classroom.objects.get(grade=grade, class_section=section)
        except Classroom.DoesNotExist:
            return None

    serializer_class = StudentAttendanceSerializer
    pagination_class = StandardResultsSetPagination

    @action(
        detail=False, methods=["get"], url_path=r"(?P<grade>[0-9]+)/(?P<section>[^/.]+)"
    )
    def by_class(
        self, request, grade: int = None, section: str = None, *args, **kwargs
    ):
        class_room_instance = self._get_classroom_instance(grade, section)
        serializer = None

        if class_room_instance == None:
            response = {"message": "Invalid class room name"}
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset()
        queryset = queryset.filter(migrate_student_id__class_room=class_room_instance)

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path=r"(?P<attend_status>[^/.]+)")
    def by_status(self, request, attend_status: str, *args, **kwargs):
        queryset = self.get_queryset()
        queryset = queryset.filter(status=attend_status)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DailyStudentAttendanceViewSet(GeneralStudentAttendanceViewSet):
    def _get_current_date_aware() -> timezone.datetime:
        tz = pytz.timezone(settings.TIME_ZONE)
        return timezone.now().astimezone(tz).date()

    queryset = StudentAttendance.objects.filter(date=_get_current_date_aware())


class DateStudentAttendanceViewSet(GeneralStudentAttendanceViewSet):
    queryset = StudentAttendance.objects.all()

    def get_queryset(self):
        year = self.kwargs.get("year")
        month = self.kwargs.get("month")
        day = self.kwargs.get("day")

        if year and month and day:
            return self.queryset.filter(
                date__year=year, date__month=month, date__day=day
            )

        return super().get_queryset()

class AttendanceStatsViewSet(viewsets.ViewSet):
    """
    ViewSet to handle Dashboard Statistics and Analytics
    """
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        today = timezone.now().date()
        
        # Aggregate today's stats
        stats = StudentAttendance.objects.filter(date=today).aggregate(
            on_time=Count('id', filter=Q(status=const.ON_TIME_STATUS_KEY)),
            late=Count('id', filter=Q(status=const.LATE_STATUS_KEY)),
            absent=Count('id', filter=Q(status=const.ABSENT_STATUS_KEY)),
        )
        
        total_students = MigrateStudent.objects.count()
        total_present = stats['on_time'] + stats['late']
        
        data = {
            "total_students": total_students,
            "on_time_count": stats['on_time'],
            "late_count": stats['late'],
            "absent_count": stats['absent'],
            "attendance_rate": (total_present / total_students * 100) if total_students > 0 else 0
        }
        
        return Response(data)

    @action(detail=False, methods=['get'])
    def classroom_breakdown(self, request):
        """
        Returns attendance percentage per classroom as seen in Figma charts
        """
        today = timezone.now().date()
        classrooms = Classroom.objects.all()
        result = []

        for cls in classrooms:
            attendance = StudentAttendance.objects.filter(
                date=today, 
                migrate_student_id__class_room=cls
            ).values('status').annotate(count=Count('status'))
            
            result.append({
                "class_name": cls.name,
                "stats": list(attendance)
            })
            
        return Response(result)