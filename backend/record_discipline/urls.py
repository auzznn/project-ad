from .views import (
  DisciplineRecordView,
  DisciplineTypeView,
  DisciplineLeaderboardView,
)
from rest_framework.routers import DefaultRouter
from django.urls import path, include

record_discipline_router = DefaultRouter()
record_discipline_router.register("type", DisciplineTypeView)
record_discipline_router.register("record", DisciplineRecordView)
record_discipline_router.register("leaderboard", DisciplineLeaderboardView, basename="leaderboard") 

urlpatterns = [
  path("", include(record_discipline_router.urls))
]