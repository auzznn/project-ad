from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Student
from .serializer import StudentSerializer


class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'email', 'student_id']
    ordering_fields = ['name', 'enrollment_date', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        queryset = Student.objects.all()
        
        # Filter by enrollment date range if provided
        start_date = self.request.query_params.get('enrollment_date_after')
        end_date = self.request.query_params.get('enrollment_date_before')
        
        if start_date:
            queryset = queryset.filter(enrollment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(enrollment_date__lte=end_date)
            
        return queryset


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_stats(request):
    """
    Returns statistics about students
    """
    total_students = Student.objects.count()
    active_students = Student.objects.filter(is_active=True).count()
    
    return Response({
        'total_students': total_students,
        'active_students': active_students,
        'inactive_students': total_students - active_students,
    })
