from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import RMTView

rmt_router = DefaultRouter()
rmt_router.register("", RMTView)

urlpatterns = [path("", include(rmt_router.urls))]
