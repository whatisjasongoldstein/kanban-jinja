from rest_framework import serializers

from .models import Board, State, Task

class BoardSerializer(serializers.ModelSerializer):
    url = serializers.CharField(source='get_absolute_url', read_only=True)

    class Meta:
        model = Board
        fields = ("name", "id", "url", )