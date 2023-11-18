import { Component, OnInit } from '@angular/core';
import { Piece } from '../piece';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  board: number[][] = new Array(8).fill(0)
    .map(() =>
      new Array(8).fill(0)
    );
  
  boardCoordinates: string[][] = [
    ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"],
    ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"],
    ["a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6"],
    ["a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5"],
    ["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"],
    ["a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3"],
    ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"],
    ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]
  ];

  selectedPiece: number = 0b00000;

  mouseLeft: number = 0;
  mouseTop: number = 0;

  //       8          16             1           2             3             4           5            6
  // 0b - 01 (white), 10 (black) - 001 (pawn), 010 (knight), 011 (bishop), 100 (rook), 101 (queen), 110 (king)

  ngOnInit() {
    this.resetBoard();
  }

  resetBoard() {
    this.board[0][0] = 0b10100;
    this.board[0][1] = 0b10010;
    this.board[0][2] = 0b10011;
    this.board[0][3] = 0b10101;
    this.board[0][4] = 0b10110;
    this.board[0][5] = 0b10011;
    this.board[0][6] = 0b10010;
    this.board[0][7] = 0b10100;

    for (let i = 0; i < 8; i++) {
      this.board[1][i] = 0b10001;
    }

    for (let i = 0; i < 8; i++) {
      this.board[6][i] = 0b01001;
    }

    this.board[7][0] = 0b01100;
    this.board[7][1] = 0b01010;
    this.board[7][2] = 0b01011;
    this.board[7][3] = 0b01101;
    this.board[7][4] = 0b01110;
    this.board[7][5] = 0b01011;
    this.board[7][6] = 0b01010;
    this.board[7][7] = 0b01100;
  }

  getPieceSVGUrl(id: number): string {
    return `../../assets/pieces/bitwise/${id}.svg`;
  }

  getMouseCoordinates(event: MouseEvent) {
    this.mouseLeft = event.clientX - 50;
    this.mouseTop = event.clientY - 50;
  }

  getBoardCoordinate(y: number, x: number): string {
    return this.boardCoordinates[y][x];
  }

  selectPiece(id: number, y: number, x: number) {
    if (this.selectedPiece === 0b00000) {
      this.selectedPiece = id;
      this.board[y][x] = 0b00000;

      console.log(`Selected ${(this.selectedPiece >>> 0).toString(2)} (ID=${this.selectedPiece}) piece from ${this.getBoardCoordinate(y, x)} (${x}, ${y})`);
    }
  }

  placeSelectedPiece(y: number, x: number) {
    if (this.board[y][x] === 0b00000 && this.selectedPiece !== 0b00000) {
      this.board[y][x] = this.selectedPiece;

      console.log(`Placed ${(this.selectedPiece >>> 0).toString(2)} (ID=${this.selectedPiece}) piece to ${this.getBoardCoordinate(y, x)} (${x}, ${y})`);
      
      this.selectedPiece = 0b00000;
    }
  }
}
