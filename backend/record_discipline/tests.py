from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import DisciplineType
from .serializer import DisciplineTypeSerializer

class DisciplineTypeTests(TestCase):

    def test_model_prevents_positive_points(self):
        """The model should raise a ValidationError if points are >= 0"""
        discipline = DisciplineType(
            name="Late to Class",
            description="Student arrived 10 mins late",
            points=10,  # Invalid: Positive
            tag="Attendance"
        )
        with self.assertRaises(ValidationError):
            discipline.full_clean()  # full_clean triggers validators

    def test_serializer_prevents_positive_points(self):
        """The serializer should be invalid if points are >= 0"""
        data = {
            "name": "Disruption",
            "description": "Talking during exam",
            "points": 5,  # Invalid: Positive
            "tag": "Behavior"
        }
        serializer = DisciplineTypeSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('points', serializer.errors)

    def test_valid_negative_points(self):
        """The serializer should be valid with negative points"""
        data = {
            "name": "Skipping Class",
            "description": "Unexcused absence",
            "points": -20, # Valid
            "tag": "Attendance"
        }
        serializer = DisciplineTypeSerializer(data=data)
        self.assertTrue(serializer.is_valid())