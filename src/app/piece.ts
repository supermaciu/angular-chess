export class Piece {
    type: string;
    color: string;

    constructor(type: string, color: string) {
        this.type = type;
        this.color = color;
    }

    getSVGUrl() {
        return "../assets/pieces/" + this.type + "-" + this.color + ".svg";
    }

    onClick() {
        console.log(`Clicked ${(this.color == "w") ? "white" : "black"} ${this.type} at xx`);
    }
}