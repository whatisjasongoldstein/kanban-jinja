from django.shortcuts import render, get_object_or_404

from .models import Board, State, Task


def index(request):
    return render(request, "index.html", {
        "boards": Board.objects.all(),
    })


def board(request, board_id):
    board = get_object_or_404(Board, id=board_id)
    return render(request, "app-board.html", {
        "board": board,
    })