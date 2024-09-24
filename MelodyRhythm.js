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

    synchronizedAccomp() {
        let resArr = this.value;
        
        for (let i = this.value.length - 1; i >= 0; i--) {
            if (this.value[i] === "s") {
                
                resArr[i] = "u"; // Upbeat on strong beats

                if (resArr[i - 1] && this.value[i - 1] !== "s") { // One-unit leadup (downbeat) to upbeat, if applicable
                    resArr[i - 1] = "d";
                }
                
                if (resArr[i - 2] && this.value[i - 2] !== "s") { // Two-unit leadup (downbeat-upbeat) to upbeat, if applicable
                    resArr[i - 2] = "d";
                    resArr[i - 1] = "u";
                }                
                
            } else if (resArr[i] === "w") { // Rest during weak beats
                resArr[i] = "-";
            }

        }
        
        resArr[0] = "d"; // Start with downbeat
        resArr[1] = "-"; // Leave gap after start downbeat

        let resVal = RhythmPattern.stringify(resArr, this.groupSize);
        let res = new AccompRhythm(resVal);
        return res;
    }

}

module.exports = MelodyRhythm;


