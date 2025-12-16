from .views import (
  DisciplineRecordView,
  DisciplineTypeView,
  DisciplineLeaderboardView,
)
from rest_framework.routers import DefaultRouter
from django.urls import path, include

router = DefaultRouter()
router.register("type", DisciplineTypeView)
router.register("record", DisciplineRecordView)
router.register("leaderboard", DisciplineLeaderboardView, basename="leaderboard") 

urlpatterns = [
  path("", include(router.urls))
]