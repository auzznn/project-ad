from django.urls import path, include
from rest_framework.routers import DefaultRouter

from base.const import (
    GENERAL_STUDENT_ATTENDANCE_BASENAME_PATH,
    DAILY_STUDENT_ATTENDANCE_BASENAME_PATH,
    DATE_STUDENT_ATTENDANCE_BASENAME_PATH,
    DAILY_STATISTIC_STUDENT_ATTENDANCE_BASENAME_PATH,
    YEARLY_STATISTIC_STUDENT_ATTENDANCE_BASENAME_PATH,
    MONTHLY_STATISTIC_STUDENT_ATTENDANCE_BASENAME_PATH
)

from .views import (
    StudentAttendanceViewSet,
    DailyStudentAttendanceViewSet,
    DateStudentAttendanceViewSet,
    DailyAttendanceStatsViewSet,
    YearlyAttendanceStatsViewSet,
    MonthlyAttendanceStatsViewSet
)

student_attendance_router = DefaultRouter()
student_attendance_router.register(
    "", StudentAttendanceViewSet, basename=GENERAL_STUDENT_ATTENDANCE_BASENAME_PATH
)
student_attendance_router.register(
    "daily",
    DailyStudentAttendanceViewSet,
    basename=DAILY_STUDENT_ATTENDANCE_BASENAME_PATH,
)
student_attendance_router.register(
    r"(?P<year>\d{4})/(?P<month>\d{1,2})/(?P<day>\d{1,2})",
    DateStudentAttendanceViewSet,
    basename=DATE_STUDENT_ATTENDANCE_BASENAME_PATH,
)
student_attendance_router.register(
    "statistic/daily",
    DailyAttendanceStatsViewSet,
    basename=DAILY_STATISTIC_STUDENT_ATTENDANCE_BASENAME_PATH,
)

student_attendance_router.register(
    r"statistic/(?P<year>\d{4})",
    YearlyAttendanceStatsViewSet,
    basename=YEARLY_STATISTIC_STUDENT_ATTENDANCE_BASENAME_PATH,
)

student_attendance_router.register(
    r"statistic/(?P<year>\d{4})/(?P<month>\d{1,2})",
    MonthlyAttendanceStatsViewSet,
    basename=MONTHLY_STATISTIC_STUDENT_ATTENDANCE_BASENAME_PATH,
)

urlpatterns = [
    path("", include(student_attendance_router.urls)),
]
