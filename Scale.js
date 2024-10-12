const Note = require("./Note");

const minorTransposes = new Map([
    [4, 3],
    [9, 8],
    [11, 10],
]);

const minSpacings = new Map([
    [new Note("A-1"), 12],
    [new Note("A1"), 8],
    [new Note("C2"), 2],
    [new Note("A3"), 0],
]);

class Scale {

    constructor(keyLabel, basis, minor=false) { // Init from string representation
        this.keyLabel = keyLabel;
        this.rootNote = new Note(this.keyLabel, -1);
        
        this.basis = [];
        this.minor = minor;
        this.setBasis(basis);

        this.span = [];
        this.setSpan();

        this.spacedSpan = [];
        this.setSpacedSpan();
    }

    static bases = {
        "major": [0, 2, 4, 5, 7, 9, 11],
        // minor [0, 2, 3, 5, 7, 8, 10],
        "add2": [0, 2, 4, 7],
        "pentatonic": [0, 2, 4, 7, 9],
        "blues": [0, 2, 3, 4, 7, 9],
    }

    setBasis(basis) {
        let result = [];

        // if (this.minor) {
        //     result = Array.from(minorTransposes.values());
        // }

        for (let component of basis) {
            let normalized = component % 12;

            if (minorTransposes.has(normalized)) {
                normalized = minorTransposes.get(normalized);
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
        let result = [this.span[0]];

        for (let i = 1; i < this.span.length; i++) {
            let lastNote = result[result.length - 1];
            let thisNote = this.span[i];

            let minSpacing = minSpacings.values[0];

            for (const [key, value] of minSpacings) {
                if (lastNote.compare(key) < 0) {
                    break;
                }
                minSpacing = value;
            }

            if (thisNote.compare(lastNote) >= minSpacing) {
                result.push(thisNote);
            }
        }

        this.spacedSpan = result;
    }

    getNoteLabels() {
        let sample = this.span.slice(0, this.basis.length);
        return sample.map(sampleNote => {
            return sampleNote.getNoteLabel(this.keyLabel, this.minor);
        });
    }

    nextNote(startNote) {
        return this.nextNoteByOffset(startNote, 1);
    }
    
    nextNoteByOffset(startNote, offset) {
        let pos = this.span.findIndex(spanNote => spanNote.getValue() === startNote.getValue());
        if (pos === -1) {
            return null;
        }
        pos = (pos + offset) % this.span.length;
        return this.span[pos];
    }

}

module.exports = Scale;
