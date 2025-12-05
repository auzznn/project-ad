from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import SahsiahTypeView

router = DefaultRouter()
router.register("/type", SahsiahTypeView)

urlpatterns = [
  path("", include(router.urls))
]