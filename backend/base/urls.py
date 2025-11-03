from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'students', views.StudentListCreateView, basename='student')

urlpatterns = [
    path("authentication/", include("authentication.urls")),
    path("students/", views.StudentListCreateView.as_view(), name="student-list-create"),
    path("students/<int:pk>/", views.StudentDetailView.as_view(), name="student-detail"),
    path("stats/", views.student_stats, name="student-stats"),
]