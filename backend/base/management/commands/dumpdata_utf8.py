from django.core.management.base import BaseCommand
from django.core.management import call_command
import io

DUMMY_DATA_FILEDIR = "fixture/dummydata.json"

class Command(BaseCommand):
    help = 'Dump data with UTF-8 encoding'

    def handle(self, *args, **options):
        with io.open(DUMMY_DATA_FILEDIR, 'w', encoding='utf-8') as f:
            call_command('dumpdata', indent=2, stdout=f)
        self.stdout.write(self.style.SUCCESS('Data exported successfully in UTF-8!'))
