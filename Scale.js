const Note = require("./Note");

class Scale {

    constructor(keyLabel, basis, minor) { // Init from string representation
        this.basis = [];
        this.minor = minor && minor === true;

        this.keyLabel = keyLabel;
        this.rootNote = new Note(this.keyLabel, -1);

        for (let component of basis) {
            if (!this.basis.includes(component % 12)) {
                this.basis.push(component);
            }
        }

        this.span = [];
        for (let oct = -1; oct <= 9; oct++) {
            for (let component of this.basis) {
                let octaveShift = (oct + 1) * 12;
                
                let componentNote = this.rootNote.transpose(component + octaveShift);
                this.span.push(componentNote);
            }
        }
    }

    static bases = {
        "major": [0, 2, 4, 5, 7, 9, 11],
        "minor": [0, 2, 3, 5, 7, 8, 10],
        "pentatonic": [0, 2, 4, 7, 9],
        "blues": [0, 3, 5, 6, 7, 10],
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
