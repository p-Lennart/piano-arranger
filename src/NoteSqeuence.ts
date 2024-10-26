import Note from "./Note";

export default class NoteSequence {
    contents: (Note | null)[][];
    subdivisions: number[];
    length: number;

    constructor() { // noteArray: Array<Note> 
        this.contents = [];
        this.subdivisions = [];

        this.length = 0;
    }

    // append(noteSeq: NoteSequence) {
    //     for (let i = 0; i < noteSeq.contents.length; i++) {
    //         this.contents.push(noteSeq.contents[i] as Note[]);
    //         this.subdivisions.push(noteSeq.subdivisions[i] as number);
    //         this.length += (noteSeq.contents[i] as Note[]).length * (noteSeq.subdivisions[i] as number);
    //     }
    // }

    append(noteArr: (Note | null)[]) {
        if (noteArr.length > 0) {
            this.contents = this.contents.concat(noteArr);
            this.subdivisions.push(noteArr.length);
            this.length += 1;
        }
    }

    toMIDI() {
        
    }
}