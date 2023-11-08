export enum PieceColor {
    WHITE = 8, // 0x01000
    BLACK = 16 // 0x10000
}

export enum PieceType {
    // NONE = 0, // 0x00000
    PAWN = 1, // 0x00001
    KNIGHT = 2, // 0x00010
    BISHOP = 3, // 0x00011
    ROOK = 4, // 0x00100
    QUEEN = 6, // 0x00110
    KING = 7 // 0x00111
}

// PieceType | PieceType => 0x00000 example: WHITE | QUEEN => 0x01110

export class Piece {
    color: PieceColor;
    type: PieceType;

    constructor(color: PieceColor, type: PieceType) {
        this.type = type;
        this.color = color;
    }

    getSVGUrl() {
        return `../assets/pieces/bitwise/${this.type | this.color}.svg`;
    }
}