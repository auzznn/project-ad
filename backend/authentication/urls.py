from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import TokenView, TokenRefreshView, MyUserView, StudentView, ClassroomView
from .const import (
    TOKEN_OBTAIN_PATH_NAME,
    TOKEN_REFRESH_PATH_NAME,
)
from base.const import (
    USER_BASENAME_PATH,
    STUDENT_BASENAME_PATH,
    CLASSROOM_BASENAME_PATH,
)
router = DefaultRouter()
router.register("student", StudentView, basename=STUDENT_BASENAME_PATH)
router.register("classroom", ClassroomView, basename=CLASSROOM_BASENAME_PATH)
router.register("user", MyUserView, basename=USER_BASENAME_PATH)

urlpatterns = [
    path("token", TokenView.as_view(), name=TOKEN_OBTAIN_PATH_NAME),
    path("token/refresh", TokenRefreshView.as_view(), name=TOKEN_REFRESH_PATH_NAME),
    path("", include(router.urls)),
]
