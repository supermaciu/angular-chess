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

  //TODO: RESTRUCTURE BIT REPRESENTATION TO NORMAL ENUM OR INTERFACE !!!!!!!!!!!!!!!!!!!

  ngOnInit() {
    this.resetBoard();

    console.log(this.board);
  }

  noDrag(event: Event) {
    event.preventDefault();
  }

  resetBoard() {
    this.getTile(0, 0).setPiece(new Piece(PIECECOLORS.BLACK, PIECETYPES.ROOK)).castlingable = true;
    this.getTile(1, 0).setPiece(new Piece(PIECECOLORS.BLACK, PIECETYPES.KNIGHT));
    this.getTile(2, 0).setPiece(new Piece(PIECECOLORS.BLACK, PIECETYPES.BISHOP));
    this.getTile(3, 0).setPiece(new Piece(PIECECOLORS.BLACK, PIECETYPES.QUEEN));
    this.getTile(4, 0).setPiece(new Piece(PIECECOLORS.BLACK, PIECETYPES.KING));
    this.getTile(5, 0).setPiece(new Piece(PIECECOLORS.BLACK, PIECETYPES.BISHOP));
    this.getTile(6, 0).setPiece(new Piece(PIECECOLORS.BLACK, PIECETYPES.KNIGHT));
    this.getTile(7, 0).setPiece(new Piece(PIECECOLORS.BLACK, PIECETYPES.ROOK)).castlingable = true;

    for (let i = 0; i < 8; i++) {
      this.getTile(i, 1).setPiece(new Piece(PIECECOLORS.BLACK, PIECETYPES.PAWN));
    }

    for (let i = 0; i < 8; i++) {
      this.getTile(i, 6).setPiece(new Piece(PIECECOLORS.WHITE, PIECETYPES.PAWN));
    }

    this.getTile(0, 7).setPiece(new Piece(PIECECOLORS.WHITE, PIECETYPES.ROOK)).castlingable = true;
    this.getTile(1, 7).setPiece(new Piece(PIECECOLORS.WHITE, PIECETYPES.KNIGHT));
    this.getTile(2, 7).setPiece(new Piece(PIECECOLORS.WHITE, PIECETYPES.BISHOP));
    this.getTile(3, 7).setPiece(new Piece(PIECECOLORS.WHITE, PIECETYPES.QUEEN));
    this.getTile(4, 7).setPiece(new Piece(PIECECOLORS.WHITE, PIECETYPES.KING));
    this.getTile(5, 7).setPiece(new Piece(PIECECOLORS.WHITE, PIECETYPES.BISHOP));
    this.getTile(6, 7).setPiece(new Piece(PIECECOLORS.WHITE, PIECETYPES.KNIGHT));
    this.getTile(7, 7).setPiece(new Piece(PIECECOLORS.WHITE, PIECETYPES.ROOK)).castlingable = true;
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
    if (this.selectedPiece === undefined && clickedTile.piece !== undefined && clickedTile.piece.color === this.playerTurnColor) {
      this.selectedPiece = clickedTile.piece;
      clickedTile.erasePiece();

      clickedTile.availableMove = true;

      if (this.previousTile !== undefined) this.previousTile.highlighted = false;
      if (this.previousClickedTile !== undefined) this.previousClickedTile.highlighted = false;

      this.previousTile = clickedTile;
      this.selectedPieceMove.from = clickedTile.coordinate;

      // legal, no collision checking moves
      // TODO: move this to Tile class, because evaluation is being done every time piece is selected, make a Board class to be able to import it anywhere
      switch (this.selectedPiece.type) {
        case PIECETYPES.PAWN: {
          let delta = ((this.selectedPiece!.id & 0b11000) == 0b01000) ? -1 : 1; // depends on color
          if (clickedTile.y+delta >= 0 && clickedTile.y+delta <= 7 && this.getTile(clickedTile.x, clickedTile.y+delta).piece === undefined) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y+delta));
          if (clickedTile.y+2*delta >= 0 && clickedTile.y+2*delta <= 7 && !this.selectedPiece!.touched && this.getTile(clickedTile.x, clickedTile.y+delta).piece === undefined) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y+2*delta));

          if (clickedTile.x-1 >= 0 && clickedTile.y+delta >= 0 && clickedTile.y+delta <= 7 && this.getTile(clickedTile.x-1, clickedTile.y+delta).piece !== undefined) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y+delta));
          }
          if (clickedTile.x+1 <= 7 && clickedTile.y+delta >= 0 && clickedTile.y+delta <= 7 && this.getTile(clickedTile.x+1, clickedTile.y+delta).piece !== undefined) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y+delta));
          }

          // en passant
          if (clickedTile.x-1 >= 0 && this.getTile(clickedTile.x-1, clickedTile.y+delta).piece === undefined && this.getTile(clickedTile.x-1, clickedTile.y).piece !== undefined && this.getTile(clickedTile.x-1, clickedTile.y).piece!.color != this.playerTurnColor && this.getTile(clickedTile.x-1, clickedTile.y).piece!.enpassantable == true) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y+delta));
            this.getTile(clickedTile.x-1, clickedTile.y+delta).callbackPiecePlaced = () => {
              this.getTile(clickedTile.x-1, clickedTile.y).erasePiece();
            }
          } 
          if (clickedTile.x+1 <= 7 && this.getTile(clickedTile.x+1, clickedTile.y+delta).piece === undefined && this.getTile(clickedTile.x+1, clickedTile.y).piece !== undefined && this.getTile(clickedTile.x+1, clickedTile.y).piece!.color != this.playerTurnColor && this.getTile(clickedTile.x+1, clickedTile.y).piece!.enpassantable == true) {
            this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y+delta));
            this.getTile(clickedTile.x+1, clickedTile.y+delta).callbackPiecePlaced = () => {
              this.getTile(clickedTile.x+1, clickedTile.y).erasePiece();
            }
          }

          // TODO: promotion
          break;
        }

        case PIECETYPES.KNIGHT: {
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

        case PIECETYPES.BISHOP: {
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

        case PIECETYPES.ROOK: {
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

        case PIECETYPES.QUEEN: {
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

        case PIECETYPES.KING: {
          if (clickedTile.y-1 >= 0) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y-1));
          if (clickedTile.x+1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y));
          if (clickedTile.y+1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y+1));
          if (clickedTile.x-1 >= 0) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y));

          if (clickedTile.x-1 >= 0 && clickedTile.y-1 >= 0) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y-1));
          if (clickedTile.x-1 >= 0 && clickedTile.y+1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x-1, clickedTile.y+1));
          if (clickedTile.x+1 <= 7 && clickedTile.y+1 <= 7) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y+1));
          if (clickedTile.x+1 <= 7 && clickedTile.y-1 >= 0) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x+1, clickedTile.y-1));
          
          // TODO: castling: king cant be checked
          // - Neither the king nor the rook has previously moved. done
          // - There are no pieces between the king and the rook. done
          // - The king is not currently in check.
          // - The king does not pass through or finish on a square that is attacked by an enemy piece.

          // long castling / queenside
          if (!this.selectedPiece.touched) {
            let rookTile = this.getTile(0, clickedTile.y);

            let tileInBetween1 = this.getTile(1, clickedTile.y);
            let tileInBetween2 = this.getTile(2, clickedTile.y);
            let tileInBetween3 = this.getTile(3, clickedTile.y);

            if (rookTile.piece !== undefined && !rookTile.piece.touched && tileInBetween1.piece === undefined && tileInBetween2.piece === undefined && tileInBetween3.piece === undefined) {
              this.selectedPieceLegalTiles.push(rookTile);
            }
          }

          // short castling / kingside
          if (!this.selectedPiece.touched) {
            let rookTile = this.getTile(7, clickedTile.y);

            let tileInBetween1 = this.getTile(5, clickedTile.y);
            let tileInBetween2 = this.getTile(6, clickedTile.y);

            if (rookTile.piece !== undefined && !rookTile.piece.touched && tileInBetween1.piece === undefined && tileInBetween2.piece === undefined) {
              this.selectedPieceLegalTiles.push(rookTile);
            }
          }
        }
      }

      this.selectedPieceLegalTiles = this.selectedPieceLegalTiles.filter((tile) => {
        return tile.piece === undefined || tile.piece.color !== this.playerTurnColor || tile.piece.castlingable;
      });

      this.selectedPieceLegalTiles.push(clickedTile); // selectedPiece's origin

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

        if (this.selectedPiece.type == PIECETYPES.PAWN) {
          if (!this.selectedPiece.touched && Math.abs(this.previousTile!.y - clickedTile.y) == 2) {
            this.selectedPiece.enpassantable = true;
          } else {
            this.selectedPiece.enpassantable = false;
          }
        }

        this.selectedPiece.touched = true;
        this.moves.push({...this.selectedPieceMove}); // pushing copy of Move object

        this.playerTurnColor = (this.playerTurnColor == PIECECOLORS.WHITE) ? PIECECOLORS.BLACK : PIECECOLORS.WHITE;

        console.log(`${PIECECOLORS[(this.selectedPiece.color)]} ${PIECETYPES[this.selectedPiece.type]} ${this.selectedPieceMove.from} -> ${this.selectedPieceMove.to}`);
      }

      this.selectedPiece = undefined;

      this.previousClickedTile = clickedTile;
    }
  }

  attackPiece(clickedTile: Tile) {
    // attacking, capturing
    if (this.selectedPieceLegalTiles.includes(clickedTile)) {
      if (this.selectedPiece !== undefined && clickedTile.piece !== undefined && this.selectedPieceMove.from !== clickedTile.coordinate) {
        if (clickedTile.piece.color !== this.playerTurnColor) {
          console.log(`${PIECECOLORS[clickedTile.piece.color]} ${PIECETYPES[clickedTile.piece.type]} attacked by ${PIECECOLORS[this.selectedPiece.color]} ${PIECETYPES[this.selectedPiece.type]} on ${BOARDCOORDINATES[clickedTile.y][clickedTile.x]} (${clickedTile.x}, ${clickedTile.y})`);
          
          clickedTile.erasePiece();
          this.placeSelectedPiece(clickedTile);
        }
      }
    }
  }

  castlingKing(clickedTile: Tile) {
    if (this.selectedPieceLegalTiles.includes(clickedTile)) {
      if (this.selectedPiece !== undefined && this.selectedPiece.id === (this.playerTurnColor | PIECETYPES.KING) && clickedTile.piece !== undefined && clickedTile.piece.id === (this.playerTurnColor | PIECETYPES.ROOK)) {
        if (clickedTile.x == 0) { // queenside
          let newRookTile = this.getTile(clickedTile.x+3, clickedTile.y); 
          newRookTile.setPiece(clickedTile.piece);
          clickedTile.erasePiece();

          let newKingTile = this.getTile(newRookTile.x-1, newRookTile.y);
          this.selectedPieceLegalTiles.push(newKingTile);
          this.placeSelectedPiece(newKingTile);
        } else if (clickedTile.x == 7) { // kingside
          let newRookTile = this.getTile(clickedTile.x-2, clickedTile.y); 
          newRookTile.setPiece(clickedTile.piece);
          clickedTile.erasePiece();

          let newKingTile = this.getTile(newRookTile.x+1, newRookTile.y);
          this.selectedPieceLegalTiles.push(newKingTile);
          this.placeSelectedPiece(newKingTile);
        }
      }
    }
  }
}
