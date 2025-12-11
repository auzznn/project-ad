import json
import random
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction

# IMPORTANT: Import your models correctly
from authentication.models import MyUser, Classroom, Student 
# Replace 'your_app_name' with the actual name of your Django app

# --- DATA FILES (Assuming they are in the project root) ---
CLASSROOM_JSON_FILE = 'classroom_data.json'
USERS_JSON_FILE = 'dummy_users.json'

CLASSROOM_FILE_PATH = Path(settings.BASE_DIR) / CLASSROOM_JSON_FILE
USERS_FILE_PATH = Path(settings.BASE_DIR) / USERS_JSON_FILE

class Command(BaseCommand):
    """
    Loads Classroom data and Student data, then assigns 2 students per class 
    to the first 6 created classrooms.
    """
    help = 'Loads initial classroom and student data, ensuring 2 students per assigned class.'

    def _load_json_data(self, file_path):
        """Helper to load JSON data."""
        if not file_path.exists():
            raise FileNotFoundError(f"JSON file not found at: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    @transaction.atomic
    def handle(self, *args, **options):
        """ self.stdout.write(self.style.NOTICE("--- Starting School Data Load and Assignment ---"))

        # --- STEP 1: LOAD CLASSROOMS ---
        self.stdout.write(self.style.HTTP_INFO("1. Loading Classroom Data..."))
        
        try:
            classroom_data = self._load_json_data(CLASSROOM_FILE_PATH).get('classroom_data', [])
        except FileNotFoundError as e:
            self.stderr.write(self.style.ERROR(e))
            return
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error loading classroom JSON: {e}"))
            return

        created_classrooms = []
        for item in classroom_data:
            grade = item['grade']
            section = item['class_section']
            
            # The model has a default_section, but we explicitly use the provided 'class_section'
            classroom, created = Classroom.objects.get_or_create(
                grade=grade,
                class_section=section,
                defaults={'supervisor': f'Teacher {grade}{section}'}
            )
            if created:
                created_classrooms.append(classroom)
        
        self.stdout.write(self.style.SUCCESS(f"Loaded {Classroom.objects.count()} total Classrooms."))
        
        # --- STEP 2: LOAD USERS/STUDENTS ---
        self.stdout.write(self.style.HTTP_INFO("2. Loading Dummy Users and Student Profiles..."))

        try:
            user_list = self._load_json_data(USERS_FILE_PATH).get('dummy_users', [])
        except FileNotFoundError as e:
            self.stderr.write(self.style.ERROR(e))
            return
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error loading user JSON: {e}"))
            return
        
        created_students = []
        for item in user_list:
            username = item.get('username')
            password = item.get('password')
            role = item.get('role')

            if role != 'student':
                 self.stdout.write(self.style.WARNING(f"Skipping user {username}: role is not 'student'."))
                 continue

            try:
                # 2.1 Create MyUser (User) object
                user, created = MyUser.objects.get_or_create(
                    username=username,
                    defaults={
                        'email': item.get('email', f'{username}@dummy.com'),
                        'first_name': item.get('first_name', ''),
                        'last_name': item.get('last_name', ''),
                        'role': role,
                    }
                )
                
                if created:
                    # Set the secure hashed password
                    user.set_password(password)
                    user.save()

                    # 2.2 Create the associated Student object (auto-generates QR code on save)
                    student = Student.objects.create(user=user)
                    created_students.append(student)
                
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error processing user {username}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully created {len(created_students)} new student users.")) """

        # --- STEP 3: ASSIGN STUDENTS TO CLASSROOMS ---
        
        # We need 6 classrooms for 12 students (2 students/class)
        REQUIRED_CLASSES = 6
        created_students = Student.objects.all()
        
        if Classroom.objects.count() < REQUIRED_CLASSES:
            self.stderr.write(self.style.ERROR(f"Need at least {REQUIRED_CLASSES} classrooms for assignment, found only {Classroom.objects.count()}. Aborting assignment."))
            return
        
        # Get the classrooms to be used (first 6, ordered by grade/section name)
        # Using .order_by('grade', 'class_section') ensures we get 1A, 1B, 1C, 2A, 2B, 2C
        target_classrooms = Classroom.objects.order_by('grade', 'class_section')[:REQUIRED_CLASSES]
        
        # Pair students into groups of 2
        student_pairs = [created_students[i:i + 2] for i in range(0, len(created_students), 2)]
        
        if len(student_pairs) != REQUIRED_CLASSES:
             self.stderr.write(self.style.ERROR("Student count is not exactly 12, assignment logic might be off."))
             return

        self.stdout.write(self.style.HTTP_INFO("3. Assigning 2 Students to each of the first 6 Classrooms..."))
        
        assigned_count = 0
        for i, classroom in enumerate(target_classrooms):
            if i < len(student_pairs):
                students_to_assign = student_pairs[i]
                
                for student in students_to_assign:
                    student.class_room = classroom
                    student.save() # Save will trigger the QR code generation if needed
                    assigned_count += 1
                
                self.stdout.write(f"  -> Assigned 2 students to: {classroom}")

        self.stdout.write(self.style.SUCCESS(f"Assignment complete. Total students assigned: {assigned_count}."))
        self.stdout.write(self.style.NOTICE("--- Data Load and Assignment Finished ---"))