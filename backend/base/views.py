from django.shortcuts import render
from rest_framework_simplejwt.views import (
  TokenObtainPairView,
  TokenRefreshView
)

# Create your views here.
class TokenView(TokenObtainPairView):
  pass
