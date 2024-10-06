class Scale {

    constructor(increments, minor) { // Init from string representation
        this.value = [];
        this.minor = false;
        if (minor) {
            this.minor = true;
        }
        
        for (let inc of increments) {
            if (!this.value.includes(inc % increments.length)) {
                this.value.push(inc);
            }
        }
    }

    static scales = {
        "major": new Scale([0, 2, 4, 5, 7, 9, 11]),
        "minor": new Scale([0, 2, 3, 5, 7, 8, 10], true),
    }

    nextInScale(startNote) {
        return this.nextWithInterval(startNote, 1);
    }

    nextWithInterval(startNote, interval, baseNote) {
        let scaleNotes = apply(baseNote);
        let pos = scaleNotes.findIndex(n => n.getValue === startNote.getValue);
        return new Note(scaleNotes[pos + interval]);
    }

    getNoteLabels(noteLabel) {
        let baseNote = new Note(noteLabel, -1);
        return this.value.map(absIncr => {
            return baseNote.increment(absIncr).getNoteLabel();
        });
    }
    
    apply(baseNote) {
        return this.value.map(absIncr => {
            return baseNote.increment(absIncr);
        });
    }

    applyAll(noteLabel) {
        let res = [];

        for (let oct = -1; oct <= 9; oct++) {
            let baseNote = new Note(noteLabel, -1);
            res.concat(apply(baseNote));
        }

        return res;
    }

}

module.exports = Scales;
