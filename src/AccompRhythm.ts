import MelodyRhythm from "MelodyRhythm";
import RhythmSequence from "./RhythmSequence";

const presets = [
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

export default class AccompRhythm extends RhythmSequence {
    downbeats: Array<number>;
    upbeats: Array<number>;

    constructor(data: string) {
        super(data);
        this.downbeats = (this.getDownbeats() as number[]);
        this.upbeats = (this.getUpbeats() as number[]);
    }

    getDownbeats() {
        return super.getBeats("d");
    }

    getUpbeats() {
        return super.getBeats("u");
    }

    setDownbeats(indices: Array<number>) {
        return super.setBeats("d", indices);
    }

    setUpbeats(indices: Array<number>) {
        return super.setBeats("u", indices);
    }

    static createEmpty(length: number, subdivision: number): AccompRhythm {
        let data = "";
        
        for (let i = 0; i < length; i++) {
            data += "-";
            if (i % subdivision === subdivision - 1 && i !== length - 1) {  // Seperate beats with comma
                data += ","
            }
        }
    
        return new AccompRhythm(data);
    }

    static syncopatedAccomp(mr: MelodyRhythm) {
        let res = AccompRhythm.createEmpty(mr.value.length, mr.subdivision); // Empty init string of same groupings

        res.setUpbeats(mr.getRests());     // Fill rests with upbeats
        res.setUpbeats(mr.getWeakbeats()); // Fill rests with upbeats
        res.setRests(mr.getStrongbeats()); // Rest on strong beats
        res.setDownbeats([0]);               // Start with downbeat

        return res;
    }

    static synchronizedAccomp(mr: MelodyRhythm) {
        let res = AccompRhythm.createEmpty(mr.value.length, mr.subdivision); // Empty init string of same groupings

        res.setRests(mr.getWeakbeats()); // Rest during weak beats
        
        for (let ind of mr.getStrongbeats()) { // Iterate backward through strong beats
            
            if (mr.checkSpace(ind - 2)) { // Two-subbeat leadup (downbeat-upbeat) to upbeat, if applicable
                res.setDownbeats([ind - 2]);
                res.setUpbeats([ind - 1]);
            } else if (mr.checkSpace(ind - 1)) { // One-subbeat leadup (downbeat) to upbeat, if applicable
                res.setDownbeats([ind - 1]);
            }

            res.setUpbeats([ind]); // Sync upbeat with strong beat in question
        }
    
        res.setDownbeats([0]) // Start with downbeat

        return res;
    }

    static getPresets(filterFn?: (ar: AccompRhythm) => boolean): AccompRhythm[] {
        let result = [];
        for (let arStr of presets) {
            let ar = new AccompRhythm(arStr);
            if (filterFn !== undefined && filterFn(ar)) {
                result.push(ar);
            }
        }
        return result;
    }

}
