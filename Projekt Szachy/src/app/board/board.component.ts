import { Component, OnInit } from '@angular/core';
import { BOARDCOORDINATES, Tile } from '../tile';
import { PIECECOLORS, PIECETYPES, Piece } from '../piece';
import { Move } from '../move';

import * as bootstrap from 'bootstrap';

declare var window: any; // for displaying bootstrap modals

// checksum draw conditions
enum DRAWCONDITIONS {
  // two kings and two bishops
  K2B2 = PIECECOLORS.WHITE + PIECETYPES.KING + PIECECOLORS.WHITE + PIECETYPES.BISHOP + PIECECOLORS.BLACK + PIECETYPES.KING + PIECECOLORS.BLACK + PIECETYPES.BISHOP,
  // two kings and two knights
  K2K2 = PIECECOLORS.WHITE + PIECETYPES.KING + PIECECOLORS.WHITE + PIECETYPES.KNIGHT + PIECECOLORS.BLACK + PIECETYPES.KING + PIECECOLORS.BLACK + PIECETYPES.KNIGHT
}

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

  // TURN CONTROL
  playerTurnColor: number = 0b01000;
  playerTurnDisplayHidden: boolean = false;

  // TILE MOVES LOG
  moves: Move[] = [];

  // SELECTED PIECE
  selectedPieceLegalTiles: Tile[] = [];
  selectedPiece?: Piece | undefined = undefined;
  selectedPieceMove: Move = {
    from: "",
    to: ""
  };

  // CONTROL TILES
  previousTile?: Tile | undefined = undefined;
  previousClickedTile?: Tile | undefined = undefined;
  previousPreviousTile?: Tile | undefined = undefined;

  kingAttackers: Tile[] = [];
  kingChecked: number = 0; // 0b01000 - white king checked, 0b10000 - black king checked
  previousCheckedKingTile?: Tile | undefined = undefined;

  promotionTile?: Tile | undefined = undefined;

  // MOUSE TARGETING
  mouseLeft!: number;
  mouseTop!: number;

  // MODALS
  promotionModal: any;
  checkmateModal: any;
  tieModal: any;

  // Timeout (timer implementation) -------------------------------

  // TO MAKE IT WORK
  //TODO: fix check highlight - different red shows sometimes
  //TODO: make hover highlight to see where you place the piece
  //TODO: dynamic tile sizing

  // LATER TODOS
  //TODO: count pieces' values to see who's ahead
  //TODO: make grabbing hand show only on grabable pieces
  //TODO: animation
  //TODO: sounds
  //TODO: optimisations
  //TODO: more encapsulation / dividing things
  //TODO: bootstrap Modal compontent for displaying stuff
  //TODO: divide functions like noDrag, getMouseCoordinates to its own services
  //TODO: make everything more structural
  //TODO: simplify Board component's template to feature one function for every element that handles all events

  //TODO: make it online -> add resignation for two sides 

  ngOnInit() {
    this.resetBoard();

    this.promotionModal = new window.bootstrap.Modal(document.getElementById("promotionModal"));
    this.checkmateModal = new window.bootstrap.Modal(document.getElementById("checkmateModal"));
    this.tieModal = new window.bootstrap.Modal(document.getElementById("tieModal"));
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

    // INITIAL LEGAL MOVES EVALUATION FOR ALL PIECES
    this.evaluateAllPiecesLegalMoves();
  }

  getTile(x: number, y: number): Tile {
    return this.board[y][x];
  }

  getAllTiles(): Tile[] {
    let allTiles: Tile[] = [];

    for (let row of this.board) {
      for (let tile of row) {
        allTiles.push(tile);
      }
    }

    return allTiles;
  }

  getAllPieces(): Tile[] {
    let allPieces: Tile[] = [];

    for (let row of this.board) {
      for (let tile of row) {
        if (tile.piece !== undefined)
          allPieces.push(tile);
      }
    }

    return allPieces;
  }

  countAllPieces(): number {
    let count = 0;

    for (let row of this.board) {
      for (let tile of row) {
        if (tile.piece !== undefined)
          count++;
      }
    }

    return count;
  }

  setTile(x: number, y: number, tile: Tile) {
    this.board[y][x] = tile;
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

  getMouseCoordinates(event: MouseEvent) {
    this.mouseLeft = event.clientX - 50;
    this.mouseTop = event.clientY - 50;
  }

  evaluateLegalMoves(tile: Tile, forKing: boolean = false, checkPreveting: boolean = false): Tile[] {
    if (tile.piece === undefined)
      return [];

    if (tile.legalMoves.length > 0)
      return tile.legalMoves;

    let legalMoves: Tile[] = [];
    let piece = tile.piece;

    let allPieces: Tile[] = this.getAllTiles();

    // all enemy pieces
    let enemyPieces = allPieces.filter((t) => {
      return t.piece !== undefined && t.piece.color !== this.playerTurnColor;
    });

    switch (piece.type) {
      case PIECETYPES.PAWN: {
        let delta = (piece.color == PIECECOLORS.WHITE) ? -1 : 1; // depends on color
        if ((tile.y+delta >= 0 && tile.y+delta <= 7 && this.getTile(tile.x, tile.y+delta).piece === undefined) && !forKing) {
          legalMoves.push(this.getTile(tile.x, tile.y+delta));
          if (tile.y+2*delta >= 0 && tile.y+2*delta <= 7 && !piece.touched && this.getTile(tile.x, tile.y+2*delta).piece === undefined) {
            legalMoves.push(this.getTile(tile.x, tile.y+2*delta));
          }
        }

        // capturing, adding to legal moves if the pawn can attack a opposite color piece OR the opposite color king is checking if it can move there
        if (tile.x-1 >= 0 && tile.y+delta >= 0 && tile.y+delta <= 7 && (this.getTile(tile.x-1, tile.y+delta).piece !== undefined || piece.color !== this.playerTurnColor)) {
          legalMoves.push(this.getTile(tile.x-1, tile.y+delta));
        }
        if (tile.x+1 <= 7 && tile.y+delta >= 0 && tile.y+delta <= 7 && (this.getTile(tile.x+1, tile.y+delta).piece !== undefined || piece.color !== this.playerTurnColor)) {
          legalMoves.push(this.getTile(tile.x+1, tile.y+delta));
        }
    
        // en passant
        if (tile.x-1 >= 0 && tile.y+delta >= 0 && tile.y+delta <= 7 && this.getTile(tile.x-1, tile.y+delta).piece === undefined && this.getTile(tile.x-1, tile.y).piece !== undefined && this.getTile(tile.x-1, tile.y).piece!.color != piece.color && this.getTile(tile.x-1, tile.y).piece!.enpassantable == true) {
          legalMoves.push(this.getTile(tile.x-1, tile.y+delta));
        } 
        if (tile.x+1 <= 7 && tile.y+delta >= 0 && tile.y+delta <= 7 && this.getTile(tile.x+1, tile.y+delta).piece === undefined && this.getTile(tile.x+1, tile.y).piece !== undefined && this.getTile(tile.x+1, tile.y).piece!.color != piece.color && this.getTile(tile.x+1, tile.y).piece!.enpassantable == true) {
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

        // only basic move checking needed for king to king contact
        if (forKing) {
          break;
        }

        // throwing out king moves that endanger the king and opposite color king moves
        for (let enemyPiece of enemyPieces) {
          let enemyPieceMoves = this.evaluateLegalMoves(enemyPiece, true, true);
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
          let enemyPieceMoves = this.evaluateLegalMoves(enemyPiece, true, true);

          legalMoves = legalMoves.filter((t) => {
            return !enemyPieceMoves.includes(t);
          });
        }

        // long castling / queenside
        if (this.kingChecked !== piece.color) {
          if (!piece.touched) {
            let tileInBetween1 = this.getTile(1, tile.y);
            let tileInBetween2 = this.getTile(2, tile.y);
            let tileInBetween3 = this.getTile(3, tile.y);

            let isAttacked = false;
            for (let enemyPiece of enemyPieces) {
              let enemyPieceMoves = this.evaluateLegalMoves(enemyPiece, true, true);

              if (enemyPieceMoves.includes(tileInBetween1) || enemyPieceMoves.includes(tileInBetween2) || enemyPieceMoves.includes(tileInBetween3)) {
                isAttacked = true;
                break;
              }
            }

            if (!isAttacked) {
              let rookTile = this.getTile(0, tile.y);
  
              if (rookTile.piece !== undefined && !rookTile.piece.touched && tileInBetween1.piece === undefined && tileInBetween2.piece === undefined && tileInBetween3.piece === undefined) {
                legalMoves.push(rookTile);
              }
            }
          }

          // short castling / kingside
          if (!piece.touched) {
            let tileInBetween1 = this.getTile(5, tile.y);
            let tileInBetween2 = this.getTile(6, tile.y);

            let isAttacked = false;
            for (let enemyPiece of enemyPieces) {
              let enemyPieceMoves = this.evaluateLegalMoves(enemyPiece, true, true);

              if (enemyPieceMoves.includes(tileInBetween1) || enemyPieceMoves.includes(tileInBetween2)) {
                isAttacked = true;
                break;
              }
            }

            if (!isAttacked) {
              let rookTile = this.getTile(7, tile.y);
  
              if (rookTile.piece !== undefined && !rookTile.piece.touched && tileInBetween1.piece === undefined && tileInBetween2.piece === undefined) {
                legalMoves.push(rookTile);
              }
            }
          }
        }
      }
    }

    // empty tiles, enemy pieces and castling with towers moves
    if (!forKing) {
      legalMoves = legalMoves.filter((t) => {
        return t.piece === undefined || t.piece.color !== piece.color || t.piece.castlingable;
      });
    }

    let kingColorPieces = this.getAllPieces().filter((t) => {
      return t.piece!.color === this.kingChecked;
    });

    // if king is checked, check defending non-king moves - king checked
    if (this.kingChecked !== 0 && piece.type !== PIECETYPES.KING && !checkPreveting) {
      
      let checkDefendingMoves: Tile[] = [];

      if (this.kingAttackers.length == 1) {
        let kingAttacker = this.kingAttackers[0];
        let kingAttackerMoves = this.evaluateLegalMoves(kingAttacker, false, true);

        for (let kingColorPiece of kingColorPieces) {
          let kingColorPieceMoves = this.evaluateLegalMoves(kingColorPiece, false, true);

          if (kingAttacker.piece!.type === PIECETYPES.BISHOP || kingAttacker.piece!.type === PIECETYPES.ROOK || kingAttacker.piece!.type === PIECETYPES.QUEEN) { // sliding pieces
            
            let kx = this.previousCheckedKingTile!.x;
            let ky = this.previousCheckedKingTile!.y;

            // reduce kingAttackerMoves to only the portion that is directing the king in check
            if (kingAttacker.piece!.type === PIECETYPES.ROOK || kingAttacker.piece!.type === PIECETYPES.QUEEN) {
              if (kingAttacker.x === kx && kingAttacker.y < ky) {
                kingAttackerMoves = kingAttackerMoves.filter(t => t.x === kingAttacker.x && t.y > kingAttacker.y);
              } else if (kingAttacker.x === kx && kingAttacker.y > ky) {
                kingAttackerMoves = kingAttackerMoves.filter(t => t.x === kingAttacker.x && t.y < kingAttacker.y);
              } else if (kingAttacker.x < kx && kingAttacker.y === ky) {
                kingAttackerMoves = kingAttackerMoves.filter(t => t.x > kingAttacker.x && t.y === kingAttacker.y);
              } else if (kingAttacker.x > kx && kingAttacker.y === ky) {
                kingAttackerMoves = kingAttackerMoves.filter(t => t.x < kingAttacker.x && t.y === kingAttacker.y);
              }
            }

            if (kingAttacker.piece!.type === PIECETYPES.BISHOP || kingAttacker.piece!.type === PIECETYPES.QUEEN) {
              if (kingAttacker.x < kx && kingAttacker.y < ky) {
                kingAttackerMoves = kingAttackerMoves.filter(t => t.x > kingAttacker.x && t.y > kingAttacker.y);
              } else if (kingAttacker.x > kx && kingAttacker.y < ky) {
                kingAttackerMoves = kingAttackerMoves.filter(t => t.x < kingAttacker.x && t.y > kingAttacker.y);
              } else if (kingAttacker.x > kx && kingAttacker.y > ky) {
                kingAttackerMoves = kingAttackerMoves.filter(t => t.x < kingAttacker.x && t.y < kingAttacker.y);
              } else if (kingAttacker.x < kx && kingAttacker.y > ky) {
                kingAttackerMoves = kingAttackerMoves.filter(t => t.x > kingAttacker.x && t.y < kingAttacker.y);
              }
            }

            // check if you can block with some piece between king tile and attacking piece tile
            for (let kingColorPieceMove of kingColorPieceMoves) {
              if (kingAttackerMoves.includes(kingColorPieceMove))
                checkDefendingMoves.push(kingColorPieceMove);
            }
          }
        }

        checkDefendingMoves.push(kingAttacker); // capturing the attacking piece defends the check
      }

      legalMoves = legalMoves.filter((t) => {
        return checkDefendingMoves.includes(t);
      });
    }

    // check prevented moves - throwing out non-king moves that endanger the king
    if (piece.type !== PIECETYPES.KING && !checkPreveting) {

      let kingTile = this.findTileById(this.playerTurnColor | PIECETYPES.KING);
      let potencialKingAttackers = this.findPotencialAttackers(kingTile!).filter((t) => {
        return t.piece!.type === PIECETYPES.BISHOP || t.piece!.type === PIECETYPES.ROOK || t.piece!.type === PIECETYPES.QUEEN;
      });

      for (let potencialKingAttacker of potencialKingAttackers) {

        let potencialKingAttackerMoves = this.getQueenMoveSetTilesFromOriginToKing(potencialKingAttacker);
    
        let kx = kingTile!.x;
        let ky = kingTile!.y;

        // reduce potencialKingAttackerMoves to only the portion that is directing the king in check
        if (potencialKingAttacker.piece!.type === PIECETYPES.ROOK || potencialKingAttacker.piece!.type === PIECETYPES.QUEEN) {
          if (potencialKingAttacker.x === kx && potencialKingAttacker.y < ky) {
            potencialKingAttackerMoves = potencialKingAttackerMoves.filter(t => t.x === potencialKingAttacker.x && t.y > potencialKingAttacker.y);
          } else if (potencialKingAttacker.x === kx && potencialKingAttacker.y > ky) {
            potencialKingAttackerMoves = potencialKingAttackerMoves.filter(t => t.x === potencialKingAttacker.x && t.y < potencialKingAttacker.y);
          } else if (potencialKingAttacker.x < kx && potencialKingAttacker.y === ky) {
            potencialKingAttackerMoves = potencialKingAttackerMoves.filter(t => t.x > potencialKingAttacker.x && t.y === potencialKingAttacker.y);
          } else if (potencialKingAttacker.x > kx && potencialKingAttacker.y === ky) {
            potencialKingAttackerMoves = potencialKingAttackerMoves.filter(t => t.x < potencialKingAttacker.x && t.y === potencialKingAttacker.y);
          }
        }

        if (potencialKingAttacker.piece!.type === PIECETYPES.BISHOP || potencialKingAttacker.piece!.type === PIECETYPES.QUEEN) {
          if (potencialKingAttacker.x < kx && potencialKingAttacker.y < ky) {
            potencialKingAttackerMoves = potencialKingAttackerMoves.filter(t => t.x > potencialKingAttacker.x && t.y > potencialKingAttacker.y);
          } else if (potencialKingAttacker.x > kx && potencialKingAttacker.y < ky) {
            potencialKingAttackerMoves = potencialKingAttackerMoves.filter(t => t.x < potencialKingAttacker.x && t.y > potencialKingAttacker.y);
          } else if (potencialKingAttacker.x > kx && potencialKingAttacker.y > ky) {
            potencialKingAttackerMoves = potencialKingAttackerMoves.filter(t => t.x < potencialKingAttacker.x && t.y < potencialKingAttacker.y);
          } else if (potencialKingAttacker.x < kx && potencialKingAttacker.y > ky) {
            potencialKingAttackerMoves = potencialKingAttackerMoves.filter(t => t.x > potencialKingAttacker.x && t.y < potencialKingAttacker.y);
          }
        }

        let kingColorPiecesInBetween = potencialKingAttackerMoves.filter((t) => {
          return t.piece !== undefined && t.piece.color === this.playerTurnColor && t.piece.type !== PIECETYPES.KING;
        });

        // if 2 pieces are in between the king and the attacker no matter what move you make king won't be in check
        if (kingColorPiecesInBetween.length === 1) {
          if (kingColorPiecesInBetween[0] === tile) { // if selected piece is the one between the king and the attacker
            legalMoves = legalMoves.filter((t) => {
              return potencialKingAttackerMoves.includes(t) || t === potencialKingAttacker;
            })
          }
        }
      }
    }

    if (!forKing)
      legalMoves.push(tile); // origin

    return legalMoves;
  }

  evaluateAllPiecesLegalMoves(color?: PIECECOLORS | undefined): number {
    this.clearAllPiecesLegalMoves()
    
    let allChangingMoves: Tile[] = [];

    if (color !== undefined) {
      this.getAllPieces().filter(t => t.piece!.color === color).forEach(tile => {
        tile.legalMoves = this.evaluateLegalMoves(tile);
        allChangingMoves = allChangingMoves.concat(tile.legalMoves.filter(t => t !== tile));
      });
    } else {
      this.getAllPieces().forEach(tile => {
        tile.legalMoves = this.evaluateLegalMoves(tile);
        allChangingMoves = allChangingMoves.concat(tile.legalMoves.filter(t => t !== tile));
      });
    }

    return allChangingMoves.length;
  }

  clearAllPiecesLegalMoves() {
    this.getAllPieces().forEach(tile => {
      tile.legalMoves = [];
    });
  }

  selectPiece(clickedTile: Tile) {
    if (this.selectedPiece === undefined && clickedTile.piece !== undefined && clickedTile.piece.color === this.playerTurnColor) {

      if (clickedTile.legalMoves.length === 0) {
        clickedTile.legalMoves = this.evaluateLegalMoves(clickedTile);
      }
      this.selectedPieceLegalTiles = clickedTile.legalMoves;

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

      for (let tile of this.selectedPieceLegalTiles) {
        tile.availableMove = false;
      }

      clickedTile.setPiece(this.selectedPiece);

      this.promotionTile = clickedTile;

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

            return; // "pausing"
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

        console.log(`${PIECECOLORS[(this.selectedPiece.color)]} ${PIECETYPES[this.selectedPiece.type]} ${this.selectedPieceMove.from} -> ${this.selectedPieceMove.to}`);

        this.clearAllPiecesLegalMoves();

        // check, testing after changing the player turn, if white made the attacking move then black is in check
        let kingTile;
        if (this.selectedPiece.type === PIECETYPES.KING) {
          kingTile = this.previousTile;
        } else {
          kingTile = this.findTileById(this.playerTurnColor | PIECETYPES.KING);
        }
        
        // get all king attackers' tiles
        this.kingAttackers = this.findKingAttackers(kingTile!);

        // The insufficient mating material rule says that the game is immediately declared a draw if there is no way to end the game in checkmate.
        // insufficient material conditions:
        // two kings
        if (this.countAllPieces() === 2) {
          this.playerTurnDisplayHidden = true;
          this.tieModal.show();
          return;
        } else if (this.countAllPieces() === 4) {
          let piecesChecksum = 0;
          this.getAllPieces().forEach((t) => {
            piecesChecksum += t.piece!.id;
          });

          if (piecesChecksum === DRAWCONDITIONS.K2B2 || piecesChecksum === DRAWCONDITIONS.K2K2) {
            this.playerTurnDisplayHidden = true;
            this.tieModal.show();
            return;
          }
        }

        // threefold repetition rule - if a move was repeated 3 times the game draws
        if (this.moves.length >= 12) {
          let sub1 = this.moves.slice(0, 4);
          let sub2 = this.moves.slice(4, 8);
          let sub3 = this.moves.slice(8, 12);

          if (JSON.stringify(sub1) == JSON.stringify(sub2) && JSON.stringify(sub2) == JSON.stringify(sub3)) {
            this.playerTurnDisplayHidden = true;
            this.tieModal.show();
            return;
          }
        }

        // check if a king in check
        if (this.kingAttackers.length > 0) {
          console.log(PIECECOLORS[kingTile!.piece!.color] + " KING in check");

          kingTile!.highlightColor = "red";
          kingTile!.highlight();
          
          this.previousCheckedKingTile = kingTile;
          this.kingChecked = this.playerTurnColor;

          // get the number of all possible moves for the player in check
          let numberOfDefendingCheckMoves = this.evaluateAllPiecesLegalMoves(this.playerTurnColor);

          // checkmate
          if (numberOfDefendingCheckMoves === 0) {
            this.playerTurnDisplayHidden = true;
            this.checkmateModal.show();
            return;
          }
          
        } else if (this.previousCheckedKingTile !== undefined) {
          this.kingChecked = 0;
          this.previousCheckedKingTile.unhighlight();
          this.previousCheckedKingTile = undefined;
          this.kingAttackers = [];
        }

        // Check for stalemate - only if the current player (who is about to move) has no legal moves and is not in check
        let numberOfCurrentPlayerMoves = this.evaluateAllPiecesLegalMoves(this.playerTurnColor);
        if (this.kingAttackers.length === 0 && numberOfCurrentPlayerMoves === 0) {
          this.playerTurnDisplayHidden = true;
          this.tieModal.show();
          return;
        }

        this.clearAllPiecesLegalMoves();
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
      let old_color = this.selectedPiece!.color;
      this.selectedPiece = new Piece(old_color, new_type);
      // return to pause - continue placing the promoted piece
      this.placeSelectedPiece(this.promotionTile!);
    }
  }

  findPotencialAttackers(attackedTile: Tile): Tile[] {
    let attackedPiece = attackedTile.piece;

    if (attackedPiece === undefined)
      return [];

    let x = attackedTile.x;
    let y = attackedTile.y;

    // get potencial attackers 
    let potencialAttackers: Tile[] = [];

    for (let i = 1; i <= Math.min(x, y); i++) {
      let tile = this.getTile(x-i, y-i);
      if (tile.piece !== undefined && tile.piece.color !== attackedPiece.color) {
          potencialAttackers.push(tile);
          break;
      }
    }
    for (let i = 1; i <= Math.min(7 - x, y); i++) {
      let tile = this.getTile(x+i, y-i);
      if (tile.piece !== undefined && tile.piece.color !== attackedPiece.color) {
        potencialAttackers.push(tile);
        break;
      }
    }
    for (let i = 1; i <= Math.min(7 - x, 7 - y); i++) {
      let tile = this.getTile(x+i, y+i);
      if (tile.piece !== undefined && tile.piece.color !== attackedPiece.color) {
        potencialAttackers.push(tile);
        break;
      }
    }
    for (let i = 1; i <= Math.min(x, 7 - y); i++) {
      let tile = this.getTile(x-i, y+i);
      if (tile.piece !== undefined && tile.piece.color !== attackedPiece.color) {
        potencialAttackers.push(tile);
        break;
      }
    }

    for (let i = 1; i <= y; i++) {
      let tile = this.getTile(x, y-i);
      if (tile.piece !== undefined && tile.piece.color !== attackedPiece.color) {
        potencialAttackers.push(tile);
        break;
      }
    }
    for (let i = 1; i <= 7 - x; i++) {
      let tile = this.getTile(x+i, y);
      if (tile.piece !== undefined && tile.piece.color !== attackedPiece.color) {
        potencialAttackers.push(tile);
        break;
      }
    }
    for (let i = 1; i <= 7 - y; i++) {
      let tile = this.getTile(x, y+i);
      if (tile.piece !== undefined && tile.piece.color !== attackedPiece.color) {
        potencialAttackers.push(tile);
        break;
      }
    }
    for (let i = 1; i <= x; i++) {
      let tile = this.getTile(x-i, y);
      if (tile.piece !== undefined && tile.piece.color !== attackedPiece.color) {
        potencialAttackers.push(tile);
        break;
      }
    }

    if (x-1 >= 0 && y+2 >= 0 && x-1 <= 7 && y+2 <= 7) {
      let knightTile1 = this.getTile(x-1, y+2);
      if (knightTile1.piece !== undefined && knightTile1.piece.color !== attackedPiece.color)
        potencialAttackers.push(knightTile1);
    }
    
    if (x+1 >= 0 && y+2 >= 0 && x+1 <= 7 && y+2 <= 7) {
      let knightTile2 = this.getTile(x+1, y+2);
      if (knightTile2.piece !== undefined && knightTile2.piece.color !== attackedPiece.color)
        potencialAttackers.push(knightTile2);
    }
      

    if (x+2 >= 0 && y+1 >= 0 && x+2 <= 7 && y+1 <= 7) {
      let knightTile3 = this.getTile(x+2, y+1);
      if (knightTile3.piece !== undefined && knightTile3.piece.color !== attackedPiece.color)
        potencialAttackers.push(knightTile3);
    }
      
    if (x+2 >= 0 && y-1 >= 0 && x+2 <= 7 && y-1 <= 7) {
      let knightTile4 = this.getTile(x+2, y-1);
      if (knightTile4.piece !== undefined && knightTile4.piece.color !== attackedPiece.color)
        potencialAttackers.push(knightTile4);
    }
      

    if (x-1 >= 0 && y-2 >= 0 && x-1 <= 7 && y-2 <= 7) {
      let knightTile5 = this.getTile(x-1, y-2);
      if (knightTile5.piece !== undefined && knightTile5.piece.color !== attackedPiece.color)
        potencialAttackers.push(knightTile5);
    }
      
    if (x+1 >= 0 && y-2 >= 0 && x+1 <= 7 && y-2 <= 7) {
      let knightTile6 = this.getTile(x+1, y-2);
      if (knightTile6.piece !== undefined && knightTile6.piece.color !== attackedPiece.color)
        potencialAttackers.push(knightTile6);
    }
      

    if (x-2 >= 0 && y+1 >= 0 && x-2 <= 7 && y+1 <= 7) {
      let knightTile7 = this.getTile(x-2, y+1);
      if (knightTile7.piece !== undefined && knightTile7.piece.color !== attackedPiece.color)
        potencialAttackers.push(knightTile7);
    }
      
    if (x-2 >= 0 && y-1 >= 0 && x-2 <= 7 && y-1 <= 7) {
      let knightTile8 = this.getTile(x-2, y-1);
      if (knightTile8.piece !== undefined && knightTile8.piece.color !== attackedPiece.color)
        potencialAttackers.push(knightTile8);
    }

    return potencialAttackers;
  }

  findKingAttackers(kingTile: Tile): Tile[] {
    let kingPiece = kingTile.piece;

    if (kingPiece === undefined)
      return [];

    let potencialAttackers = this.findPotencialAttackers(kingTile);
      
    // king attackers found by checking if potencialAttacker's legal moves contain this king's tile 
    let kingAttackers: Tile[] = [];

    for (let potencialAttacker of potencialAttackers) {
      let potencialKingAttackerLegalMoves = this.evaluateLegalMoves(potencialAttacker);

      if (potencialKingAttackerLegalMoves.includes(kingTile))
        kingAttackers.push(potencialAttacker);
    }

    return kingAttackers;
  }

  getQueenMoveSetTilesFromOriginToKing(origin: Tile) {

    let moveSetTiles: Tile[] = [];

    let x = origin.x;
    let y = origin.y;

    for (let i = 1; i <= Math.min(x, y); i++) {
      let t = this.getTile(x-i, y-i);
      moveSetTiles.push(t);
      if (t.piece !== undefined && t.piece.type === PIECETYPES.KING) break;
    }
    for (let i = 1; i <= Math.min(7 - x, y); i++) {
      let t = this.getTile(x+i, y-i);
      moveSetTiles.push(t);
      if (t.piece !== undefined && t.piece.type === PIECETYPES.KING) break;
    }
    for (let i = 1; i <= Math.min(7 - x, 7 - y); i++) {
      let t = this.getTile(x+i, y+i);
      moveSetTiles.push(t);
      if (t.piece !== undefined && t.piece.type === PIECETYPES.KING) break;
    }
    for (let i = 1; i <= Math.min(x, 7 - y); i++) {
      let t = this.getTile(x-i, y+i);
      moveSetTiles.push(t);
      if (t.piece !== undefined && t.piece.type === PIECETYPES.KING) break;
    }

    for (let i = 1; i <= y; i++) {
      let t = this.getTile(x, y-i);
      moveSetTiles.push(t);
      if (t.piece !== undefined && t.piece.type === PIECETYPES.KING) break;
    }
    for (let i = 1; i <= 7 - x; i++) {
      let t = this.getTile(x+i, y);
      moveSetTiles.push(t);
      if (t.piece !== undefined && t.piece.type === PIECETYPES.KING) break;
    }
    for (let i = 1; i <= 7 - y; i++) {
      let t = this.getTile(x, y+i);
      moveSetTiles.push(t);
      if (t.piece !== undefined && t.piece.type === PIECETYPES.KING) break;
    }
    for (let i = 1; i <= x; i++) {
      let t = this.getTile(x-i, y);
      moveSetTiles.push(t);
      if (t.piece !== undefined && t.piece.type === PIECETYPES.KING) break;
    }

    return moveSetTiles;
  }

  reloadPage() {
    window.location.reload();
  }
}