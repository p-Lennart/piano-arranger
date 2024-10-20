const AccompRhythm = require("./AccompRhythm");
const RhythmSequence = require("./RhythmSequence");

class MelodyRhythm extends RhythmSequence {

    constructor(valueStr) {
        super(valueStr);
        this.strongbeats = this.getStrongbeats();
        this.weakbeats = this.getWeakbeats();
    }
    
    getStrongbeats() {
        return super.getBeats("s");
    }

    getWeakbeats() {
        return super.getBeats("w");
    }

    setStrongbeats(indices) {
        return super.setBeats("s", indices);
    }

    setWeakbeats(indices) {
        return super.setBeats("w", indices);
    }

    static presets = [
        "s-ww,s-s-,s-ws,-s-w",
    ];

    syncopatedAccomp() {
        let res = new AccompRhythm(
            this.toString().replaceAll("w", "-").replaceAll("s", "-")
        ); // Empty init string of same groupings

        res.setUpbeats(this.getRests());     // Fill rests with upbeats
        res.setUpbeats(this.getWeakbeats()); // Fill rests with upbeats
        res.setRests(this.getStrongbeats()); // Rest on strong beats
        res.setDownbeats([0]);               // Start with downbeat

        return res;
    }

    checkSpace(ind, includeWeak) {
        if (ind === 0) {
            return false;
        }
        
        if (includeWeak) {
            return !this.getStrongbeats().includes(ind) && !this.getWeakbeats().includes(ind);
        } else {
            return !this.getStrongbeats().includes(ind);
        }
        
    }

    synchronizedAccomp() {
        let res = new AccompRhythm(
            this.toString().replaceAll("w", "-").replaceAll("s", "-")
        ); // Empty init string of same groupings

        res.setRests(this.getWeakbeats()); // Rest during weak beats
        
        for (let ind of this.getStrongbeats()) { // Iterate backward through strong beats
            
            if (this.checkSpace(ind - 2)) { // Two-subbeat leadup (downbeat-upbeat) to upbeat, if applicable
                res.setDownbeats([ind - 2]);
                res.setUpbeats([ind - 1]);
            } else if (this.checkSpace(ind - 1)) { // One-subbeat leadup (downbeat) to upbeat, if applicable
                res.setDownbeats([ind - 1]);
            }

            res.setUpbeats([ind]); // Sync upbeat with strong beat in question
        }
    
        res.setDownbeats([0]) // Start with downbeat

        return res;
    }

}

module.exports = MelodyRhythm;


