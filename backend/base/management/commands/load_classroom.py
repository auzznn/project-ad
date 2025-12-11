import json
from pathlib import Path # Used for cleaner file path handling
from django.core.management.base import BaseCommand
from django.conf import settings
from authentication.models import Classroom # Adjust 'schools' to your app name

# Determine the path to the JSON file
# Assuming the file is named 'classroom_data_simple.json' in the project root
JSON_FILE_NAME = 'classroom_data_simple.json'
JSON_FILE_PATH = Path(settings.BASE_DIR) / 'fixture' / JSON_FILE_NAME

class Command(BaseCommand):
    """
    Django management command to load simple classroom data (Grade + Section) 
    from a JSON file.
    Usage: python manage.py load_simple_classrooms
    """
    help = f'Loads initial classroom data from {JSON_FILE_NAME} into the database.'

    def handle(self, *args, **options):
        if not JSON_FILE_PATH.exists():
            self.stderr.write(self.style.ERROR(f'JSON file not found at: {JSON_FILE_PATH}'))
            return

        try:
            with open(JSON_FILE_PATH, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            classroom_list = data.get('classroom_data', [])

            if not classroom_list:
                self.stdout.write(self.style.WARNING("JSON file is empty or missing 'classroom_data' key. No data loaded."))
                return

            self.stdout.write(self.style.SUCCESS(f"Attempting to load {len(classroom_list)} classrooms..."))
            
            created_count = 0
            skipped_count = 0

            for item in classroom_list:
                try:
                    # Create a new Classroom object or get an existing one
                    classroom, created = Classroom.objects.get_or_create(
                        grade=item['grade'],
                        class_section=item['class_section'],
                    )
                    
                    if created:
                        created_count += 1
                    else:
                        skipped_count += 1

                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error processing item {item}: {e}"))
            
            self.stdout.write(self.style.SUCCESS('--- Load Complete ---'))
            self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} new classrooms.'))
            self.stdout.write(self.style.WARNING(f'Skipped {skipped_count} classrooms (already existed).'))

        except json.JSONDecodeError:
            self.stderr.write(self.style.ERROR('Error decoding JSON file. Check for syntax errors.'))
        except KeyError as e:
            # Note: This will catch errors if 'grade', 'section', or 'class_name' are missing in the JSON.
            self.stderr.write(self.style.ERROR(f"Missing required key in JSON data: {e}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An unexpected error occurred: {e}"))