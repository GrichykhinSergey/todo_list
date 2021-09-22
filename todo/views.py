from django.template.loader import render_to_string
from django.views.generic import View
from django.http import HttpResponse, JsonResponse
from .models import Task
import json


class MainPageView(View):
    def get(self, request):
        rendered = render_to_string('index.html')
        return HttpResponse(rendered)


class AllItemsView(View):
    def patch(self, request):
        data = json.loads(request.body)

        if data.get('item_to_update'):
            item_to_update = Task.objects.get(id=int(data['id']))
            item_to_update.data = data['content']
            item_to_update.save()
            updated_item = list(Task.objects.filter(id=data['id']).values())
            return JsonResponse(updated_item[-1], safe=False)
        if data.get('to_change_state'):
            item_to_change_state = Task.objects.get(id=data['id'])
            item_to_change_state.completed = data['completed']
            item_to_change_state.save()
            return JsonResponse({'result': 'success'})

    def post(self, request):
        data = json.loads(request.body)

        if data.get('to_add'):
            new_item = Task(data=data['content'])
            new_item.save()
            item_data = list(Task.objects.order_by('id').filter(data=data['content']).values())
            return JsonResponse(item_data[-1], safe=False)
        elif data.get('to_delete'):
            item_to_delete = Task.objects.get(id=data['id'])
            item_to_delete.delete()
            return HttpResponse(data['id'])
        elif data.get('to_delete_all'):
            completed_items = Task.objects.filter(completed=True)
            completed_items.delete()
            return JsonResponse({'result': 'success'})

    def get(self, request):
        all_items = list(Task.objects.values())
        return JsonResponse(all_items, safe=False)
