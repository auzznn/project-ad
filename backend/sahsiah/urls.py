from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import SahsiahTypeView, SahsiahRecordView

router = DefaultRouter()
router.register("type", SahsiahTypeView)
router.register("record", SahsiahRecordView)

urlpatterns = [
  path("", include(router.urls))
]