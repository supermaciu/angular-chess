import { Component, OnInit } from '@angular/core';
import { BOARDCOORDINATES, Tile } from '../tile';
import { PIECECOLORS, PIECETYPES, Piece } from '../piece';
import { Move } from '../move';

import * as bootstrap from 'bootstrap';

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

  kingAttackers: Tile[] = [];
  kingChecked: number = 0; // 0b01000 - white king checked, 0b10000 - black king checked
  previousKingTile?: Tile | undefined = undefined;

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
  //TODO: diffrenciate pawn attacking and moving
  //TODO: fix highlight - different red show

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

  evaluateLegalMoves(tile: Tile, forKing: boolean = false): Tile[] {
    if (tile.piece === undefined)
      return [];

    let legalMoves: Tile[] = [];
    let piece = tile.piece;

    switch (piece.type) {
      case PIECETYPES.PAWN: {
        let delta = (piece.color == PIECECOLORS.WHITE) ? -1 : 1; // depends on color
        if (tile.y+delta >= 0 && tile.y+delta <= 7 && this.getTile(tile.x, tile.y+delta).piece === undefined) {
          legalMoves.push(this.getTile(tile.x, tile.y+delta));
          if (tile.y+2*delta >= 0 && tile.y+2*delta <= 7 && !piece.touched && this.getTile(tile.x, tile.y+2*delta).piece === undefined) {
            legalMoves.push(this.getTile(tile.x, tile.y+2*delta));
          }
        }

        // capturing, adding to legal moves if the pawn can attack a opposite color piece OR the opposite color king is checking if it can move there
        // STILL DOESNT WORK
        
        if (tile.x-1 >= 0 && tile.y+delta >= 0 && tile.y+delta <= 7 && (this.getTile(tile.x-1, tile.y+delta).piece !== undefined || piece.color !== this.playerTurnColor)) {
          legalMoves.push(this.getTile(tile.x-1, tile.y+delta));
        }
        if (tile.x+1 <= 7 && tile.y+delta >= 0 && tile.y+delta <= 7 && (this.getTile(tile.x+1, tile.y+delta).piece !== undefined || piece.color !== this.playerTurnColor)) {
          legalMoves.push(this.getTile(tile.x+1, tile.y+delta));
        }
    
        // en passant
        if (!forKing) {
          if (tile.x-1 >= 0 && tile.y+delta >= 0 && tile.y+delta <= 7 && this.getTile(tile.x-1, tile.y+delta).piece === undefined && this.getTile(tile.x-1, tile.y).piece !== undefined && this.getTile(tile.x-1, tile.y).piece!.color != piece.color && this.getTile(tile.x-1, tile.y).piece!.enpassantable == true) {
            legalMoves.push(this.getTile(tile.x-1, tile.y+delta));
          } 
          if (tile.x+1 <= 7 && tile.y+delta >= 0 && tile.y+delta <= 7 && this.getTile(tile.x+1, tile.y+delta).piece === undefined && this.getTile(tile.x+1, tile.y).piece !== undefined && this.getTile(tile.x+1, tile.y).piece!.color != piece.color && this.getTile(tile.x+1, tile.y).piece!.enpassantable == true) {
            legalMoves.push(this.getTile(tile.x+1, tile.y+delta));
          }
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
          let t = this.getTile(tile.x-i, tile.y-i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= Math.min(7 - tile.x, tile.y); i++) {
          let t = this.getTile(tile.x+i, tile.y-i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= Math.min(7 - tile.x, 7 - tile.y); i++) {
          let t = this.getTile(tile.x+i, tile.y+i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= Math.min(tile.x, 7 - tile.y); i++) {
          let t = this.getTile(tile.x-i, tile.y+i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        break;
      }

      case PIECETYPES.ROOK: {
        for (let i = 1; i <= tile.y; i++) {
          let t = this.getTile(tile.x, tile.y-i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= 7 - tile.x; i++) {
          let t = this.getTile(tile.x+i, tile.y);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= 7 - tile.y; i++) {
          let t = this.getTile(tile.x, tile.y+i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= tile.x; i++) {
          let t = this.getTile(tile.x-i, tile.y);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        break;
      }

      case PIECETYPES.QUEEN: {
        for (let i = 1; i <= Math.min(tile.x, tile.y); i++) {
          let t = this.getTile(tile.x-i, tile.y-i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= Math.min(7 - tile.x, tile.y); i++) {
          let t = this.getTile(tile.x+i, tile.y-i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= Math.min(7 - tile.x, 7 - tile.y); i++) {
          let t = this.getTile(tile.x+i, tile.y+i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= Math.min(tile.x, 7 - tile.y); i++) {
          let t = this.getTile(tile.x-i, tile.y+i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }

        for (let i = 1; i <= tile.y; i++) {
          let t = this.getTile(tile.x, tile.y-i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= 7 - tile.x; i++) {
          let t = this.getTile(tile.x+i, tile.y);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= 7 - tile.y; i++) {
          let t = this.getTile(tile.x, tile.y+i);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
        }
        for (let i = 1; i <= tile.x; i++) {
          let t = this.getTile(tile.x-i, tile.y);
          legalMoves.push(t);
          if (t.piece !== undefined && !(forKing && t.piece.id === (this.playerTurnColor | PIECETYPES.KING))) break;
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
        // - The king is not currently in check. done
        // - The king does not pass through or finish on a square that is attacked by an enemy piece.

        // long castling / queenside
        if (this.kingChecked !== piece.color) {
          if (!piece.touched) {
            let rookTile = this.getTile(0, tile.y);

            let tileInBetween1 = this.getTile(1, tile.y);
            let tileInBetween2 = this.getTile(2, tile.y);
            let tileInBetween3 = this.getTile(3, tile.y);

            if (rookTile.piece !== undefined && !rookTile.piece.touched && tileInBetween1.piece === undefined && tileInBetween2.piece === undefined && tileInBetween3.piece === undefined) {
              legalMoves.push(rookTile);
            }
          }

          // short castling / kingside
          if (!piece.touched) {
            let rookTile = this.getTile(7, tile.y);

            let tileInBetween1 = this.getTile(5, tile.y);
            let tileInBetween2 = this.getTile(6, tile.y);

            if (rookTile.piece !== undefined && !rookTile.piece.touched && tileInBetween1.piece === undefined && tileInBetween2.piece === undefined) {
              legalMoves.push(rookTile);
            }
          }
        }

        // throwing out moves that endanger the king and opposite color king moves
        let allPieces: Tile[] = [];
        for (let row of this.board) {
          for (let tile of row) {
            allPieces.push(tile);
          }
        }

        // all enemy pieces without king
        let enemyPieces = allPieces.filter((t) => {
          return t.piece !== undefined && t.piece.color !== this.playerTurnColor && t.piece.type !== PIECETYPES.KING;
        });

        for (let enemyPiece of enemyPieces) {
          let enemyPieceMoves = this.evaluateLegalMoves(enemyPiece, true);
          // let enemyPieceMoves = this.evaluateLegalMoves(enemyPiece, true); - tutaj wartość jest kopiowana tylko do tego wywołania
          // let enemyPieceMoves = this.evaluateLegalMoves(enemyPiece, forKing=true); - tutaj wartość jest zmieniana w każdym wywołaniu, i w tym i w zewnętrznym

          // delete tiles in king's legal moves that occur in enemy piece's legal moves
          legalMoves = legalMoves.filter((t) => {
            return !enemyPieceMoves.includes(t);
          });
        }

        // calling the same loop twice because it makes sure that the attacking piece tile that you can capture as a king is not watched by other opposite color pieces
        // TODO: change for something more optimized - recall enemy pieces' moves, if in them are sliding pieces that watch other pieces, check them again
        for (let enemyPiece of enemyPieces) {
          let enemyPieceMoves = this.evaluateLegalMoves(enemyPiece, true);
          // let enemyPieceMoves = this.evaluateLegalMoves(enemyPiece, false); - tutaj wartość jest kopiowana tylko do tego wywołania
          // let enemyPieceMoves = this.evaluateLegalMoves(enemyPiece, !forKing=false); - tutaj wartość jest zmieniana w każdym wywołaniu, i w tym i w zewnętrznym

          // delete tiles in king's legal moves that occur in enemy piece's legal moves
          legalMoves = legalMoves.filter((t) => {
            return !enemyPieceMoves.includes(t);
          });
        }
      }
    }

    if (!forKing) { // normal
      legalMoves = legalMoves.filter((t) => {
        return t.piece === undefined || t.piece.color !== piece.color || t.piece.castlingable;
      });
    }

    // TODO: check moves that check the king of the same color

    // if king is checked
    // if (this.kingChecked !== 0 && piece.type !== PIECETYPES.KING) {
    //   let checkPreventingMoves: Tile[] = [];

    //   for (let kingAttacker of this.kingAttackers) {
    //     if (kingAttacker.piece!.type === PIECETYPES.BISHOP || kingAttacker.piece!.type === PIECETYPES.ROOK || kingAttacker.piece!.type === PIECETYPES.QUEEN) { // sliding pieces
    //       // check if you can block with some piece between king tile and attacking piece tile (horizonal, vertical or diagonal)


    //     }

    //     checkPreventingMoves.push(kingAttacker); // capturing the attacking piece prevents check
    //   }

    //   legalMoves = legalMoves.filter((t) => {
    //     return checkPreventingMoves.includes(t);
    //   });
    // }

    if (!forKing)
      legalMoves.push(tile); // origin

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
    }
  }

  placeSelectedPiece(clickedTile: Tile) {
    if (this.selectedPiece !== undefined) {

      if (!this.selectedPieceLegalTiles.includes(clickedTile)) return;

      clickedTile.setPiece(this.selectedPiece);

      for (let tile of this.selectedPieceLegalTiles) {
        tile.availableMove = false;
      }
      this.selectedPieceLegalTiles.splice(0); // TODO: replace it with loading from tile object?

      if (clickedTile !== this.previousTile) { // if the move wasn't undone
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
            if (leftPawnTile !== undefined && leftPawnTile.piece !== undefined && leftPawnTile.piece.type == PIECETYPES.PAWN && leftPawnTile.piece.color != this.playerTurnColor && leftPawnTile.piece.enpassantable == true) {
              if (clickedTile.x == leftPawnTile.x && clickedTile.y == leftPawnTile.y+delta) {
                leftPawnTile.erasePiece();
              }
            }
          }
          if (clickedTile.x+1 <= 7) {
            let rightPawnTile = this.getTile(this.previousTile!.x+1, this.previousTile!.y);
            if (rightPawnTile !== undefined && rightPawnTile.piece !== undefined && rightPawnTile.piece.type == PIECETYPES.PAWN && rightPawnTile.piece.color != this.playerTurnColor && rightPawnTile.piece.enpassantable == true) {
              if (clickedTile.x == rightPawnTile.x && clickedTile.y == rightPawnTile.y+delta) {
                rightPawnTile.erasePiece();
              }
            }
          }

          // pawn promotion
          if (clickedTile.y == 0 || clickedTile.y == 7) {
            this.promotionModal.show();
            // TODO: need to wait for this function to end for the check evaluation to be done because the pawn can promote to a piece that threatens the king
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
        this.kingAttackers = this.findKingAttackers(kingTile!); // there always should be a king on the board

        // king in check
        if (this.kingAttackers.length > 0) {
          console.log(PIECECOLORS[kingTile!.piece!.color] + " KING in check");

          kingTile!.highlightColor = "red"; // telling the compiler that kingTile always will be found because it SHOULD always be on the board
          kingTile!.highlight();

          this.previousKingTile = kingTile;

          this.kingChecked = this.playerTurnColor;

          //checkmate...
        } else if (this.previousKingTile !== undefined) {
          this.kingChecked = 0;
          this.previousKingTile.unhighlight();
          this.previousKingTile = undefined;
          this.kingAttackers = [];
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
          console.log(`${PIECECOLORS[clickedTile.piece.color]} ${PIECETYPES[clickedTile.piece.type]} captured by ${PIECECOLORS[this.selectedPiece.color]} ${PIECETYPES[this.selectedPiece.type]} on ${BOARDCOORDINATES[clickedTile.y][clickedTile.x]}`);
          
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