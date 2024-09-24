const RhythmPattern = require("./RhythmPattern");

class MelodyRhythm extends RhythmPattern {

    constructor(valueStr) {
        super(valueStr);
        this.strongbeats = this.getStrongbeats();
        this.weakbeats = this.getWeakbeats();
    }
    
    getStrongbeats() {
        return this.beatmap["s"];
    }

    getWeakbeats() {
        return this.beatmap["w"];
    }

    static presets = [
        "s-ww,s-s-,s-ws,-s-w",
    ];

}

module.exports = MelodyRhythm;


