from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
  SahsiahTypeView, 
  SahsiahRecordView, 
  SahsiahLeaderboardView,
)

sahsiah_router = DefaultRouter()
sahsiah_router.register("type", SahsiahTypeView)
sahsiah_router.register("record", SahsiahRecordView)
sahsiah_router.register("leaderboard", SahsiahLeaderboardView) 

urlpatterns = [
  path("", include(sahsiah_router.urls))
]