import { Component, OnInit } from '@angular/core';

import { Piece } from '../piece';

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

  ngOnInit(): void {
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[i].length; j++) {
        if (i == 0) {
          if (j == 0 || j == this.board.length-1) {
            this.board[i][j] = new Piece("rook", "b");
          } else if (j == 1 || j == this.board.length-2) {
            this.board[i][j] = new Piece("knight", "b");
          } else if (j == 2 || j == this.board.length-3) {
            this.board[i][j] = new Piece("bishop", "b");
          } else if (j == 3) {
            this.board[i][j] = new Piece("queen", "b");
          } else if (j == 4) {
            this.board[i][j] = new Piece("king", "b");
          }
        } else if (i == 1) {
          this.board[i][j] = new Piece("pawn", "b");
        } else if (i == this.board.length-2) {
          this.board[i][j] = new Piece("pawn", "w");
        } else if (i == this.board.length-1) {
          if (j == 0 || j == this.board.length-1) {
            this.board[i][j] = new Piece("rook", "w");
          } else if (j == 1 || j == this.board.length-2) {
            this.board[i][j] = new Piece("knight", "w");
          } else if (j == 2 || j == this.board.length-3) {
            this.board[i][j] = new Piece("bishop", "w");
          } else if (j == 3) {
            this.board[i][j] = new Piece("queen", "w");
          } else if (j == 4) {
            this.board[i][j] = new Piece("king", "w");
          }
        }
      }
    }
  }
}
