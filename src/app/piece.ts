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

    constructor(id: number) {
        this.id = id;
    }

    getUrl() {
        return `../assets/pieces/bitwise/${this.id}.svg`;
    }
}