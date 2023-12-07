import { Component, OnInit } from '@angular/core';
import { BOARDCOORDINATES, Tile } from '../tile';
import { PIECECOLORS, PIECETYPES, Piece } from '../piece';
import { Move } from '../move';

import * as bootstrap from 'bootstrap';
import { left } from '@popperjs/core';

declare var window: any; // for displaying bootstrap modals

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  PIECETYPESTEMPLATE = PIECETYPES;

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
  previousPreviousTile?: Tile | undefined = undefined;

  selectedPieceLegalTiles: Tile[] = [];

  kingChecked: number = 0; // 0b01000 - white king checked, 0b10000 - black king checked
<<<<<<< HEAD
  previousKingTile?: Tile | undefined = undefined;
=======
>>>>>>> 0d06574506258487ea7a767d1c3adadd26c8ad8b

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

  // TO MAKE IT WORK
  //TODO: check
  //TODO: cant make moves that endanger your king -> delete those moves from legalMoves for every piece
  //TODO: when in check you need to remove it using the king or other pieces or by capturing the attacking enemy piece
  //TODO: checkmate
  //TODO: draw

  // LATER TODOS
  //TODO: evaluation not on piece select
  //TODO: count pieces' values to see who's ahead
  //TODO: make grabbing hand show only on grabable pieces
  //TODO: dynamic evaluation
  //TODO: animation
  //TODO: sounds
  //TODO: optimisations
  //TODO: more encapsulation / dividing things
  //TODO: bootstrap Modal compontent for displaying stuff
  //TODO: divide functions like noDrag, getMouseCoordinates to its own services
  //TODO: make everything more structural
  //TODO: simplify Board component's template to feature one function for every element that handles all events

  promotionModal: any;

  ngOnInit() {
    this.resetBoard();

    this.promotionModal = new window.bootstrap.Modal(document.getElementById("promotionModal"));
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

  evaluateLegalMoves(tile: Tile): Tile[] {
    if (tile.piece === undefined)
      return [];

    let legalMoves: Tile[] = [];
    let piece = tile.piece;

    switch (piece.type) {
      case PIECETYPES.PAWN: {
        let delta = (piece.color == PIECECOLORS.WHITE) ? -1 : 1; // depends on color
        if (tile.y+delta >= 0 && tile.y+delta <= 7 && this.getTile(tile.x, tile.y+delta).piece === undefined) legalMoves.push(this.getTile(tile.x, tile.y+delta));
        if (tile.y+2*delta >= 0 && tile.y+2*delta <= 7 && !piece.touched && this.getTile(tile.x, tile.y+delta).piece === undefined) legalMoves.push(this.getTile(tile.x, tile.y+2*delta));

        // capturing
        if (tile.x-1 >= 0 && tile.y+delta >= 0 && tile.y+delta <= 7 && this.getTile(tile.x-1, tile.y+delta).piece !== undefined) {
          legalMoves.push(this.getTile(tile.x-1, tile.y+delta));
        }
        if (tile.x+1 <= 7 && tile.y+delta >= 0 && tile.y+delta <= 7 && this.getTile(tile.x+1, tile.y+delta).piece !== undefined) {
          legalMoves.push(this.getTile(tile.x+1, tile.y+delta));
        }

        // en passant
        if (tile.x-1 >= 0 && this.getTile(tile.x-1, tile.y+delta).piece === undefined && this.getTile(tile.x-1, tile.y).piece !== undefined && this.getTile(tile.x-1, tile.y).piece!.color != piece.color && this.getTile(tile.x-1, tile.y).piece!.enpassantable == true) {
          legalMoves.push(this.getTile(tile.x-1, tile.y+delta));
        } 
        if (tile.x+1 <= 7 && this.getTile(tile.x+1, tile.y+delta).piece === undefined && this.getTile(tile.x+1, tile.y).piece !== undefined && this.getTile(tile.x+1, tile.y).piece!.color != piece.color && this.getTile(tile.x+1, tile.y).piece!.enpassantable == true) {
          legalMoves.push(this.getTile(tile.x+1, tile.y+delta));
        }
        break;
      }

      case PIECETYPES.KNIGHT: {
        if (tile.x-1 >= 0 && tile.y+2 >= 0 && tile.x-1 <= 7 && tile.y+2 <= 7) legalMoves.push(this.getTile(tile.x-1, tile.y+2));
        if (tile.x+1 >= 0 && tile.y+2 >= 0 && tile.x+1 <= 7 && tile.y+2 <= 7) legalMoves.push(this.getTile(tile.x+1, tile.y+2));

        if (tile.x+2 >= 0 && tile.y+1 >= 0 && tile.x+2 <= 7 && tile.y+1 <= 7) legalMoves.push(this.getTile(tile.x+2, tile.y+1));
        if (tile.x+2 >= 0 && tile.y-1 >= 0 && tile.x+2 <= 7 && tile.y-1 <= 7) legalMoves.push(this.getTile(tile.x+2, tile.y-1));

        if (tile.x-1 >= 0 && tile.y-2 >= 0 && tile.x-1 <= 7 && tile.y-2 <= 7) legalMoves.push(this.getTile(tile.x-1, tile.y-2));
        if (tile.x+1 >= 0 && tile.y-2 >= 0 && tile.x+1 <= 7 && tile.y-2 <= 7) legalMoves.push(this.getTile(tile.x+1, tile.y-2));

        if (tile.x-2 >= 0 && tile.y+1 >= 0 && tile.x-2 <= 7 && tile.y+1 <= 7) legalMoves.push(this.getTile(tile.x-2, tile.y+1));
        if (tile.x-2 >= 0 && tile.y-1 >= 0 && tile.x-2 <= 7 && tile.y-1 <= 7) legalMoves.push(this.getTile(tile.x-2, tile.y-1));
        break;
      }

      case PIECETYPES.BISHOP: {
        for (let i = 1; i <= Math.min(tile.x, tile.y); i++) {
          legalMoves.push(this.getTile(tile.x-i, tile.y-i));
          if (this.getTile(tile.x-i, tile.y-i).piece !== undefined) break;
        }
        for (let i = 1; i <= Math.min(7 - tile.x, tile.y); i++) {
          legalMoves.push(this.getTile(tile.x+i, tile.y-i));
          if (this.getTile(tile.x+i, tile.y-i).piece !== undefined) break;
        }
        for (let i = 1; i <= Math.min(7 - tile.x, 7 - tile.y); i++) {
          legalMoves.push(this.getTile(tile.x+i, tile.y+i));
          if (this.getTile(tile.x+i, tile.y+i).piece !== undefined) break;
        }
        for (let i = 1; i <= Math.min(tile.x, 7 - tile.y); i++) {
          legalMoves.push(this.getTile(tile.x-i, tile.y+i));
          if (this.getTile(tile.x-i, tile.y+i).piece !== undefined) break;
        }
        break;
      }

      case PIECETYPES.ROOK: {
        for (let i = 1; i <= tile.y; i++) {
          legalMoves.push(this.getTile(tile.x, tile.y-i));
          if (this.getTile(tile.x, tile.y-i).piece !== undefined) break;
        }
        for (let i = 1; i <= 7 - tile.x; i++) {
          legalMoves.push(this.getTile(tile.x+i, tile.y));
          if (this.getTile(tile.x+i, tile.y).piece !== undefined) break;
        }
        for (let i = 1; i <= 7 - tile.y; i++) {
          legalMoves.push(this.getTile(tile.x, tile.y+i));
          if (this.getTile(tile.x, tile.y+i).piece !== undefined) break;
        }
        for (let i = 1; i <= tile.x; i++) {
          legalMoves.push(this.getTile(tile.x-i, tile.y));
          if (this.getTile(tile.x-i, tile.y).piece !== undefined) break;
        }
        break;
      }

      case PIECETYPES.QUEEN: {
        for (let i = 1; i <= Math.min(tile.x, tile.y); i++) {
          legalMoves.push(this.getTile(tile.x-i, tile.y-i));
          if (this.getTile(tile.x-i, tile.y-i).piece !== undefined) break;
        }
        for (let i = 1; i <= Math.min(7 - tile.x, tile.y); i++) {
          legalMoves.push(this.getTile(tile.x+i, tile.y-i));
          if (this.getTile(tile.x+i, tile.y-i).piece !== undefined) break;
        }
        for (let i = 1; i <= Math.min(7 - tile.x, 7 - tile.y); i++) {
          legalMoves.push(this.getTile(tile.x+i, tile.y+i));
          if (this.getTile(tile.x+i, tile.y+i).piece !== undefined) break;
        }
        for (let i = 1; i <= Math.min(tile.x, 7 - tile.y); i++) {
          legalMoves.push(this.getTile(tile.x-i, tile.y+i));
          if (this.getTile(tile.x-i, tile.y+i).piece !== undefined) break;
        }

        for (let i = 1; i <= tile.y; i++) {
          legalMoves.push(this.getTile(tile.x, tile.y-i));
          if (this.getTile(tile.x, tile.y-i).piece !== undefined) break;
        }
        for (let i = 1; i <= 7 - tile.x; i++) {
          legalMoves.push(this.getTile(tile.x+i, tile.y));
          if (this.getTile(tile.x+i, tile.y).piece !== undefined) break;
        }
        for (let i = 1; i <= 7 - tile.y; i++) {
          legalMoves.push(this.getTile(tile.x, tile.y+i));
          if (this.getTile(tile.x, tile.y+i).piece !== undefined) break;
        }
        for (let i = 1; i <= tile.x; i++) {
          legalMoves.push(this.getTile(tile.x-i, tile.y));
          if (this.getTile(tile.x-i, tile.y).piece !== undefined) break;
        }
        break;
      }

      case PIECETYPES.KING: {
        if (tile.y-1 >= 0) legalMoves.push(this.getTile(tile.x, tile.y-1));
        if (tile.x+1 <= 7) legalMoves.push(this.getTile(tile.x+1, tile.y));
        if (tile.y+1 <= 7) legalMoves.push(this.getTile(tile.x, tile.y+1));
        if (tile.x-1 >= 0) legalMoves.push(this.getTile(tile.x-1, tile.y));

        if (tile.x-1 >= 0 && tile.y-1 >= 0) legalMoves.push(this.getTile(tile.x-1, tile.y-1));
        if (tile.x-1 >= 0 && tile.y+1 <= 7) legalMoves.push(this.getTile(tile.x-1, tile.y+1));
        if (tile.x+1 <= 7 && tile.y+1 <= 7) legalMoves.push(this.getTile(tile.x+1, tile.y+1));
        if (tile.x+1 <= 7 && tile.y-1 >= 0) legalMoves.push(this.getTile(tile.x+1, tile.y-1));
        
        // TODO: castling: king cant be checked
        // - Neither the king nor the rook has previously moved. done
        // - There are no pieces between the king and the rook. done
        // - The king is not currently in check.
        // - The king does not pass through or finish on a square that is attacked by an enemy piece.

        // long castling / queenside
        if (piece.touched) {
          let rookTile = this.getTile(0, tile.y);

          let tileInBetween1 = this.getTile(1, tile.y);
          let tileInBetween2 = this.getTile(2, tile.y);
          let tileInBetween3 = this.getTile(3, tile.y);

          if (rookTile.piece !== undefined && !rookTile.piece.touched && tileInBetween1.piece === undefined && tileInBetween2.piece === undefined && tileInBetween3.piece === undefined) {
            legalMoves.push(rookTile);
          }
        }

        // short castling / kingside
        if (piece.touched) {
          let rookTile = this.getTile(7, tile.y);

          let tileInBetween1 = this.getTile(5, tile.y);
          let tileInBetween2 = this.getTile(6, tile.y);

          if (rookTile.piece !== undefined && !rookTile.piece.touched && tileInBetween1.piece === undefined && tileInBetween2.piece === undefined) {
            legalMoves.push(rookTile);
          }
        }
      }
    }

    legalMoves = legalMoves.filter((t) => {
      return t.piece === undefined || t.piece.color !== piece.color || t.piece.castlingable;
    });

    legalMoves.push(tile);

    return legalMoves;
  }

  selectPiece(clickedTile: Tile) {
    if (this.selectedPiece === undefined && clickedTile.piece !== undefined && clickedTile.piece.color === this.playerTurnColor) {
      this.selectedPieceLegalTiles = this.evaluateLegalMoves(clickedTile);

      if (this.selectedPieceLegalTiles.length <= 1)
        return;

      for (let tile of this.selectedPieceLegalTiles) {
        tile.availableMove = true;
      }

      this.selectedPiece = clickedTile.piece;
      clickedTile.erasePiece();

      clickedTile.availableMove = true;

      this.previousTile = clickedTile;
      this.selectedPieceMove.from = clickedTile.coordinate;
<<<<<<< HEAD
=======

      switch (this.selectedPiece.type) {
        case PIECETYPES.PAWN: {
          let delta = (this.selectedPiece!.color == 0b01000) ? -1 : 1; // depends on color
          if (clickedTile.y+delta >= 0 && clickedTile.y+delta <= 7 && this.getTile(clickedTile.x, clickedTile.y+delta).piece === undefined) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y+delta));
          if (clickedTile.y+2*delta >= 0 && clickedTile.y+2*delta <= 7 && !this.selectedPiece!.touched && this.getTile(clickedTile.x, clickedTile.y+delta).piece === undefined) this.selectedPieceLegalTiles.push(this.getTile(clickedTile.x, clickedTile.y+2*delta));

          // capturing
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
          if (this.kingChecked == 0) {
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
      }

      this.selectedPieceLegalTiles = this.selectedPieceLegalTiles.filter((tile) => {
        return tile.piece === undefined || tile.piece.color !== this.playerTurnColor || tile.piece.castlingable;
      });

      this.selectedPieceLegalTiles.push(clickedTile); // piece's origin

      for (let tile of this.selectedPieceLegalTiles) {
        tile.availableMove = true;
      }
>>>>>>> 0d06574506258487ea7a767d1c3adadd26c8ad8b
    }
  }

  placeSelectedPiece(clickedTile: Tile) {
    if (this.selectedPiece !== undefined) {

      if (!this.selectedPieceLegalTiles.includes(clickedTile)) return;

      clickedTile.setPiece(this.selectedPiece);

      // this.previousTile!.availableMove = false; // ! notation because to first place a piece you need to select it

      for (let tile of this.selectedPieceLegalTiles) {
        tile.availableMove = false;
      }
<<<<<<< HEAD
      this.selectedPieceLegalTiles.splice(0); // TODO: replace it with loading from tile object?

      if (clickedTile !== this.previousTile) { // if the move wasn't undone
=======
      this.selectedPieceLegalTiles.splice(0);

      if (clickedTile !== this.previousTile) {
>>>>>>> 0d06574506258487ea7a767d1c3adadd26c8ad8b
        if (this.selectedPiece.type == PIECETYPES.PAWN) {
          // en passant condition
          if (!this.selectedPiece.touched && Math.abs(this.previousTile!.y - clickedTile.y) == 2) {
            this.selectedPiece.enpassantable = true;
          } else {
            this.selectedPiece.enpassantable = false;
          }

          // en passant implementation
          let delta = (this.selectedPiece.color == PIECECOLORS.WHITE) ? -1 : 1;
          if (this.previousTile!.x-1 >= 0) {
            let leftPawnTile = this.getTile(this.previousTile!.x-1, this.previousTile!.y);
            if (leftPawnTile.piece !== undefined && leftPawnTile.piece.type == PIECETYPES.PAWN && leftPawnTile.piece.color != this.playerTurnColor && leftPawnTile.piece.enpassantable == true) {
              if (clickedTile.x == leftPawnTile.x && clickedTile.y == leftPawnTile.y+delta) {
                leftPawnTile.erasePiece();
              }
            }
          }
          if (clickedTile.x+1 <= 7) {
            let rightPawnTile = this.getTile(this.previousTile!.x+1, this.previousTile!.y);
            if (rightPawnTile.piece !== undefined && rightPawnTile.piece.type == PIECETYPES.PAWN && rightPawnTile.piece.color != this.playerTurnColor && rightPawnTile.piece.enpassantable == true) {
              if (clickedTile.x == rightPawnTile.x && clickedTile.y == rightPawnTile.y+delta) {
                rightPawnTile.erasePiece();
              }
            }
          }

          // promotion
          if (clickedTile.y == 0 || clickedTile.y == 7) {
            this.promotionModal.show();
          }
        }

        if (this.selectedPiece.touched === false)
          this.selectedPiece.touched = true;

        this.selectedPieceMove.to = clickedTile.coordinate;
        this.moves.push({...this.selectedPieceMove}); // pushing copy of Move object

        this.playerTurnColor = (this.playerTurnColor == PIECECOLORS.WHITE) ? PIECECOLORS.BLACK : PIECECOLORS.WHITE;
        
        if (this.previousTile !== undefined) this.previousTile.unhighlight();
        if (this.previousClickedTile !== undefined) this.previousClickedTile.unhighlight();
        if (this.previousPreviousTile !== undefined) this.previousPreviousTile.unhighlight(); // for unhighlighting

        // last move tiles highlight
        clickedTile.highlight();
        this.previousTile!.highlight();

        this.previousClickedTile = clickedTile; // for unhighlighting
        this.previousPreviousTile = this.previousTile; // for unhighlighting

        // check, testing after changing the player turn, if white made the attacking move then black is in check
        let kingTile = this.findTileById(this.playerTurnColor ^ PIECETYPES.KING);
        let kingAttackers = this.findKingAttackers(kingTile!); // there always should be a king on the board

        // king in check
        if (kingAttackers.length > 0) {
          console.log(PIECECOLORS[kingTile!.piece!.color] + " king in check");

<<<<<<< HEAD
          kingTile!.highlightColor = "red"; // telling the compiler that kingTile always will be found because it SHOULD always be on the board
          kingTile!.highlight();

          this.previousKingTile = kingTile;
=======
          kingTile!.highlightColor = "red";
          kingTile!.highlight();

          previousKingTile jssdbbdfsbgsdfbg
>>>>>>> 0d06574506258487ea7a767d1c3adadd26c8ad8b

          this.kingChecked = this.playerTurnColor;

          //checkmate...
<<<<<<< HEAD
        } else if (this.previousKingTile !== undefined) {
          this.kingChecked = 0;
          this.previousKingTile.unhighlight();
          this.previousKingTile = undefined;
=======
        } else {
          this.kingChecked = 0;
>>>>>>> 0d06574506258487ea7a767d1c3adadd26c8ad8b
        }

        console.log(`${PIECECOLORS[(this.selectedPiece.color)]} ${PIECETYPES[this.selectedPiece.type]} ${this.selectedPieceMove.from} -> ${this.selectedPieceMove.to}`);
      }

      this.selectedPiece = undefined;
    }
  }

  attackPiece(clickedTile: Tile) {
    // attacking, capturing
    if (this.selectedPieceLegalTiles.includes(clickedTile)) {
      if (this.selectedPiece !== undefined && clickedTile.piece !== undefined && this.selectedPieceMove.from !== clickedTile.coordinate) {
        if (clickedTile.piece.color !== this.playerTurnColor) {
<<<<<<< HEAD
          console.log(`${PIECECOLORS[clickedTile.piece.color]} ${PIECETYPES[clickedTile.piece.type]} captured by ${PIECECOLORS[this.selectedPiece.color]} ${PIECETYPES[this.selectedPiece.type]} on ${BOARDCOORDINATES[clickedTile.y][clickedTile.x]}`);
=======
          console.log(`${PIECECOLORS[clickedTile.piece.color]} ${PIECETYPES[clickedTile.piece.type]} captured by ${PIECECOLORS[this.selectedPiece.color]} ${PIECETYPES[this.selectedPiece.type]} on ${BOARDCOORDINATES[clickedTile.y][clickedTile.x]} (${clickedTile.x}, ${clickedTile.y})`);
>>>>>>> 0d06574506258487ea7a767d1c3adadd26c8ad8b
          
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

  promotePiece(tile: Tile | undefined, new_type: PIECETYPES) {
    if (tile !== undefined) {
      let old_color = tile.piece!.color;

      tile.erasePiece();

      tile.setPiece(new Piece(old_color, new_type));
    }
  }

  findTileById(id: number) {
    for (let row of this.board) {
      for (let tile of row) {
        if (tile.piece !== undefined && tile.piece.id === id)
          return tile;
      }
    }

    return;
  }

  findKingAttackers(kingTile: Tile): Tile[] {
    let kingPiece = kingTile.piece;

    if (kingPiece === undefined)
      return [];

    let x = kingTile.x;
    let y = kingTile.y;

    // get potencial attackers 
    let potencialAttackers: Tile[] = [];

    for (let i = 1; i <= Math.min(x, y); i++) {
      let tile = this.getTile(x-i, y-i);
      if (tile.piece !== undefined) {
        if (tile.piece.color !== kingPiece.color)
          potencialAttackers.push(tile);
      
        break;
      }
    }
    for (let i = 1; i <= Math.min(7 - x, y); i++) {
      let tile = this.getTile(x+i, y-i);
      if (tile.piece !== undefined) {
        if (tile.piece.color !== kingPiece.color)
          potencialAttackers.push(tile);

        break;
      }
    }
    for (let i = 1; i <= Math.min(7 - x, 7 - y); i++) {
      let tile = this.getTile(x+i, y+i);
      if (tile.piece !== undefined) {
        if (tile.piece.color !== kingPiece.color)
          potencialAttackers.push(tile);

        break;
      }
    }
    for (let i = 1; i <= Math.min(x, 7 - y); i++) {
      let tile = this.getTile(x-i, y+i);
      if (tile.piece !== undefined) {
        if (tile.piece.color !== kingPiece.color)
          potencialAttackers.push(tile);

        break;
      }
    }

    for (let i = 1; i <= y; i++) {
      let tile = this.getTile(x, y-i);
      if (tile.piece !== undefined) {
        if (tile.piece.color !== kingPiece.color)
          potencialAttackers.push(tile);
        
        break;
      }
    }
    for (let i = 1; i <= 7 - x; i++) {
      let tile = this.getTile(x+i, y);
      if (tile.piece !== undefined) {
        if (tile.piece.color !== kingPiece.color)
          potencialAttackers.push(tile);
        
        break;
      }
    }
    for (let i = 1; i <= 7 - y; i++) {
      let tile = this.getTile(x, y+i);
      if (tile.piece !== undefined) {
        if (tile.piece.color !== kingPiece.color)
          potencialAttackers.push(tile);
        
        break;
      }
    }
    for (let i = 1; i <= x; i++) {
      let tile = this.getTile(x-i, y);
      if (tile.piece !== undefined) {
        if (tile.piece.color !== kingPiece.color)
          potencialAttackers.push(tile);
        
        break;
      }
    }

    if (x-1 >= 0 && y+2 >= 0 && x-1 <= 7 && y+2 <= 7) {
      let knightTile1 = this.getTile(x-1, y+2);
      if (knightTile1.piece !== undefined && knightTile1.piece.color !== kingPiece.color)
        potencialAttackers.push(knightTile1);
    }
    
    if (x+1 >= 0 && y+2 >= 0 && x+1 <= 7 && y+2 <= 7) {
      let knightTile2 = this.getTile(x+1, y+2);
      if (knightTile2.piece !== undefined && knightTile2.piece.color !== kingPiece.color)
        potencialAttackers.push(knightTile2);
    }
      

    if (x+2 >= 0 && y+1 >= 0 && x+2 <= 7 && y+1 <= 7) {
      let knightTile3 = this.getTile(x+2, y+1);
      if (knightTile3.piece !== undefined && knightTile3.piece.color !== kingPiece.color)
        potencialAttackers.push(knightTile3);
    }
      
    if (x+2 >= 0 && y-1 >= 0 && x+2 <= 7 && y-1 <= 7) {
      let knightTile4 = this.getTile(x+2, y-1);
      if (knightTile4.piece !== undefined && knightTile4.piece.color !== kingPiece.color)
        potencialAttackers.push(knightTile4);
    }
      

    if (x-1 >= 0 && y-2 >= 0 && x-1 <= 7 && y-2 <= 7) {
      let knightTile5 = this.getTile(x-1, y-2);
      if (knightTile5.piece !== undefined && knightTile5.piece.color !== kingPiece.color)
        potencialAttackers.push(knightTile5);
    }
      
    if (x+1 >= 0 && y-2 >= 0 && x+1 <= 7 && y-2 <= 7) {
      let knightTile6 = this.getTile(x+1, y-2);
      if (knightTile6.piece !== undefined && knightTile6.piece.color !== kingPiece.color)
        potencialAttackers.push(knightTile6);
    }
      

    if (x-2 >= 0 && y+1 >= 0 && x-2 <= 7 && y+1 <= 7) {
      let knightTile7 = this.getTile(x-2, y+1);
      if (knightTile7.piece !== undefined && knightTile7.piece.color !== kingPiece.color)
        potencialAttackers.push(knightTile7);
    }
      
    if (x-2 >= 0 && y-1 >= 0 && x-2 <= 7 && y-1 <= 7) {
      let knightTile8 = this.getTile(x-2, y-1);
      if (knightTile8.piece !== undefined && knightTile8.piece.color !== kingPiece.color)
        potencialAttackers.push(knightTile8);
    }
      

    // king attackers found by checking if potencialAttacker's legal moves contain this king's tile 
    let attackers: Tile[] = [];

    for (let potencialAttacker of potencialAttackers) {
      let potencialAttackerLegalMoves = this.evaluateLegalMoves(potencialAttacker);

      if (potencialAttackerLegalMoves === undefined)
        continue;

      if (potencialAttackerLegalMoves.includes(kingTile))
        attackers.push(potencialAttacker);
    }

    return attackers;
  }
}