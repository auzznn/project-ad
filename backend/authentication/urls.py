from django.urls import path
from .views import TokenView, TokenRefreshView
from .const import TOKEN_OBTAIN_NAME, TOKEN_REFRESH_NAME

urlpatterns = [
  path("token/", TokenView.as_view(), name=TOKEN_OBTAIN_NAME),
  path("token/refresh", TokenRefreshView.as_view(), name=TOKEN_REFRESH_NAME)
]