import Note from "./Note";

const minorTransposes = new Map([
    [4, 3],
    [9, 8],
    [11, 10],
]);

const spanSpacings: [boolean, number][] = [
    [false, 0],  // Octave -1: no fifth, no "close notes"
    [false, 0],  // Octave 0: no fifth, no "close notes"
    [false, 0],  // Octave 1: no fifth, no "close notes"
    [true, 0],  // Octave 2: use fifth, no "close notes"
    [true, 2],  // Octave 3: use fifth, two "close notes"
    [true, 3],  // Octave 4: use fifth, three "close notes"
    [true, 4],  // Octave 5: use fifth, four "close notes"
    [true, 10],  // Octave 6: use fifth, ten "close notes"
    [true, 12],  // Octave 7: use fifth, twelve "close notes"
    [true, 12],  // Octave 8: use fifth, twelve "close notes"
    [true, 12],  // Octave 9: use fifth, twelve "close notes"
];

export default class Scale {
    keyLabel: string;
    minor: boolean;
    basis: Array<number>;
    rootNote: Note;
    span: Array<Note>;
    spacedSpan: Array<Note>;

    constructor(keyLabel: string, basis: Array<number>) { // Init from string representation
        this.keyLabel = keyLabel;
        this.minor = keyLabel.endsWith("m");

        let noteLabel = keyLabel;
        if (this.minor) {
            noteLabel = keyLabel.slice(0, -1);
        }

        this.rootNote = new Note(noteLabel + "-1");
        this.rootNote.setPreferredKeyLabel(keyLabel);

        this.basis = [];
        this.setBasis(basis);

        this.span = [];
        this.setSpan();

        this.spacedSpan = [];
        this.setSpacedSpan();
    }

    static bases = {
        "major": [0, 2, 4, 5, 7, 9, 11],
        // minor [0, 2, 3, 5, 7, 8, 10],
        "7th": [0, 4, 7, 10],
        "add2": [0, 2, 4, 7],
        "pentatonic": [0, 2, 4, 7, 9],
        "blues": [0, 2, 3, 4, 7, 9],
    }

    setBasis(basis: Array<number>) {
        let result: Array<number> = [];

        // if (this.minor) {
        //     result = Array.from(minorTransposes.values());
        // }

        for (let component of basis) {
            let normalized = component % 12;

            if (this.minor && minorTransposes.has(normalized)) {
                normalized = (minorTransposes.get(normalized) as number);
            }
            
            if (!result.includes(normalized)) {
                result.push(normalized);
            }
        }
        
        this.basis = result.sort((a, b) => (a - b));
    }

    setSpan() {
        let result = [];

        for (let oct = -1; oct <= 9; oct++) {
            for (let component of this.basis) {
                let octaveShift = (oct + 1) * 12;
                
                let componentNote = this.rootNote.transpose(component + octaveShift);
                result.push(componentNote);
            }
        }

        this.span = result;
    }

    setSpacedSpan() {
        let result = [];

        for (let oct = -1; oct <= 9; oct++) {
            let octaveShift = (oct + 1) * 12
            
            let [useFifth, closeNotes] = (spanSpacings[oct + 1] as [boolean, number]);

            let thisNote = this.rootNote.transpose((this.basis[0] as number) + octaveShift);
            result.push(thisNote);

            for (let i = 1; i < this.basis.length; i++) {    
                thisNote = this.rootNote.transpose((this.basis[i] as number) + octaveShift);            
                
                if (useFifth && this.basis[i] == 7) {
                    result.push(thisNote);
                } else if (closeNotes > 0) {
                    result.push(thisNote);
                    closeNotes -= 1;   
                }
            }
        }

        this.spacedSpan = result;
    }

    getNoteLabels() {
        let sample = this.span.slice(0, this.basis.length);
        return sample.map(sampleNote => {
            return sampleNote.getNoteLabel(this.keyLabel);
        });
    }

    nextNote(startNote: Note) {
        return this.nextNoteByOffset(startNote, 1);
    }
    
    nextNoteByOffset(startNote: Note, offset: number) {
        let pos = this.span.findIndex(spanNote => spanNote.getValue() === startNote.getValue());
        if (pos === -1) {
            return null;
        }
        pos = (pos + offset) % this.span.length;
        return this.span[pos];
    }

}
