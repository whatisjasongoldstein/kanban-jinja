import json
from django.shortcuts import render, get_object_or_404
from rest_framework.renderers import JSONRenderer

from .models import Board, State, Task
from .api import BoardSerializer, FullBoardSerializer


def render_json(serialized_data):
    data = JSONRenderer().render(serialized_data.data,
        renderer_context={'indent':4})
    # For some reason JSONRenderer outputs strings
    # full of newlines. Piping it through the regular
    # json.dumps fixes it.
    return json.dumps(json.loads(data), indent=2)


def index(request):
    boards =  BoardSerializer(Board.objects.all(), many=True).data
    return render(request, "index.html", {
        "boards": boards,
    })


def board(request, board_id):
    board = get_object_or_404(Board, id=board_id)
    return render(request, "app-board.html", {
        "board": FullBoardSerializer(board).data,
        "all": render_json(FullBoardSerializer(board)),
    })