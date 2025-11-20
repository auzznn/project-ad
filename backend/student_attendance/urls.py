from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import StudentAttendanceViewSet

router = DefaultRouter()
router.register("", StudentAttendanceViewSet)

urlpatterns = [
  path("", include(router.urls))
]