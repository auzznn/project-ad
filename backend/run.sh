#!/bin/bash

python manage.py makemigrations
python manage.py migrate
python manage.py loaddata fixture/dummydata.json
python manage.py runserver 0.0.0.0:8080
