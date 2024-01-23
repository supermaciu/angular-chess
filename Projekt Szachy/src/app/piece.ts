export enum PIECECOLORS {
    WHITE = 0b01000,
    BLACK = 0b10000
}

export enum PIECETYPES {
    // NONE = 0b00000,
    PAWN = 0b00001,
    KNIGHT = 0b00010,
    BISHOP = 0b00011,
    ROOK = 0b00100,
    QUEEN = 0b00101,
    KING = 0b00110
}

export var PIECECOLORSSTRING: string[] = [];
PIECECOLORSSTRING[PIECECOLORS.WHITE] = "white";
PIECECOLORSSTRING[PIECECOLORS.BLACK] = "black";

export var PIECETYPESSTRING: string[] = [];
PIECETYPESSTRING[PIECETYPES.PAWN] = "pawn";
PIECETYPESSTRING[PIECETYPES.KNIGHT] = "knight";
PIECETYPESSTRING[PIECETYPES.BISHOP] = "bishop";
PIECETYPESSTRING[PIECETYPES.ROOK] = "rook";
PIECETYPESSTRING[PIECETYPES.QUEEN] = "queen";
PIECETYPESSTRING[PIECETYPES.KING] = "king";

export class Piece {
    readonly color: number;
    readonly type: number;
    readonly id: number;

    touched: boolean = false; // for pawn first move checking
    enpassantable: boolean = false; // for pawn first move checking
    castlingable: boolean = false; // for king to decide if he can castle

    constructor(color: number, type: number) {
        this.color = color;
        this.type = type;
        this.id = this.color | this.type;
    }

    getUrl() {
        return `assets/pieces/${PIECETYPESSTRING[this.type]}-${PIECECOLORSSTRING[this.color]}.svg`;
    }
}