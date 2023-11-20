export var PIECECOLORS: string[] = [];
PIECECOLORS[0b01000] = "white";
PIECECOLORS[0b10000] = "black";

export var PIECETYPES: string[] = [];
PIECETYPES[0b00001] = "pawn";
PIECETYPES[0b00010] = "knight";
PIECETYPES[0b00011] = "bishop";
PIECETYPES[0b00100] = "rook";
PIECETYPES[0b00101] = "queen";
PIECETYPES[0b00110] = "king";

export class Piece {
    id: number;

    touched: boolean = false; // for pawn first move checking
    enpassantable: boolean = false; // for pawn first move checking
    castlingable: boolean = false; // for king to decide if he can castle

    constructor(id: number) {
        this.id = id;
    }

    getUrl() {
        return `../assets/pieces/bitwise/${this.id}.svg`;
        // return `../assets/pieces/literal/${PIECETYPES[this.id & 0b00111]}-${PIECECOLORS[this.id & 0b11000][0]}.svg`;
    }
}