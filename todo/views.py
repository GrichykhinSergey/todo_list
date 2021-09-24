from django.template.loader import render_to_string
from rest_framework.renderers import StaticHTMLRenderer
from rest_framework.views import APIView
from .models import Task
from rest_framework import generics
from todo.serializers import TaskSerializer
from rest_framework.response import Response
import json


class MainPageView(generics.RetrieveAPIView):
    renderer_classes = [StaticHTMLRenderer]

    def get(self, request, *args, **kwargs):
        data = render_to_string('index.html')
        return Response(data)


class AllItemsView(APIView):
    def patch(self, request):
        data = request.data
        task = Task.objects.get(id=data['id'])
        serializer = TaskSerializer(instance=task, data=data)
        if serializer.is_valid():
            serializer.save()
        if request.path == '/edit_item/':
            return Response(serializer.data)
        return Response({'result': 'success'})

    def post(self, request):
        data = request.data
        serializer = TaskSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        return Response(serializer.data)

    def get(self, request):
        queryset = Task.objects.all().order_by('id')
        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data)

    def delete(self, request):
        data = json.loads(request.body)

        if request.path == '/delete_item/':
            item_to_delete = Task.objects.get(id=data['id'])
            item_to_delete.delete()
            return Response({'result': 'success'})
        elif request.path == '/clear_completed_tasks/':
            completed_items = Task.objects.filter(completed=True)
            completed_items.delete()
            return Response({'result': 'success'})
