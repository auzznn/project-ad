from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
  SahsiahTypeView, 
  SahsiahRecordView, 
  SahsiahLeaderboardView,
)

router = DefaultRouter()
router.register("type", SahsiahTypeView)
router.register("record", SahsiahRecordView)
router.register("leaderboard", SahsiahLeaderboardView) 

urlpatterns = [
  path("", include(router.urls))
]