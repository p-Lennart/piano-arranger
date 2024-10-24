import RhythmSequence from "./RhythmSequence";
import AccompRhythm from "./AccompRhythm";

export default class MelodyRhythm extends RhythmSequence {
    strongbeats: Array<number>;
    weakbeats: Array<number>;

    constructor(valueStr: string) {
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

    setStrongbeats(indices: Array<number>) {
        return super.setBeats("s", indices);
    }

    setWeakbeats(indices: Array<number>) {
        return super.setBeats("w", indices);
    }

    static createEmpty(length: number, subdivision: number): MelodyRhythm {
        let data = "";
        
        for (let i = 0; i < length; i++) {
            data += "-";
            if (i % subdivision === subdivision - 1 && i !== length - 1) {  // Seperate beats with comma
                data += ","
            }
        }
    
        return new MelodyRhythm(data);
    }


    static presets = [
        "s-ww,s-s-,s-ws,-s-w",
    ];

    syncopatedAccomp() {
        let res = AccompRhythm.createEmpty(this.value.length, this.subdivision); // Empty init string of same groupings

        res.setUpbeats(this.getRests());     // Fill rests with upbeats
        res.setUpbeats(this.getWeakbeats()); // Fill rests with upbeats
        res.setRests(this.getStrongbeats()); // Rest on strong beats
        res.setDownbeats([0]);               // Start with downbeat

        return res;
    }

    checkSpace(index: number, includeWeak?: boolean) {
        if (index === 0) {
            return false;
        }
        
        if (includeWeak) {
            return !this.getStrongbeats().includes(index) && !this.getWeakbeats().includes(index);
        } else {
            return !this.getStrongbeats().includes(index);
        }
        
    }

    synchronizedAccomp() {
        let res = AccompRhythm.createEmpty(this.value.length, this.subdivision); // Empty init string of same groupings

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


