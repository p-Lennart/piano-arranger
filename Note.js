const conventions = require('./NoteConventions.js');

class Note {

    constructor(input) { // Init from string representation
        this.value = 21; // Default value A0
        
        if (typeof input === "number") {
            this.value = input;
        } else {
            this.fromString(input);
        }
    }

    fromString(noteString) {
        let template = conventions.note("A", -1);
        let ind1 = template.indexOf("A");
        let ind2 = template.indexOf("-1");
        
        let offset = 0;

        let noteChar = noteString.slice(ind1, ind1 + 1);
        if (noteString.includes(conventions.sharp(noteChar))) {
            offset = 1;
        } else if (noteString.includes(conventions.flat(noteChar))) {
            offset = -1;
        }

        let res = conventions.noteChars[noteChar];

        let octave = parseInt(noteString.slice(ind2));
        res += (octave + 1) * 12; // Account for -1 octave
        res += offset;

        this.value = res;
    }

    toString(scaleArr) {
        return conventions.note(this.getNoteLabel(scaleArr), this.getOctave());
    }

    getOctave() {
        return Math.floor(this.value / 12) - 1;
    }

    getNoteLabel(scaleNote) { // Takes scale string
        let normalized = this.value % 12;
        let closest = this.findClosestNotes(normalized);
        
        if (closest.length > 1) {
            let sharped = conventions.sharp(closest[0]);
            let flatted = conventions.flat(closest[1]);
            
            let scaleArr = conventions.scale(scaleNote);
            if (scaleArr.includes(flatted)) {
                return flatted;
            } else {
                return sharped;
            }
        }
        
        return closest[0];
    }

    findClosestNotes(normalizedValue) {
        let labelEntries = Object.entries(conventions.noteChars);

        for (let i = 0; i < labelEntries.length; i++) {
            if (normalizedValue === labelEntries[i][1]) {
                return labelEntries[i][0];
            } else if (i >= labelEntries.length - 1 || 
                normalizedValue > labelEntries[i][1] && normalizedValue < labelEntries[i + 1][1]) {
                return [
                    labelEntries[i][0],
                    labelEntries[i + 1][0],
                ];
            }
        }

        return null;
    }
}

module.exports = Note;
