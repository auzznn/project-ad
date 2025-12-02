from rest_framework.test import APITestCase
from rest_framework.reverse import reverse
from rest_framework import status
from authentication.const import TOKEN_OBTAIN_PATH_NAME
from authentication.models import MyUser

class JWTTokenTest(APITestCase):

  def setUp(self):
    self.username = "admin"
    self.password = "admin123"

    MyUser.objects.create_user(username=self.username, password=self.password)
    self.obtain_jwt_token_url = reverse(TOKEN_OBTAIN_PATH_NAME)
    
  
  def test_authorize_valid_user(self) -> None:
    """
    Ensure that valid user are able to recieve JWT token
    """
    payload = {
      'username': self.username,
      'password': self.password,
    }

    response = self.client.post(self.obtain_jwt_token_url, payload, format='json')
    self.assertEqual(response.status_code, status.HTTP_200_OK)
  
  def test_authorize_invalid_user(self) -> None:
    """
    Give error message (401 - unauthorized user) if unregistered or invalid information suser attempt to obtain JWT token
    """

    def attempt_obtain_token(username: str, password: str) -> None:
      payload = {
        'username': username,
        'password': password,
      }

      response = self.client.post(self.obtain_jwt_token_url, payload, format='json')
      self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    attempt_obtain_token("student1", "student1")
    attempt_obtain_token("admin", "admin12")
  
  def test_missing_information(self) -> None:
    """
    Give error message (400 - )
    """