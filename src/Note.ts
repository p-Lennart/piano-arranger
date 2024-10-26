const noteChars: [string, number][] = [
    ["C", 0],
    ["D", 2],
    ["E", 4],
    ["F", 5],
    ["G", 7],
    ["A", 9],
    ["B", 11],
];

const accidentalPerKey = {
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

export default class Note {
    value: number;
    preferredKeyLabel: string;

    constructor(data: number | string, keylabel?: string) { // Init from string representation
        this.value = 21; // Default value A0
        this.preferredKeyLabel = "C"; // Default value C major
        
        if (keylabel !== undefined) {
            this.preferredKeyLabel = keylabel;
        }
        
        if (typeof data === "number") {
            this.fromValue(data);
        } else {
            this.fromString(data);
        }

    }

    fromString(data: string) {
        let octInd = 1;
        if (data.includes("#") || data.includes("b")) {
            octInd = 2;
        }
        this.fromLabelOctave(data.slice(0, octInd),
            parseInt(data.slice(octInd)));
    }
    
    fromLabelOctave(label: string, octave: number) {
        let noteChar = label.slice(0, 1);
        
        let found = noteChars.find(pair => pair[0] === noteChar);
        if (typeof found === undefined) {
            throw new Error(`Could not find offset for ${noteChar}!`);
        } else {
            found = (found as [string, number]);
        }

        let res = found[1] + (octave + 1) * 12; // Account for -1 octave
        
        if (label.slice(1, 2) === "#") {
            res += 1;
        } else if (label.slice(1, 2) === "b") {
            res -= 1;
        }

        this.fromValue(res);
    }

    fromValue(noteValue: number) {
        this.value = noteValue;
    }

    toString(keyLabel?: string) {
        let noteLabel = this.getNoteLabel(keyLabel);
        if (!noteLabel) {
            return null;
        }
        return noteLabel + this.getOctave();
    }
    
    transpose(interval: number) {
        let result = new Note(this.value + interval);
        result.setPreferredKeyLabel(this.preferredKeyLabel);
        return result;
    }

    compare(note: Note) {
        return this.value - note.value;
    }
    
    setPreferredKeyLabel(keyLabel: string) {
        this.preferredKeyLabel = keyLabel;
    }

    getValue() {
        return this.value;
    }
    
    getNoteLabel(keyLabel?: string) { // Takes key note char
        let normalized = this.value % 12;
        let closest = this.findClosestNotes(normalized);

        if (!closest) {
            return null;
        }
        
        if (closest.length > 1) {
            if (!keyLabel) {
                keyLabel = this.preferredKeyLabel;
            }

            let keyIsMinor = keyLabel.endsWith("m");
            if (keyIsMinor) {
                keyLabel = keyLabel.slice(0, -1);
            }

            let keyAccInd = Object.keys(accidentalPerKey).indexOf(keyLabel);
            if (keyIsMinor) {
                keyAccInd = (keyAccInd + 3) % Object.keys(accidentalPerKey).length;
            }

            if (Object.values(accidentalPerKey)[keyAccInd] === "b") {
                return `${closest[1]}b`;
            } else {
                return `${closest[0]}#`;
            }
        }
        
        return closest[0];
    }

    getOctave() {
        return Math.floor(this.value / 12) - 1;
    }

    findClosestNotes(valueNormalized: number) {
        for (let i = 0; i < noteChars.length; i++) {
            let before = (noteChars[i] as [string, number]);
            let after = (noteChars[i + 1] as [string, number]);

            if (valueNormalized === before[1]) {
                return before[0];
            } else if (i >= noteChars.length - 1 || 
                valueNormalized > before[1] && valueNormalized < after[1]) {
                return [
                    before[0],
                    after[0],
                ];
            }
        }

        return null;
    }
}
