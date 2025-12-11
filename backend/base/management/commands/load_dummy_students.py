import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth import get_user_model
from authentication.models import MyUser # *** ADJUST APP NAME IF NECESSARY ***

# Get the active User model
User = get_user_model()

# Define file name and path
JSON_FILE_NAME = 'dummy_users_12.json'
# Use settings.BASE_DIR to locate the file safely
JSON_FILE_PATH = Path(settings.BASE_DIR) / 'fixture' / JSON_FILE_NAME

class Command(BaseCommand):
    """
    Loads 12 dummy student users from a JSON file into the User and UserProfile models.
    Usage: python manage.py load_dummy_students
    """
    help = f'Loads initial dummy student data from {JSON_FILE_NAME}.'

    def handle(self, *args, **options):
        if not JSON_FILE_PATH.exists():
            self.stderr.write(self.style.ERROR(f'JSON file not found at: {JSON_FILE_PATH}'))
            return

        try:
            with open(JSON_FILE_PATH, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            user_list = data.get('dummy_users', [])
            
            self.stdout.write(self.style.SUCCESS(f"Attempting to load {len(user_list)} dummy users..."))
            
            created_count = 0
            skipped_count = 0

            for item in user_list:
                username = item.get('username')
                email = item.get('email')
                password = item.get('password')
                role = item.get('role')

                try:
                    # 1. Check if user already exists
                    user, created = MyUser.objects.get_or_create(
                        username=username,
                        defaults={
                            'email': email,
                            'first_name': item.get('first_name', ''),
                            'last_name': item.get('last_name', ''),
                            'is_active': True,
                        }
                    )
                    
                    if created:
                        # SET THE SECURE HASHED PASSWORD
                        user.set_password(password)
                        user.role = role
                        user.save()

                        # 2. Create the associated UserProfile for the 'role'
                        created_count += 1
                        
                    else:
                        # User already exists
                        skipped_count += 1

                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error processing user {username}: {e}"))
            
            self.stdout.write(self.style.SUCCESS('--- Load Complete ---'))
            self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} new student users and profiles.'))
            self.stdout.write(self.style.WARNING(f'Skipped {skipped_count} users (already existed).'))

        except json.JSONDecodeError:
            self.stderr.write(self.style.ERROR('Error decoding JSON file. Check for syntax errors.'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An unexpected error occurred: {e}"))