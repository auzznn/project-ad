from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request

from authentication.models import MigrateStudent
from django.db.models import Sum, Case, When, F, IntegerField
from django.conf import settings

from base.pagination import StandardResultsSetPagination
from base.views import GeneralLeaderboardView, GeneralMeritAnalyticView 

from .models import DisciplineRecord, DisciplineType
from .serializer import (
    DisciplineRecordSerializer,
    DisciplineTypeSerializer,
)

# Create your views here.
class DisciplineTypeView(viewsets.ModelViewSet):
    queryset = DisciplineType.objects.all()
    serializer_class = DisciplineTypeSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]


class DisciplineRecordView(viewsets.ModelViewSet):
    queryset = DisciplineRecord.objects.all()
    serializer_class = DisciplineRecordSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=["get"], url_path=r"student/(?P<student_id>[0-9]+)")
    def retrieve_by_student(self, request: Request, student_id: int, *args, **kwargs):
        queryset = self.get_queryset().filter(student_id=student_id)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DisciplineLeaderboardView(GeneralLeaderboardView):
    queryset = (
        MigrateStudent.objects.annotate(
            total_discipline_point=Sum(
                Case(
                    # Only sum points for records within the academic year
                    When(
                        discipline__timestamp__range=(
                            settings.ACADEMIC_YEAR_START,
                            settings.ACADEMIC_YEAR_END,
                        ),
                        then=F("discipline__discipline_type__points"),
                    ),
                    default=0,
                    output_field=IntegerField(),
                )
            )
        )
        .select_related("class_room")
    )
    point_field = "total_discipline_point"

class DisciplineAnalyticViewSet(GeneralMeritAnalyticView):
    queryset = DisciplineRecord.objects.all()
    record_type = "discipline_type"
    student_id = "student_id"