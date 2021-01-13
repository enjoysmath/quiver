from django.urls import path
from .views import *


urlpatterns = [
    path('objects/', get_objects, name='list_objects'),
    path('create-test-data/', create_test_data),
    path('clear-database/', clear_database)
]