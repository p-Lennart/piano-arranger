function sharp(label) {
    return `${label}#`;
}

function flat(label) {
    return `${label}b`;
}

let noteChars = { // Octave -1
    "C": 0,
    "D": 2,
    "E": 4,
    "F": 5,
    "G": 7,
    "A": 9,
    "B": 11,
}

let accidentalPerKey = {
    "C": "#",
    "Db": "b",
    "D": "#",
    "Eb": "b",
    "E": "#",
    "F": "#",
    "F#": "#",
    "G": "#",
    "Ab": "b",
    "A": "#",
    "Bb": "b",
    "B": "#",
}

class Note {

    constructor(input, secondary) { // Init from string representation
        this.value = 21; // Default value A0
        
        if (secondary) {
            this.fromNoteOctave(input, secondary);
        } else {
            if (typeof input === "number") {
                this.fromValue(input);
            } else {
                this.fromString(input);
            }
        }
    }

    fromString(noteString) {
        let octInd = 1;
        if (["#", "b"].includes(noteString)) {
            octInd = 2;
        }
        this.fromNoteOctave(noteString.slice(0, octInd),
            parseInt(noteString.slice(octInd)));
    }
    
    fromNoteOctave(noteLabel, octave) {
        let noteChar = noteLabel.slice(0, 1);
        
        let res = noteChars[noteChar];
        res += (octave + 1) * 12; // Account for -1 octave
        
        if (noteLabel.slice(1, 2) === "#") {
            res += 1;
        } else if (noteLabel.slice(1, 2) === "b") {
            res -= 1;
        }

        this.fromValue(res);
    }

    fromValue(noteValue) {
        this.value = noteValue;
    }

    toString(key) {
        return this.getNoteLabel(key) + this.getOctave();
    }
    
    transpose(interval) {
        return new Note(this.value + interval);
    }

    compare(note) {
        return this.value - note.value;
    }
    
    getValue() {
        return this.value;
    }
    
    getNoteLabel(key, minor) { // Takes key note char
        let normalized = this.value % 12;
        let closest = this.findClosestNotes(normalized);
        
        if (closest.length > 1) {
            let keyAccInd = Object.keys(accidentalPerKey).indexOf(key);

            if (minor) {
                keyAccInd = (keyAccInd + 3) % Object.keys(accidentalPerKey).length;
            }

            if (Object.values(accidentalPerKey)[keyAccInd] === "b") {
                return flat(closest[1]);
            } else {
                return sharp(closest[0]);
            }
        }
        
        return closest[0];
    }

    getOctave() {
        return Math.floor(this.value / 12) - 1;
    }

    findClosestNotes(normalizedValue) {
        let labelEntries = Object.entries(noteChars);

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
