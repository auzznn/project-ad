from django.shortcuts import render
from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializer import GeneralLeaderboardSerializer
from .pagination import StandardResultsSetPagination

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
