from django.db import models


class Task(models.Model):
    data = models.TextField()
    completed = models.BooleanField(default=False)
