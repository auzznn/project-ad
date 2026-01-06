import pytz
from django.utils import timezone
from django.conf import settings


def set_timezone(datetime: timezone.datetime):
    tz = pytz.timezone(settings.TIME_ZONE)
    return datetime.astimezone(tz)


def default_datetime():
    today = set_timezone(timezone.now())
    return today.replace(hour=0, minute=0, second=0, microsecond=0)


def create_or_update_constant_merit_type(records, merit_model):
    for merit_id, merit_data in records.items():
        merit_model.objects.update_or_create(id=merit_id, defaults=merit_data)
