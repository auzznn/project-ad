from django.urls import path, include

urlpatterns = [
  path("authentication/", include("authentication.urls")),
  path("student_attendance/", include("student_attendance.urls")),
]