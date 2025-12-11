from django.core.management.base import BaseCommand

# Import your model
from sahsiah.models import SahsiahType 
# If running outside the app directory, you might need: 
# from core.models import SahsiahType 

# --- Dummy Data ---
SAHSIAH_MERIT_DATA = [
    {
        "name": "Excellent Achievement",
        "description": "Outstanding performance in academic or extracurricular fields.",
        "points": 100,
        "tag": "Academic"
    },
    {
        "name": "Good Citizenship",
        "description": "Demonstrating exemplary respect, cooperation, and helpfulness to peers and staff.",
        "points": 75,
        "tag": "Discipline"
    },
    {
        "name": "Consistent Effort",
        "description": "Showing sustained commitment and hard work in assignments and attendance.",
        "points": 50,
        "tag": "Discipline"
    },
    {
        "name": "Minor Positive Action",
        "description": "Small acts of kindness, responsibility, or adherence to rules.",
        "points": 25,
        "tag": "Discipline"
    },
]

class Command(BaseCommand):
    """
    Loads 12 dummy student users from a JSON file into the User and UserProfile models.
    Usage: python manage.py load_dummy_students
    """

    def handle(self, *args, **options):
      """
      Loads initial SahsiahType data into the database.
      It checks for existing records based on the 'tag' to prevent duplicates.
      """
      print("Starting SahsiahType data seeding...")
      
      # Track created and skipped objects
      created_count = 0
      skipped_count = 0

      for data in SAHSIAH_MERIT_DATA:
          # Use get_or_create to prevent creating duplicates based on the unique 'tag'
          # A tag is a good candidate for a unique identifier in this context.
          obj, created = SahsiahType.objects.get_or_create(
              tag=data['tag'],
              name=data['name'],
              description=data['description'],
              points=data['points'],
          )

          if created:
              print(f"Created: SahsiahType '{data['name']}' (Tag: {data['tag']})")
              created_count += 1
          else:
              print(f"Skipped: SahsiahType '{data['name']}' already exists (Tag: {data['tag']})")
              skipped_count += 1

      print(f"\n--- Seeding Complete ---")
      print(f"Total Records Processed: {len(SAHSIAH_MERIT_DATA)}")
      print(f"Records Created: {created_count}")
      print(f"Records Skipped: {skipped_count}")