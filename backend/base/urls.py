from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import list_all_endpoints

urlpatterns = [
    path("", list_all_endpoints),
    path("authentication/", include(("authentication.urls", "authentication"))),
    path(
        "student_attendance/",
        include(("student_attendance.urls", "student_attendance")),
    ),
    path("sahsiah/", include(("sahsiah.urls", "sahsiah"))),
    path("rmt/", include(("rmt.urls", "rmt"))),
    path("discipline/", include(("record_discipline.urls", "record_discipline"))),
]
