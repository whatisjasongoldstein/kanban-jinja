from rest_framework import serializers, viewsets
from rest_framework.routers import DefaultRouter

from .models import Board, State, Task


class BoardSerializer(serializers.ModelSerializer):
    url = serializers.CharField(source='get_absolute_url', read_only=True)

    class Meta:
        model = Board
        fields = ("name", "id", "url", )


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = (
            "id",
            "name",
            "description",
            "state",
            "position",
        )


class StateSerializer(serializers.ModelSerializer):
    url = serializers.CharField(source='get_absolute_url', read_only=True)
    tasks = TaskSerializer(many=True, read_only=True, source="task_set")

    class Meta:
        model = State
        fields = ("id", 'url', "board", "name", "position", "tasks", )


class FullBoardSerializer(serializers.ModelSerializer):
    url = serializers.CharField(source='get_absolute_url', read_only=True)
    states = StateSerializer(many=True, source='state_set')

    class Meta:
        model = Board
        fields = ("name", "id", "url", "states")
        depth = 3

