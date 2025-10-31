
from .models import MyUser
from .serializer import MyTokenObtenPairSerializer
from rest_framework_simplejwt.views import (
  TokenObtainPairView,
  TokenRefreshView
)

# Create your views here.
class TokenView(TokenObtainPairView):
  serializer_class = MyTokenObtenPairSerializer 