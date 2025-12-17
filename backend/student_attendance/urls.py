from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import StudentAttendanceViewSet, DailyStudentAttendanceViewSet, DateStudentAttendanceViewSet

router = DefaultRouter()
router.register("", StudentAttendanceViewSet)
router.register("daily", DailyStudentAttendanceViewSet, basename="daily_student_attendance")
router.register(r"(?P<year>\d{4})/(?P<month>\d{1,2})/(?P<day>\d{1,2})", DateStudentAttendanceViewSet, basename="date_student_attendace")

urlpatterns = [
  path("", include(router.urls)),
]