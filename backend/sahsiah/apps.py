from django.apps import AppConfig
from django.db.models.signals import post_migrate

from base.utils import create_constant_merit_type

from . import const


class SahsiahConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "sahsiah"

    def ready(self):
        post_migrate.connect(create_or_update_constant_sahsiah_type, sender=self)


def create_or_update_constant_sahsiah_type(sender, **kwargs):
    from .models import SahsiahType

    create_constant_merit_type(
        records=const.CONSTANT_SAHSIAH_TYPE_INFORMATION, merit_model=SahsiahType
    )
