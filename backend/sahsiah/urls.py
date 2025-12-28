from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
  SahsiahTypeView, 
  SahsiahRecordView, 
  SahsiahLeaderboardView,
  SahsiahAnalyticsViewSet
)

sahsiah_router = DefaultRouter()
sahsiah_router.register("type", SahsiahTypeView)
sahsiah_router.register("record", SahsiahRecordView)
sahsiah_router.register("leaderboard", SahsiahLeaderboardView) 
sahsiah_router.register('statistic', SahsiahAnalyticsViewSet, basename='statisitc')

urlpatterns = [
  path("", include(sahsiah_router.urls))
]