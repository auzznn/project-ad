from rest_framework import viewsets
from django.db.models import F, When, Case, Sum, IntegerField, Count
from django.db.models.functions import ExtractMonth
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from authentication.models import MigrateStudent
from django.conf import settings

from base.pagination import StandardResultsSetPagination
from base.views import GeneralLeaderboardView
from base.utils import default_datetime, set_timezone

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
    queryset = SahsiahRecord.objects.all().order_by('-timestamp')
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


class SahsiahAnalyticsViewSet(viewsets.ViewSet):

    @action(detail=False, methods=["get"])
    def dashboard_cards(self, request):
        now = set_timezone(default_datetime())
        # Filter records for the current month and year
        current_month_records = SahsiahRecord.objects.filter(
            timestamp__year=now.year, timestamp__month=now.month
        )

        # 1. Count total records this month
        count = current_month_records.count()

        # 2. Sum points (via the related sahsiah_type)
        total_points = (
            current_month_records.aggregate(total=Sum("sahsiah_type__points"))["total"]
            or 0
        )

        # 3. Average points per student
        # We find how many unique students were involved this month
        student_count = (
            current_month_records.values("migrate_student_id").distinct().count()
        )

        avg_per_student = 0
        if student_count > 0:
            avg_per_student = round(total_points / student_count, 2)

        data = {
            "monthly_sahsiah_record_count": count,
            "monthly_total_point": total_points,
            "monthly_average_point_per_student": avg_per_student,
        }

        return Response(data)

    @action(detail=False, methods=["get"])
    def trend_points(self, request):
        # 1. Get the current year to filter the trend
        current_year = set_timezone(default_datetime()).year

        # 2. Query the database: Group by month and aggregate
        # We reach into sahsiah_type to get the points
        monthly_stats = (
            SahsiahRecord.objects.filter(timestamp__year=current_year)
            .annotate(month=ExtractMonth("timestamp"))
            .values("month")
            .annotate(
                total_points=Sum("sahsiah_type__points"), record_count=Count("id")
            )
            .order_by("month")
        )

        # 3. Create a map of the results for quick lookup
        stats_map = {item["month"]: item for item in monthly_stats}

        # 4. Ensure all 12 months exist (even with 0 values)
        month_names = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]

        trend_data = []
        for i in range(1, 13):
            month_data = stats_map.get(
                i, {"month": i, "total_points": 0, "record_count": 0}
            )

            trend_data.append(
                {
                    "month_name": month_names[i - 1],
                    "total_points": month_data["total_points"] or 0,
                    "record_count": month_data["record_count"],
                }
            )

        return Response(trend_data)
    
    @action(detail=False, methods=['get'])
    def points_by_category(self, request):
        # 1. Group by the 'tag' field
        # We use .values('tag') first to tell Django to GROUP BY this column
        tag_summary = (
            SahsiahType.objects.values('tag')
            .annotate(
                total_points=Sum('sahsiahrecord__sahsiah_type__points'),
                record_count=Count('sahsiahrecord')
            )
        )

        # 2. Format the response
        # tag_summary will look like: [{'tag': 'positive', 'total_points': 500, ...}, ...]
        data = []
        for item in tag_summary:
            data.append({
                "tag_name": item['tag'],
                "total_points_sum": item['total_points'] or 0,
                "total_records": item['record_count']
            })

        return Response(data)
    
    @action(detail=False, methods=['get'])
    def tag_distribution(self, request):
        # 1. Get the Total Count of all records in the system
        total_records = SahsiahRecord.objects.count()

        # Handle case where there are no records to avoid DivisionByZero
        if total_records == 0:
            return Response([])

        # 2. Group by tag and count records
        # Note: We query SahsiahType to get all unique tags defined
        tag_counts = (
            SahsiahType.objects.values('tag')
            .annotate(count=Count('sahsiahrecord'))
            .filter(count__gt=0) # Only include tags that actually have records
        )

        # 3. Calculate percentages
        data = []
        for item in tag_counts:
            count = item['count']
            percentage = (count / total_records)
            
            data.append({
                "tag": item['tag'],
                "record_count": count,
                "percentage": round(percentage, 2) # Formatted for UI display
            })

        return Response({
            "total_records": total_records,
            "distribution": data
        })