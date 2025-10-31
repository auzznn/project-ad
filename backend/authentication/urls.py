from django.urls import path
from .views import TokenView, TokenRefreshView


urlpatterns = [
  path("token/", TokenView.as_view(), name="obtain_token"),
  path("token/refresh", TokenRefreshView.as_view(), name="")
]