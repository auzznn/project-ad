from django.shortcuts import render
from django.utils import timezone
from django.db.models.functions import ExtractWeekDay, ExtractMonth, ExtractDay
from django.db.models import Count, Q, ExpressionWrapper, F, IntegerField, FloatField, Max
from django.conf import settings

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status, viewsets, mixins

from base.pagination import StandardResultsSetPagination
from base.const import MONTH_NAMES
from base.utils import set_timezone
from authentication.models import MigrateStudent

from .models import RMTRecord
from .serializer import (
    RMTRecordSerializer,
    RecordRMTRecordSerializer,
    StudentRMTAnalyticsSerializer,
)


# Create your views here.
class RMTView(viewsets.GenericViewSet, mixins.ListModelMixin):
    queryset = RMTRecord.objects.all().order_by("-date")
    serializer_class = RMTRecordSerializer
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == "record":
            return RecordRMTRecordSerializer
        return super().get_serializer_class()

    @action(detail=False, methods=["patch"])
    def record(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return_response = RecordRMTRecordSerializer(instance)
        return Response(return_response.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="daily")
    def daily(self, request: Request, *args, **kwargs):
        queryset = self.get_queryset().today()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RMTStatisticView(viewsets.GenericViewSet):
    queryset = RMTRecord.objects.all()
    now = set_timezone(timezone.now())

    def get_serializer_class(self):
        if self.action == self.list_rmt_student.__name__:
            return StudentRMTAnalyticsSerializer
        return super().get_serializer_class()

    def get_eligible_count(self):
        return MigrateStudent.objects.filter(rmt_elligible=True).count()

    @action(detail=False, methods=["get"], url_path="summary-cards")
    def summary_cards(self, request):
        total_eligible = self.get_queryset().today().count()

        # 2. Count records for today where the student actually showed up
        # We use your custom .today() queryset method
        present_count = RMTRecord.objects.today().filter(is_present=True).count()

        # 3. Logic for "Not Present" and Percentage
        # We subtract present from total eligible to find the absentees
        not_present_count = max(0, total_eligible - present_count)

        attendance_percentage = present_count / total_eligible

        return Response(
            {
                "present_rmt": present_count,
                "not_present_rmt": not_present_count,
                "rmt_percentage": attendance_percentage,
            }
        )

    @action(detail=False, methods=["get"], url_path="rmt_trends/weekly")
    def weekly_rmt_trends(self, request, *args, **kwargs):
        start_of_week = self.now - timezone.timedelta(days=self.now.weekday())
        records = (
            self.get_queryset()
            .filter(
                date__range=[start_of_week, start_of_week + timezone.timedelta(days=4)]
            )
            .annotate(day=ExtractWeekDay("date"))
            .values("day")
            .annotate(
                is_present_count=Count("id", filter=Q(is_present=True)),
                not_present_count=Count("id", filter=Q(is_present=False)),
            )
        )

        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri"]
        data = {
            day_names[i]: {
                "is_present_count": 0,
                "not_present_count": 0,
            }
            for i in range(5)
        }

        for week_day_record in records:
            day_index = week_day_record["day"] - 2
            data[day_names[day_index]] = {
                "is_present_count": week_day_record["is_present_count"],
                "not_present_count": week_day_record["not_present_count"],
            }

        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="rmt_trends/monthly")
    def monthly_rmt_trends(self, request, *args, **kwargs):
        records = (
            self.get_queryset()
            .filter(date__month=self.now.month, date__year=self.now.year)
            .annotate(day_of_month=ExtractDay("date"))
            .annotate(
                week=ExpressionWrapper(
                    (F("day_of_month") - 1) / 7 + 1, output_field=IntegerField()
                )
            )
            .values("week")
            .annotate(
                is_present_count=Count("id", filter=Q(is_present=True)),
                not_present_count=Count("id", filter=Q(is_present=False)),
            )
        )

        data = {
            f'Week {record["week"]}': {
                "is_present_count": record["is_present_count"],
                "not_present_count": record["not_present_count"],
            }
            for record in records
        }

        return Response(data)

    @action(detail=False, methods=["get"], url_path="rmt_trends/yearly")
    def yearly_rmt_trends(self, request, *args, **kwargs):
        records = (
            self.get_queryset()
            .filter(date__year=self.now.year)
            .annotate(month=ExtractMonth("date"))
            .values("month")
            .annotate(
                is_present_count=Count("id", filter=Q(is_present=True)),
                not_present_count=Count("id", filter=Q(is_present=False)),
            )
        )

        data = {
            month: {
                "is_present_count": 0,
                "not_present_count": 0,
            }
            for month in MONTH_NAMES
        }

        for monthly_record in records:
            month_index = monthly_record.pop("month", None)
            month_name = MONTH_NAMES[month_index - 1]
            data[month_name] = monthly_record
        return Response(data)

    @action(detail=False, methods=["get"], url_path="rmt-student")
    def list_rmt_student(self, request, *args, **kwargs):
        records = (
            self.get_queryset()
            .filter(date__range=[settings.ACADEMIC_YEAR_START, settings.ACADEMIC_YEAR_END])
            .values(
                "migrate_student_id",
                "migrate_student_id__first_name",
                "migrate_student_id__last_name",
                "migrate_student_id__class_room__class_section",
                "migrate_student_id__class_room__grade"
            )
            .annotate(
                average_rmt_percentage=ExpressionWrapper(
                    Count("id", filter=Q(is_present=True)) / Count("id"),
                    output_field=FloatField(),
                ),
                today_is_present=F("is_present"),
                latest_present=Max("date", filter=Q(is_present=True))
            )
        )

        serializer = self.get_serializer(records, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
