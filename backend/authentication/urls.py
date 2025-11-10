from django.urls import path
from .views import (
  TokenView, 
  TokenRefreshView,
  MyUserView,
)
from .const import (
  TOKEN_OBTAIN_PATH_NAME, 
  TOKEN_REFRESH_PATH_NAME, 
  USER_LIST_PATH_NAME,
  USER_DETAIL_PATH_NAME
)

user_list_view = MyUserView.as_view({
  'get': 'list',
  'post': 'create'
})

user_detail_view = MyUserView.as_view({
  'get': 'retrieve',
  'put': 'update',
  'delete': 'destroy',
})

urlpatterns = [
  path('token', TokenView.as_view(), name=TOKEN_OBTAIN_PATH_NAME),
  path('token/refresh', TokenRefreshView.as_view(), name=TOKEN_REFRESH_PATH_NAME),
  path('user/', user_list_view, name=USER_LIST_PATH_NAME),
  path('user/<int:pk>', user_detail_view, name=USER_DETAIL_PATH_NAME)
]
