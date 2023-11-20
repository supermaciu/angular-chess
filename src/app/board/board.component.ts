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

  playerTurnColor: number = 0b01000;

  moves: Move[] = [];

  selectedPiece?: Piece | undefined = undefined;
  selectedPieceMove: Move = {
    from: "",
    to: ""
  };

  previousTile?: Tile | undefined = undefined;
  previousClickedTile?: Tile | undefined = undefined;

  selectedPieceLegalTiles: Tile[] = [];

  mouseLeft!: number;
  mouseTop!: number;

  // :The queen is worth 900, 1 queen = 9 pawns
  // :Each rook is worth 500; 
  // :Each knight is worth 300; 
  // :Each bishop is worth 300; 
  // :Each pawn is worth 100 centipawns.

  // WIN/LOSE:
  // Checkmate-------------------------------------------------------
  // One of the most common ways to end a chess game is by checkmate. This happens when one of the players
  // is threatening the other king and it cannot move to any other squares, cannot be protected by another 
  // piece and the checking piece cannot be captured.

  // If all of these conditions are met, the attacking player wins via checkmate.

  // Resignation-----------------------------------

  // Timeout (timer implementation) -------------------------------

  // DRAW:
  // Stalemate-----------------
  // -king is not in check and there are no other pieces on the board
  // -https://www.chess.com/article/view/stalemate-chess
  // -Insufficient material
  // -https://www.chess.com/article/view/how-chess-games-can-end-8-ways-explained
  // -50 move rule - The 50 move-rule allows either player to claim a draw if no capture has been made or no pawn has been moved in the last 50 moves.
  // -repetition - The threefold-repetition rule says that if a position arises three times in a game, either player can claim a draw during that position
  // -agreement from both players

  //TODO: CHECKMATE !!!!!!!!!!!!!!!!!!

  ngOnInit() {
    this.resetBoard();

    console.log(this.board);
  }

  noDrag(event: Event) {
    event.preventDefault();
  }

  resetBoard() {
    // this.board[0][0].piece = new Piece(0b10100);
    // this.board[0][1].piece = new Piece(0b10010);
    // this.board[0][2].piece = new Piece(0b10011);
    // this.board[0][3].piece = new Piece(0b10101);
    // this.board[0][4].piece = new Piece(0b10110);
    // this.board[0][5].piece = new Piece(0b10011);
    // this.board[0][6].piece = new Piece(0b10010);
    // this.board[0][7].piece = new Piece(0b10100);

    // for (let i = 0; i < 8; i++) {
    //   this.board[1][i].piece = new Piece(0b10001);
    // }

    // for (let i = 0; i < 8; i++) {
    //   this.board[6][i].piece = new Piece(0b01001);
    // }

    // this.board[7][0].piece = new Piece(0b01100);
    // this.board[7][1].piece = new Piece(0b01010);
    // this.board[7][2].piece = new Piece(0b01011);
    // this.board[7][3].piece = new Piece(0b01101);
    // this.board[7][4].piece = new Piece(0b01110);
    // this.board[7][5].piece = new Piece(0b01011);
    // this.board[7][6].piece = new Piece(0b01010);
    // this.board[7][7].piece = new Piece(0b01100);

    this.board[7][4].piece = new Piece(0b01110);
    this.board[6][4].piece = new Piece(0b01001);

    this.board[7][0].piece = new Piece(0b01100);
    this.board[7][7].piece = new Piece(0b01100);
  }

  getTile(x: number, y: number): Tile {
    return this.board[y][x];
  }

  setTile(x: number, y: number, tile: Tile) {
    this.board[y][x] = tile;
  }

  getMouseCoordinates(event: MouseEvent) {
    this.mouseLeft = event.clientX - 50;
    this.mouseTop = event.clientY - 50;
  }

  selectPiece(clickedTile: Tile) {
    if (this.selectedPiece === undefined && clickedTile.piece !== undefined && (clickedTile.piece.id & 0b11000) === this.playerTurnColor) {
      this.selectedPiece = clickedTile.piece;
      clickedTile.erasePiece();

      clickedTile.availableMove = true;

      if (this.previousTile !== undefined) this.previousTile.highlighted = false;
      if (this.previousClickedTile !== undefined) this.previousClickedTile.highlighted = false;

      this.previousTile = clickedTile;
      this.selectedPieceMove.from = clickedTile.coordinate;

      // legal, no collision checking moves
      // TODO: move this to Tile class, because evaluation is being done every time piece is selected, make a Board class to be able to import it anywhere
      switch (this.selectedPiece!.id & 0b00111) { // type
        case 0b00001: { // pawn
          let delta = ((this.selectedPiece!.id & 0b11000) == 0b01000) ? -1 : 1; // depends on color
          if (clickedTile.y+delta >= 0 && clickedTile.y+delta <= 7 && this.getTile(clickedTile.x, clickedTile.y+delta).piece === undefined) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y+delta));
          if (clickedTile.y+2*delta >= 0 && clickedTile.y+2*delta <= 7 && !this.selectedPiece!.touched && this.getTile(clickedTile.x, clickedTile.y+delta).piece === undefined) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y+2*delta));

          if (clickedTile.x-1 >= 0 && clickedTile.y+delta >= 0 && clickedTile.y+delta <= 7 && this.getTile(clickedTile.x-1, clickedTile.y+delta).piece !== undefined) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y+delta));
          if (clickedTile.x+1 <= 7 && clickedTile.y+delta >= 0 && clickedTile.y+delta <= 7 && this.getTile(clickedTile.x+1, clickedTile.y+delta).piece !== undefined) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y+delta));

          // en passant
          if (clickedTile.x-1 >= 0 && this.getTile(clickedTile.x-1, clickedTile.y+delta).piece === undefined && this.getTile(clickedTile.x-1, clickedTile.y).piece !== undefined && this.getTile(clickedTile.x-1, clickedTile.y).piece!.enpassantable == true) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y+delta));
            this.getTile(clickedTile.x-1, clickedTile.y+delta).fnCallWhenPiecePlaced = () => {
              this.getTile(clickedTile.x-1, clickedTile.y).erasePiece();
            }
          } 
          if (clickedTile.x+1 <= 7 && this.getTile(clickedTile.x+1, clickedTile.y+delta).piece === undefined && this.getTile(clickedTile.x+1, clickedTile.y).piece !== undefined && this.getTile(clickedTile.x+1, clickedTile.y).piece!.enpassantable == true) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y+delta));
            this.getTile(clickedTile.x+1, clickedTile.y+delta).fnCallWhenPiecePlaced = () => {
              this.getTile(clickedTile.x+1, clickedTile.y).erasePiece();
            }
          }

          // TODO: promotion
          break;
        }

        case 0b00010: { // knight
          if (clickedTile.x-1 >= 0 && clickedTile.y+2 >= 0 && clickedTile.x-1 <= 7 && clickedTile.y+2 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y+2));
          if (clickedTile.x+1 >= 0 && clickedTile.y+2 >= 0 && clickedTile.x+1 <= 7 && clickedTile.y+2 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y+2));

          if (clickedTile.x+2 >= 0 && clickedTile.y+1 >= 0 && clickedTile.x+2 <= 7 && clickedTile.y+1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+2, clickedTile.y+1));
          if (clickedTile.x+2 >= 0 && clickedTile.y-1 >= 0 && clickedTile.x+2 <= 7 && clickedTile.y-1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+2, clickedTile.y-1));

          if (clickedTile.x-1 >= 0 && clickedTile.y-2 >= 0 && clickedTile.x-1 <= 7 && clickedTile.y-2 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y-2));
          if (clickedTile.x+1 >= 0 && clickedTile.y-2 >= 0 && clickedTile.x+1 <= 7 && clickedTile.y-2 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y-2));

          if (clickedTile.x-2 >= 0 && clickedTile.y+1 >= 0 && clickedTile.x-2 <= 7 && clickedTile.y+1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-2, clickedTile.y+1));
          if (clickedTile.x-2 >= 0 && clickedTile.y-1 >= 0 && clickedTile.x-2 <= 7 && clickedTile.y-1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-2, clickedTile.y-1));
          break;
        }

        case 0b00011: { // bishop
          for (let i = 1; i <= Math.min(clickedTile.x, clickedTile.y); i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-i, clickedTile.y-i));
            if (this.getTile(clickedTile.x-i, clickedTile.y-i).piece !== undefined) break;
          }
          for (let i = 1; i <= Math.min(7 - clickedTile.x, clickedTile.y); i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+i, clickedTile.y-i));
            if (this.getTile(clickedTile.x+i, clickedTile.y-i).piece !== undefined) break;
          }
          for (let i = 1; i <= Math.min(7 - clickedTile.x, 7 - clickedTile.y); i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+i, clickedTile.y+i));
            if (this.getTile(clickedTile.x+i, clickedTile.y+i).piece !== undefined) break;
          }
          for (let i = 1; i <= Math.min(clickedTile.x, 7 - clickedTile.y); i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-i, clickedTile.y+i));
            if (this.getTile(clickedTile.x-i, clickedTile.y+i).piece !== undefined) break;
          }
          break;
        }

        case 0b00100: { // rook
          for (let i = 1; i <= clickedTile.y; i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y-i));
            if (this.getTile(clickedTile.x, clickedTile.y-i).piece !== undefined) break;
          }
          for (let i = 1; i <= 7 - clickedTile.x; i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+i, clickedTile.y));
            if (this.getTile(clickedTile.x+i, clickedTile.y).piece !== undefined) break;
          }
          for (let i = 1; i <= 7 - clickedTile.y; i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y+i));
            if (this.getTile(clickedTile.x, clickedTile.y+i).piece !== undefined) break;
          }
          for (let i = 1; i <= clickedTile.x; i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-i, clickedTile.y));
            if (this.getTile(clickedTile.x-i, clickedTile.y).piece !== undefined) break;
          }
          break;
        }

        case 0b00101: { // queen
          for (let i = 1; i <= Math.min(clickedTile.x, clickedTile.y); i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-i, clickedTile.y-i));
            if (this.getTile(clickedTile.x-i, clickedTile.y-i).piece !== undefined) break;
          }
          for (let i = 1; i <= Math.min(7 - clickedTile.x, clickedTile.y); i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+i, clickedTile.y-i));
            if (this.getTile(clickedTile.x+i, clickedTile.y-i).piece !== undefined) break;
          }
          for (let i = 1; i <= Math.min(7 - clickedTile.x, 7 - clickedTile.y); i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+i, clickedTile.y+i));
            if (this.getTile(clickedTile.x+i, clickedTile.y+i).piece !== undefined) break;
          }
          for (let i = 1; i <= Math.min(clickedTile.x, 7 - clickedTile.y); i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-i, clickedTile.y+i));
            if (this.getTile(clickedTile.x-i, clickedTile.y+i).piece !== undefined) break;
          }

          for (let i = 1; i <= clickedTile.y; i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y-i));
            if (this.getTile(clickedTile.x, clickedTile.y-i).piece !== undefined) break;
          }
          for (let i = 1; i <= 7 - clickedTile.x; i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+i, clickedTile.y));
            if (this.getTile(clickedTile.x+i, clickedTile.y).piece !== undefined) break;
          }
          for (let i = 1; i <= 7 - clickedTile.y; i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y+i));
            if (this.getTile(clickedTile.x, clickedTile.y+i).piece !== undefined) break;
          }
          for (let i = 1; i <= clickedTile.x; i++) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-i, clickedTile.y));
            if (this.getTile(clickedTile.x-i, clickedTile.y).piece !== undefined) break;
          }
          break;
        }

        case 0b00110: { //king
          if (clickedTile.y-1 >= 0) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y-1));
          if (clickedTile.x+1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y));
          if (clickedTile.y+1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y+1));
          if (clickedTile.x-1 >= 0) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y));

          if (clickedTile.x-1 >= 0 && clickedTile.y-1 >= 0) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y-1));
          if (clickedTile.x-1 >= 0 && clickedTile.y+1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y+1));
          if (clickedTile.x+1 <= 7 && clickedTile.y+1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y+1));
          if (clickedTile.x+1 <= 7 && clickedTile.y-1 >= 0) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y-1));
          
          // TODO: castling, king cant be checked
          if (!this.selectedPiece.touched) {
            if (this.playerTurnColor === 0b01000) {
              let rook1Tile = this.getTile(0, 7);
              let rook2Tile = this.getTile(7, 7);

              if (rook1Tile.piece !== undefined && !rook1Tile.piece.touched) {
                this.selectedPieceLegalTiles.push(rook1Tile);
                rook1Tile.piece.castlingable = true;
              }
              if (rook2Tile.piece !== undefined && !rook2Tile.piece.touched) {
                this.selectedPieceLegalTiles.push(rook2Tile);
                rook2Tile.piece.castlingable = true;
              }
            }
          }
        }
      }

      this.selectedPieceLegalTiles = this.selectedPieceLegalTiles.filter((value) => {
        return value.piece === undefined || (value.piece.id & 0b11000) !== this.playerTurnColor || value.piece.castlingable;
      });

      this.selectedPieceLegalTiles.push(clickedTile); // origin

      for (let tile of this.selectedPieceLegalTiles) {
        tile.availableMove = true;
      }
    }
  }

  placeSelectedPiece(clickedTile: Tile) {
    if (this.selectedPiece !== undefined) {

      if (!this.selectedPieceLegalTiles.includes(clickedTile)) return;

      clickedTile.setPiece(this.selectedPiece);

      this.selectedPieceMove.to = clickedTile.coordinate;

      this.previousTile!.availableMove = false;

      for (let tile of this.selectedPieceLegalTiles) {
        tile.availableMove = false;
      }
      this.selectedPieceLegalTiles.splice(0);

      if (clickedTile !== this.previousTile) {
        this.previousTile!.highlighted = true;
        clickedTile.highlighted = true;

        if ((this.selectedPiece.id & 0b00111) == 0b00001) {
          if (!this.selectedPiece.touched && Math.abs(this.previousTile!.y - clickedTile.y) == 2) {
            this.selectedPiece.enpassantable = true;
          } else {
            this.selectedPiece.enpassantable = false;
          }
        }

        this.selectedPiece.touched = true;
        this.moves.push({...this.selectedPieceMove});

        // this.playerTurnColor = (this.playerTurnColor == 0b01000) ? 0b10000 : 0b01000;

        console.log(`${PIECECOLORS[(this.selectedPiece!.id & 0b11000)]} ${PIECETYPES[(this.selectedPiece!.id & 0b00111)]} ${this.selectedPieceMove.from}${this.selectedPieceMove.to} (${clickedTile.x}, ${clickedTile.y})`);
      }

      this.selectedPiece = undefined;

      this.previousClickedTile = clickedTile;
    }
  }

  attackPiece(clickedTile: Tile) {
    // attacking, capturing
    if (this.selectedPieceLegalTiles.includes(clickedTile)) {
      if (this.selectedPiece !== undefined && clickedTile.piece !== undefined && this.selectedPieceMove.from !== clickedTile.coordinate) {
        if ((clickedTile.piece.id & 0b11000) !== this.playerTurnColor) {
          console.log(`${PIECECOLORS[(clickedTile.piece.id & 0b11000)]} ${PIECETYPES[(clickedTile.piece.id & 0b00111)]} attacked by ${PIECECOLORS[(this.selectedPiece.id & 0b11000)]} ${PIECETYPES[(this.selectedPiece.id & 0b00111)]} on ${BOARDCOORDINATES[clickedTile.y][clickedTile.x]} (${clickedTile.x}, ${clickedTile.y})`);
          
          clickedTile.erasePiece();
          this.placeSelectedPiece(clickedTile);
        }
      }
    }
  }

  castlingKing(clickedTile: Tile) {
    
  }
}
