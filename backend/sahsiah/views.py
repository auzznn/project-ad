from rest_framework import viewsets
from django.db.models import F, When, Case, Sum, IntegerField, Count
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from authentication.models import MigrateStudent
from django.conf import settings

from base.pagination import StandardResultsSetPagination
from base.views import GeneralLeaderboardView, GeneralMeritAnalyticView

from .models import SahsiahType, SahsiahRecord
from .serializer import (
    SahsiahTypeSerializer,
    SahsiahRecordSerializer,
)


# Create your views here.
class SahsiahTypeView(viewsets.ModelViewSet):
    queryset = SahsiahType.objects.all()
    serializer_class = SahsiahTypeSerializer
    pagination_class = StandardResultsSetPagination


class SahsiahRecordView(viewsets.ModelViewSet):
    queryset = SahsiahRecord.objects.all().order_by("-timestamp")
    serializer_class = SahsiahRecordSerializer
    pagination_class = StandardResultsSetPagination

    @action(detail=False, methods=["get"], url_path=r"student/(?P<student_id>[0-9]+)")
    def retrieve_by_student(self, request: Request, student_id: int, *args, **kwargs):
        queryset = self.get_queryset().filter(migrate_student_id=student_id)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SahsiahLeaderboardView(GeneralLeaderboardView):
    queryset = (
        MigrateStudent.objects.annotate(
            total_sahsiah_point=Sum(
                Case(
                    # Only sum points for records within the academic year
                    When(
                        sahsiah__timestamp__range=(
                            settings.ACADEMIC_YEAR_START,
                            settings.ACADEMIC_YEAR_END,
                        ),
                        then=F("sahsiah__sahsiah_type__points"),
                    ),
                    default=0,
                    output_field=IntegerField(),
                )
            )
        )
        .order_by("-total_sahsiah_point")
        .select_related("class_room")
    )
    point_field = "total_sahsiah_point"


class SahsiahAnalyticsViewSet(GeneralMeritAnalyticView):
    queryset = SahsiahRecord.objects.all()
    record_type = "sahsiah_type"
