from rest_framework import viewsets
from authentication.models import MigrateStudent
from .models import DisciplineRecord, DisciplineType
from django.db.models import Sum, Case, When, F, IntegerField
from django.conf import settings
from .serializer import (
    DisciplineRecordSerializer,
    DisciplineTypeSerializer,
)
from base.pagination import StandardResultsSetPagination
from base.views import GeneralLeaderboardView

# Create your views here.
class DisciplineTypeView(viewsets.ModelViewSet):
    queryset = DisciplineType.objects.all()
    serializer_class = DisciplineTypeSerializer
    pagination_class = StandardResultsSetPagination


class DisciplineRecordView(viewsets.ModelViewSet):
    queryset = DisciplineRecord.objects.all()
    serializer_class = DisciplineRecordSerializer
    pagination_class = StandardResultsSetPagination


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
        .order_by("-total_discipline_point")
        .select_related("class_room")
    )
    point_field = "total_discipline_point"
