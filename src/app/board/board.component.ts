import { Component, OnInit } from '@angular/core';

import { Piece, PieceColor, PieceType } from '../piece';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  board: Piece[][] = new Array(8).fill(undefined)
    .map(() =>
      new Array(8).fill(undefined)
    );


  resetBoard(): void {
    this.board[0][0] = new Piece(PieceColor.WHITE, PieceType.PAWN);
    this.board[1][0] = new Piece(PieceColor.WHITE, PieceType.KNIGHT);
    this.board[2][0] = new Piece(PieceColor.WHITE, PieceType.BISHOP);
    this.board[3][0] = new Piece(PieceColor.WHITE, PieceType.ROOK);
    this.board[4][0] = new Piece(PieceColor.WHITE, PieceType.QUEEN);
    this.board[5][0] = new Piece(PieceColor.WHITE, PieceType.KING);

    this.board[0][1] = new Piece(PieceColor.BLACK, PieceType.PAWN);
    this.board[1][1] = new Piece(PieceColor.BLACK, PieceType.KNIGHT);
    this.board[2][1] = new Piece(PieceColor.BLACK, PieceType.BISHOP);
    this.board[3][1] = new Piece(PieceColor.BLACK, PieceType.ROOK);
    this.board[4][1] = new Piece(PieceColor.BLACK, PieceType.QUEEN);
    this.board[5][1] = new Piece(PieceColor.BLACK, PieceType.KING);
  }

  ngOnInit(): void {
    this.resetBoard();
  }

  getPos() {
    console.log("pos");
  }
}
