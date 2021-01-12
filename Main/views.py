from django.shortcuts import render
from .models import Object

# Create your views here.

def get_objects(request):
    context = {
        'objects' : Object.nodes.all()
    }
    return render(request, 'objects.html', context)