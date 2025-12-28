from django.shortcuts import render
from django.db.models import F, Count, Sum
from django.db.models.functions import ExtractMonth

from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .serializer import GeneralLeaderboardSerializer
from .pagination import StandardResultsSetPagination
from .utils import set_timezone, default_datetime
from .const import MONTH_NAMES

# Create your views here.
class GeneralLeaderboardView(viewsets.GenericViewSet, mixins.ListModelMixin):
    point_field = ""
    serializer_class = GeneralLeaderboardSerializer
    pagination_class = StandardResultsSetPagination
    
    def create_ranking_student(self, queryset=None):
        if not queryset:
            queryset = self.get_queryset()

        ranked_data = []
        rank = 0
        last_points = None

        for i, student in enumerate(queryset):
            current_points = getattr(student, self.point_field) or 0

            # Use 'dense' ranking: same points get the same rank
            if current_points != last_points:
                rank = i + 1
            last_points = current_points

            # Create a dictionary for the serializer to process
            ranked_data.append(
                {
                    "student_id": student.pk,
                    "student_name": student.fullname,
                    "class_room": student.class_room.name,
                    "point": current_points,
                    "ranking": rank,  # ADD THE RANK HERE
                }
            )

        serializer = self.get_serializer(ranked_data, many=True)
        return serializer

    def create_list_response(self, serializer):
        page = self.paginate_queryset(serializer.data)
        if page is not None:
            return self.get_paginated_response(page)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.create_ranking_student(queryset=queryset)
        return self.create_list_response(serializer)

    @action(detail=False, url_path=r"(?P<grade>[0-9]+)/(?P<section>[^/.]+)")
    def group_by_class(self, request, grade: int, section: str, *args, **kwargs):
        queryset = self.get_queryset().filter(
            class_room__grade=grade, class_room__class_section__exact=section
        )
        serializer = self.create_ranking_student(queryset=queryset)
        return self.create_list_response(serializer)

    @action(detail=False, url_path=r"(?P<grade>[0-9]+)")
    def group_by_grade(self, request, grade: int, *args, **kwargs):
        queryset = self.get_queryset().filter(class_room__grade=grade)
        serializer = self.create_ranking_student(queryset=queryset)
        return self.create_list_response(serializer)

class GeneralMeritAnalyticView(viewsets.GenericViewSet):
    record_type = None

    def get_tag_summary(self):
        return (
            self.get_queryset()
            .values(tag=F("sahsiah_type_id__tag"))
            .annotate(
                total_points=Sum(self.get_point_name()),
                record_count=Count("id"),
            )
        )

    def get_point_name(self):
        return f"{self.record_type}__points"

    @action(detail=False, methods=["get"])
    def dashboard_cards(self, request):
        now = set_timezone(default_datetime())
        # Filter records for the current month and year
        current_month_records = self.get_queryset().filter(
            timestamp__year=now.year, timestamp__month=now.month
        )

        # 1. Count total records this month
        count = current_month_records.count()

        # 2. Sum points (via the related sahsiah_type)
        total_points = (
            current_month_records.aggregate(total=Sum(self.get_point_name()))["total"]
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
            "monthly_record_count": count,
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
            self.get_queryset()
            .filter(timestamp__year=current_year)
            .annotate(month=ExtractMonth("timestamp"))
            .values("month")
            .annotate(total_points=Sum(self.get_point_name()), record_count=Count("id"))
            .order_by("month")
        )

        # 3. Create a map of the results for quick lookup
        stats_map = {item["month"]: item for item in monthly_stats}

        # 4. Ensure all 12 months exist (even with 0 values)
        month_names = MONTH_NAMES

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

    @action(detail=False, methods=["get"])
    def points_by_tag(self, request):
        # 1. Group by the 'tag' field
        # We use .values('tag') first to tell Django to GROUP BY this column
        tag_summary = self.get_tag_summary()

        # 2. Format the response
        # tag_summary will look like: [{'tag': 'positive', 'total_points': 500, ...}, ...]
        data = []
        for item in tag_summary:
            data.append(
                {
                    "tag_name": item["tag"],
                    "total_points_sum": item["total_points"] or 0,
                    "total_records": item["record_count"],
                }
            )

        return Response(data)

    @action(detail=False, methods=["get"])
    def tag_distribution(self, request):
        # 1. Get the Total Count of all records in the system
        total_records = self.get_queryset().count()

        # Handle case where there are no records to avoid DivisionByZero
        if total_records == 0:
            return Response([])

        # 2. Group by tag and count records
        # Note: We query SahsiahType to get all unique tags defined
        tag_counts = (
            self.get_queryset()
            .values(tag=F("sahsiah_type_id__tag"))
            .annotate(count=Count("id"))
            .filter(count__gt=0)
        )

        # 3. Calculate percentages
        data = []
        for item in tag_counts:
            count = item["count"]
            percentage = count / total_records

            data.append(
                {
                    "tag": item["tag"],
                    "record_count": count,
                    "percentage": round(percentage, 2),  # Formatted for UI display
                }
            )

        return Response({"total_records": total_records, "distribution": data})