import { Component, OnInit } from '@angular/core';
import { BOARDCOORDINATES, Tile } from '../tile';
import { PIECECOLORS, PIECETYPES, Piece } from '../piece';
import { Move } from '../move';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  board: Tile[][] = new Array(8).fill(undefined)
  .map((value_y, index_y, array_y) =>
    new Array(8).fill(undefined)
    .map((value_x, index_x, array_x) =>
      value_x = new Tile(index_x, index_y)
    )
  );

  moves: Move[] = [];

  selectedPiece?: Piece | undefined = undefined;
  selectedPieceMove: Move = {
    from: "",
    to: ""
  };

  mouseLeft!: number;
  mouseTop!: number;

  ngOnInit() {
    this.resetBoard();

    console.log(this.board);
  }

  resetBoard() {
    this.board[0][0].piece = new Piece(0b10100);
    this.board[0][1].piece = new Piece(0b10010);
    this.board[0][2].piece = new Piece(0b10011);
    this.board[0][3].piece = new Piece(0b10101);
    this.board[0][4].piece = new Piece(0b10110);
    this.board[0][5].piece = new Piece(0b10011);
    this.board[0][6].piece = new Piece(0b10010);
    this.board[0][7].piece = new Piece(0b10100);

    for (let i = 0; i < 8; i++) {
      this.board[1][i].piece = new Piece(0b10001);
    }

    for (let i = 0; i < 8; i++) {
      this.board[6][i].piece = new Piece(0b01001);
    }

    this.board[7][0].piece = new Piece(0b01100);
    this.board[7][1].piece = new Piece(0b01010);
    this.board[7][2].piece = new Piece(0b01011);
    this.board[7][3].piece = new Piece(0b01101);
    this.board[7][4].piece = new Piece(0b01110);
    this.board[7][5].piece = new Piece(0b01011);
    this.board[7][6].piece = new Piece(0b01010);
    this.board[7][7].piece = new Piece(0b01100);
  }

  getMouseCoordinates(event: MouseEvent) {
    this.mouseLeft = event.clientX - 50;
    this.mouseTop = event.clientY - 50;
  }

  selectPiece(tile: Tile) {
    if (this.selectedPiece === undefined) {
      this.selectedPiece = tile.piece;
      tile.erasePiece();

      this.selectedPieceMove.from = tile.coordinate;

      console.log(`Selected ${PIECECOLORS[(this.selectedPiece!.id & 0b11000)]} ${PIECETYPES[(this.selectedPiece!.id & 0b00111)]} (${this.selectedPiece!.id.toString(2)}) from ${BOARDCOORDINATES[tile.x][tile.y]}`);
    }
  }

  placeSelectedPiece(tile: Tile) {
    if (this.selectedPiece !== undefined) {
      tile.setPiece(this.selectedPiece);

      console.log(`Placed ${PIECECOLORS[(this.selectedPiece!.id & 0b11000)]} ${PIECETYPES[(this.selectedPiece!.id & 0b00111)]} (${this.selectedPiece!.id.toString(2)}) to ${BOARDCOORDINATES[tile.x][tile.y]}`);
      this.selectedPieceMove.to = tile.coordinate;

      this.moves.push({...this.selectedPieceMove});
      console.log(this.moves);

      this.selectedPiece = undefined;
    }
  }

  test(tile: Tile) {
    tile.highlighted = true;
  }
}
