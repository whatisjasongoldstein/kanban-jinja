from django.shortcuts import render, get_object_or_404

from .models import Board, State, Task
from .api import BoardSerializer, FullBoardSerializer


def index(request):
    boards =  BoardSerializer(Board.objects.all(), many=True).data
    return render(request, "index.html", {
        "boards": boards,
    })


def board(request, board_id):
    board = get_object_or_404(Board, id=board_id)
    return render(request, "app-board.html", {
        "board": BoardSerializer(board).data,
        "all": FullBoardSerializer(board).data,
    })