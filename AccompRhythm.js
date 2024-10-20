const RhythmSequence = require("./RhythmSequence");

class AccompRhythm extends RhythmSequence {

    constructor(valueStr) {
        super(valueStr);
        this.downbeats = this.getDownbeats();
        this.upbeats = this.getUpbeats();
    }

    getDownbeats() {
        return super.getBeats("d");
    }

    getUpbeats() {
        return super.getBeats("u");
    }

    setDownbeats(indices) {
        return super.setBeats("d", indices);
    }

    setUpbeats(indices) {
        return super.setBeats("u", indices);
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
