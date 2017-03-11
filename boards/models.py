import uuid
from django.core.urlresolvers import reverse
from django.db import models
from django.conf import settings


class Board(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    datetime_created = models.DateTimeField(auto_now_add=True)
    datetime_updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("board", kwargs={"board_id": str(self.id) })


class State(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    datetime_created = models.DateTimeField(auto_now_add=True)
    datetime_updated = models.DateTimeField(auto_now=True)
    board = models.ForeignKey(Board)
    name = models.CharField(max_length=255)
    position = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


class Task(models.Model):
    name = models.CharField(max_length=512)
    datetime_created = models.DateTimeField(auto_now_add=True)
    datetime_updated = models.DateTimeField(auto_now=True)
    description = models.TextField(default="", blank=True)
    state = models.ForeignKey(State, null=True)
    position = models.PositiveIntegerField(default=0)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True,
        related_name="assigned_tasks")
    creator = models.ForeignKey(settings.AUTH_USER_MODEL,
        related_name="created_tasks")

    def __str__(self):
        return self.name

