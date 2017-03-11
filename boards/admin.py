from django.contrib import admin

from .models import Board, Task, State


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    pass


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ["name", "board", "position"]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["name", "state", "position"]

