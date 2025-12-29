from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import RMTView, RMTStatisticView

rmt_router = DefaultRouter()
rmt_router.register("", RMTView)
rmt_router.register("statistic", RMTStatisticView, "rmt_statistic")

urlpatterns = [path("", include(rmt_router.urls))]
