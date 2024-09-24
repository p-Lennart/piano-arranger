const AccompRhythm = require("./AccompRhythm");
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

    syncopatedAccomp() {
        let resVal = this.toString();
        
        resVal = resVal.replaceAll("-", "u"); // Fill rests with upbeats
        resVal = resVal.replaceAll("w", "u"); // Fill weak beats with upbeats
        resVal = resVal.replaceAll("s", "-"); // Rest on strong beats
        
        resVal = "d" + resVal.slice(1); // Start with downbeat

        let res = new AccompRhythm(resVal);
        return res;
    }

}

module.exports = MelodyRhythm;


