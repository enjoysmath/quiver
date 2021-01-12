from django.urls import path
from .views import get_objects


urlpatterns = [
    path('objects/', get_objects),
]