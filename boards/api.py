from rest_framework import serializers

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
            "name",
            "description",
            "state",
            "position",
        )


class StateSerializer(serializers.ModelSerializer):
    url = serializers.CharField(source='get_absolute_url', read_only=True)
    task_set = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = State
        fields = ("id", 'url', "board", "name", "position", "task_set", )


class FullBoardSerializer(serializers.ModelSerializer):
    url = serializers.CharField(source='get_absolute_url', read_only=True)
    state_set = StateSerializer(many=True)

    class Meta:
        model = Board
        fields = ("name", "id", "url", "state_set", )
        depth = 3
