const AccompRhythm = require("./AccompRhythm");
const RhythmPattern = require("./rhythmPattern");

class AccompContour {

    constructor(value) { // Init from string representation
        this.value = value;
        this.beatmap = {};
        this.groupSize = 4; // Default value
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

    // applyScale(scale) {
    //     let 
    // }

    static presets = {
        "straight": [
            1, 2, 3, 4,
            5, 6, 7, 8,
            9, 10, 11, 12,
            13, 14, 15, 16,
        ],
        "staggeredDB": [
            1, 2, 3, 4,
            2, 3, 4, 5,
            3, 4, 5, 6,
            4, 5, 6, 7,
        ],
        "staggeredUB": [
            1, 2, 3, 4,
            5, 3, 4, 5,
            6, 4, 5, 6,
            7, 5, 6, 7,
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
