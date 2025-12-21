from rest_framework import viewsets
from django.db.models import F, When, Case, Sum, IntegerField

from authentication.models import MigrateStudent
from .models import SahsiahType, SahsiahRecord
from .serializer import (
    SahsiahTypeSerializer,
    SahsiahRecordSerializer,
)
from django.conf import settings
from base.pagination import StandardResultsSetPagination
from base.views import GeneralLeaderboardView


# Create your views here.
class SahsiahTypeView(viewsets.ModelViewSet):
    queryset = SahsiahType.objects.all()
    serializer_class = SahsiahTypeSerializer
    pagination_class = StandardResultsSetPagination


class SahsiahRecordView(viewsets.ModelViewSet):
    queryset = SahsiahRecord.objects.all()
    serializer_class = SahsiahRecordSerializer
    pagination_class = StandardResultsSetPagination


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
