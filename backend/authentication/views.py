from rest_framework.permissions import IsAuthenticated 
from rest_framework_simplejwt.views import (
  TokenObtainPairView,
  TokenRefreshView
)
from rest_framework.viewsets import ModelViewSet

from .models import MyUser
from .serializer import (
  MyTokenObtenPairSerializer,
  MyUserCreateSerializer,
  MyUserRetrieveSerializer
)

# Create your views here.
class TokenView(TokenObtainPairView):
  serializer_class = MyTokenObtenPairSerializer 

class MyUserView(ModelViewSet):
  queryset = MyUser.objects.all()
  permission_classes = [IsAuthenticated]

  def get_serializer_class(self):
    return MyUserCreateSerializer if self.action == 'create' else MyUserRetrieveSerializer