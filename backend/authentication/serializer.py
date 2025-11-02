from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.reverse import reverse
from django.contrib.sites.models import Site

from .models import MyUser
from .const import TOKEN_REFRESH_PATH_NAME

class MyTokenObtenPairSerializer(TokenObtainPairSerializer):
  
  @classmethod
  def get_token(cls, user: MyUser) -> dict[str, any]:
    domain = Site.objects.get_current().domain
    token = super().get_token(user)
    
    token['first_name'] = user.first_name
    token['last_name'] = user.last_name
    token['role'] = user.role
    token['url'] = {
      'refresh': f'https://{domain}{reverse(TOKEN_REFRESH_PATH_NAME)}'
    }
    return token