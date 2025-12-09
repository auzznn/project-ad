from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import RMTView

router = DefaultRouter()
router.register("", RMTView)

urlpatterns = [
  path("", include(router.urls))
]