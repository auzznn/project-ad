from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from django.db.models import (
    Q,
    Count,
)
from django.db.models.functions import Coalesce

from authentication.models import Classroom, MigrateStudent
from .serializer import (
    StudentAttendanceSerializer,
    RecordStudentAttendanceSerializer,
    AddNoteSerializer,
    AttendanceStudentRecordStatsSerializer,
)
from . import const
from .models import StudentAttendance
from base.pagination import StandardResultsSetPagination
from .utils import ATTENDANCE_RATE_STATUS

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

    @action(detail=False, methods=["get"], url_path=rf"(?P<attend_status>{const.STATUS_REGEX})")
    def by_status(self, request, attend_status: str, *args, **kwargs):
        queryset = self.get_queryset()
        queryset = queryset.filter(status=attend_status)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["get"], url_path=r"(?P<class_grade>[0-6]{1})")
    def by_grade(self, requst, class_grade: int, *args, **kwargs):
        queryset = self.get_queryset().filter(migrate_student_id__class_room__grade=class_grade)
        
        page = self.paginate_queryset(queryset=queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DailyStudentAttendanceViewSet(GeneralStudentAttendanceViewSet):
    queryset = StudentAttendance.objects.today()


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


class GeneralAttendanceStatsViewSet(viewsets.GenericViewSet):
    """
    Super class for all statistics.
    Subclasses must provide a 'queryset'.
    """

    queryset = None
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        view = [
            self.student_attendance_records.__name__,
            self.dashboard.__name__,
        ]
        
        if self.action in view:
            return AttendanceStudentRecordStatsSerializer

    def get_queryset(self):
        assert (
            self.queryset is not None
        ), f"'{self.__class__.__name__}' must include a 'queryset' attribute."
        return self.queryset

    def get_student_record(self):
        period_queryset = self.get_queryset()
        students = MigrateStudent.objects.annotate(
            present=Coalesce(
                Count(
                    "attendance",
                    filter=Q(
                        attendance__in=period_queryset,
                        attendance__status=const.ON_TIME_STATUS_KEY,
                    ),
                ),
                0,
            ),
            late=Coalesce(
                Count(
                    "attendance",
                    filter=Q(
                        attendance__in=period_queryset,
                        attendance__status=const.LATE_STATUS_KEY,
                    ),
                ),
                0,
            ),
            absent=Coalesce(
                Count(
                    "attendance",
                    filter=Q(
                        attendance__in=period_queryset,
                        attendance__status=const.ABSENT_STATUS_KEY,
                    ),
                ),
                0,
            ),
        ).select_related("class_room")
        return students
    
    def get_attendance_rate_status_distribution(self):
        distribution =  dict().fromkeys(ATTENDANCE_RATE_STATUS, 0)
        students = self.get_student_record()
        serializer = self.get_serializer(students, many=True)
        
        for student in serializer.data:
           status =  student['status']
           distribution[status] += 1
        
        return distribution

    @action(detail=False, methods=["get"])
    def dashboard(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Aggregate stats based on the provided queryset
        stats = queryset.aggregate(
            on_time=Count("id", filter=Q(status=const.ON_TIME_STATUS_KEY)),
            late=Count("id", filter=Q(status=const.LATE_STATUS_KEY)),
            absent=Count("id", filter=Q(status=const.ABSENT_STATUS_KEY)),
        )

        count = queryset.count()
        average_attendance = 0 if count == 0 else (stats["on_time"] / queryset.count())
        attendance_rate_distribution = self.get_attendance_rate_status_distribution()

        data = {
            "on_time_count": stats["on_time"],
            "late_count": stats["late"],
            "absent_count": stats["absent"],
            "attendance_rate": average_attendance,
            "attendance_rate_distirbution": attendance_rate_distribution
        }
        return Response(data)

    @action(detail=False, methods=["get"])
    def classroom_breakdown(self, request, *args, **kwargs):
        """
        Returns attendance percentage per classroom using the provided queryset
        """
        raw_data = (
            self.get_queryset()
            .values(
                "migrate_student_id__class_room__grade",
                "migrate_student_id__class_room__class_section",
                "status",
            )
            .annotate(count=Count("id"))
            .order_by(
                "migrate_student_id__class_room__grade",
                "migrate_student_id__class_room__class_section",
            )
        )

        structured_data = {}
        for entry in raw_data:
            grade = entry["migrate_student_id__class_room__grade"]
            section = entry["migrate_student_id__class_room__class_section"]

            if grade is None:
                continue

            class_name = f"{grade}{section}"

            if class_name not in structured_data:
                structured_data[class_name] = {
                    "class_name": class_name,
                    "stats": [],
                    "count": 0,
                }

            structured_data[class_name]["stats"].append(
                {"status": entry["status"], "count": entry["count"]}
            )
            structured_data[class_name]["count"] += entry["count"]

        return Response(list(structured_data.values()))

    @action(detail=False, methods=["get"])
    def student_attendance_records(self, request, *args, **kwargs):
        """
        Returns a list of students with their aggregated attendance metrics.
        """
        students = self.get_student_record()

        # Apply pagination if necessary
        page = self.paginate_queryset(students)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(students, many=True)
        return Response(serializer.data)


class DailyAttendanceStatsViewSet(GeneralAttendanceStatsViewSet):
    """
    Daily Stats: Only looks at today's records.
    """

    # Using the manager method we created earlier for consistency
    queryset = StudentAttendance.objects.today()


class YearlyAttendanceStatsViewSet(GeneralAttendanceStatsViewSet):
    """
    Yearly Stats: Only looks at Yearly records.
    """

    # Using the manager method we created earlier for consistency
    def get_queryset(self):
        year = self.kwargs.get("year")
        return StudentAttendance.objects.by_year(year)


class MonthlyAttendanceStatsViewSet(GeneralAttendanceStatsViewSet):
    """
    Monthly Stats: Only looks at Monthly records.
    """

    # Using the manager method we created earlier for consistency
    def get_queryset(self):
        year = self.kwargs.get("year")
        month = self.kwargs.get("month")
        return StudentAttendance.objects.by_year(year).by_month(month)
