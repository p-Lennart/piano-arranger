const AccompRhythm = require("./AccompRhythm");
const RhythmSequence = require("./RhythmSequence");

class AccompContour {

    constructor(value, subdivision=4) { // Init from string representation
        this.value = value;
        this.subdivision = subdivision; // Default value
    }

    static fromAccompRhythm(accompRhythm, value) {
        let downbeats = accompRhythm.getDownbeats();
        let upbeats = accompRhythm.getDownbeats(); 

        let resultValue = [];

        let pos = 0;
        for (let i = 0; i < accompRhythm.value.length; i++) {
            if (downbeats.includes(i)) {
                pos -= 1;
                if (pos < 0) {
                    pos = 0;
                }

                resultValue[i] = value[pos];
            } else if (upbeats.includes(i)) {
                pos += 1;
                resultValue[i] = value[pos];
            } else {
                pos += 1;
                resultValue[i] = value[pos];
                // resultValue[i] = NaN;
            }
        }

        return new AccompContour(resultValue, accompRhythm.subdivision);
    }

    toAccompRhythm() {
        let rhythmString = "d";
        let lastValue = this.value[0];

        for (let i = 1; i < this.value.length; i++) {
            lastValue = this.value[i - 1];
            if (this.value[i] - lastValue > 0) {
                rhythmString += "d";
            } else {
                rhythmString += "u";
            } 
        }

        return new AccompRhythm(rhythmString);
    }

    static presets = {
        "straight": [
            1, 2, 3, 4,
            5, 6, 7, 8,
            9, 10, 11, 12,
            13, 14, 15, 16,
        ],
        "staggered4": [
            1, 2, 3, 4,
            2, 3, 4, 5,
            3, 4, 5, 6,
            4, 5, 6, 7,
        ],
        "staggered5": [
            1, 2, 3, 4,
            5, 3, 4, 5,
            6, 4, 5, 6,
            7, 5, 6, 7,
        ],
        "unravelB": [
            1, 4, 3, 4,
            2, 3, 4, 5, 
            6, 4, 3, 4,
            2, 4, 3, 4,
        ],
        "unravelE": [
            1, 4, 3, 4,
            2, 6, 7, 8,
            11, 10, 9, 10,
            3, 8, 7, 8,
        ],
        "alberti": [
            1, 3, 2, 3,
            1, 3, 2, 3,
            1, 3, 2, 3,
            1, 3, 2, 3,
        ],
    }
    
}

module.exports = AccompContour;
