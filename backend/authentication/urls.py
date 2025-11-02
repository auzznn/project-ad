from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
  TokenView, 
  TokenRefreshView,
  MyUserView,
)
from .const import (
  TOKEN_OBTAIN_PATH_NAME, 
  TOKEN_REFRESH_PATH_NAME, 
  USER_PATH_NAME
)

router = DefaultRouter()
router.register(r"user", MyUserView, basename=USER_PATH_NAME)

urlpatterns = [
  path("token", TokenView.as_view(), name=TOKEN_OBTAIN_PATH_NAME),
  path('token/refresh', TokenRefreshView.as_view(), name=TOKEN_REFRESH_PATH_NAME),
  path('', include(router.urls))
]
