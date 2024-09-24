const RhythmPattern = require("./RhythmPattern");

class AccompRhythm extends RhythmPattern {

    constructor(valueStr) {
        super(valueStr);
        this.downbeats = this.getDownbeats();
        this.upbeats = this.getUpbeats();
    }

    getDownbeats() {
        return this.beatmap["d"];
    }

    getUpbeats() {
        return this.beatmap["u"];
    }

    static presets = [
        "d---,u-d-,--d-,u---",
        "d---,d-u-,--d-,u---",
        "d---,u-u-,d---,u-u-",
        "d-u-,u-u-,u-u-,u-u-",
        "du-u,-u-u,-u-u,-u-u",
        "d---,--d-,u---,u---",
        "d--d,--d-,u---,----",
        "d--u,--u-,d--u,--u-",
        "d--d,--d-,-d--,dudu",
        "d---,u--d,--d-,u---",
    ];

}

module.exports = AccompRhythm;
