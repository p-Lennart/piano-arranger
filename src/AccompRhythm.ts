import RhythmicSequence, { SequenceItem, SequenceReference } from "abstract/RhythmicSequence";
import MelodyRhythm from "MelodyRhythm";

const REST_LABEL = "-";
const SUBDIV_LABEL = ","; 
const DOWN_BEAT_LABEL = "d";
const UP_BEAT_LABEL = "u";

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

class AccRhySeqItem implements SequenceItem {
    label: string;

    constructor(data: string) {
        this.label = data;
    } 

    toString(): string {
        return this.label;
    }
}

export default class AccompRhythm extends RhythmicSequence<AccRhySeqItem> {
    static REST: AccRhySeqItem = null;
    static DOWN_BEAT = new AccRhySeqItem(DOWN_BEAT_LABEL);
    static UP_BEAT = new AccRhySeqItem(UP_BEAT_LABEL);

    static syncopatedAccomp(mr: MelodyRhythm): AccompRhythm {
        let res = AccompRhythm.createEmpty(mr.subdivisions, mr.subdurations);  // Empty init string of same groupings

        res.bulkSet(AccompRhythm.DOWN_BEAT, mr.bulkGet(MelodyRhythm.REST));     // Fill rests with upbeats
        res.bulkSet(AccompRhythm.UP_BEAT, mr.bulkGet(MelodyRhythm.WEAK_BEAT));  // Fill weak beats with upbeats
        res.bulkSet(AccompRhythm.REST, mr.bulkGet(MelodyRhythm.STRONG_BEAT));  // Rest on strong beats
        res.setItem(AccompRhythm.DOWN_BEAT, { out: 0, inn: 0 });  // Start with downbeat

        return res;
    }

    static synchronizedAccomp(mr: MelodyRhythm) {
        let res = AccompRhythm.createEmpty(mr.subdivisions, mr.subdurations);  // Empty init string of same groupings
        
        // res.setRests(mr.getWeakbeats()); // Rest during weak beats
        
        for (let ref of mr.bulkGet(MelodyRhythm.STRONG_BEAT)) { // Iterate backward through strong beats
            if (mr.checkSpace(ref, -2, [MelodyRhythm.STRONG_BEAT])) { // Two-subbeat leadup (downbeat-upbeat) to upbeat, if applicable
                res.setItem(AccompRhythm.DOWN_BEAT, mr.incRef(ref, -2))
                res.setItem(AccompRhythm.UP_BEAT, mr.incRef(ref, -1))
            } else if (mr.checkSpace(ref, -1), [MelodyRhythm.STRONG_BEAT]) { // One-subbeat leadup (downbeat) to upbeat, if applicable
                res.setItem(AccompRhythm.DOWN_BEAT, mr.incRef(ref, -1))
            }

            res.setItem(AccompRhythm.UP_BEAT, ref); // Sync upbeat with strong beat in question
        }
    
        res.setItem(AccompRhythm.DOWN_BEAT, { out: 0, inn: 0 }); // Start with downbeat

        return res;
    }

    static fromString(data: string) {
        let items = [];
        let subdivisions = [];
        
        let subInd = 0;
        let subDiv = 0;
        
        for (let c of data) {
            switch (c) {
                case DOWN_BEAT_LABEL: 
                    items.push(this.DOWN_BEAT);
                    subDiv += 1;
                    break;
                case UP_BEAT_LABEL:
                    items.push(this.UP_BEAT);
                    subDiv += 1;
                    break;
                case REST_LABEL:
                    items.push(null);
                    subDiv += 1;
                    break;
                case SUBDIV_LABEL:
                    subdivisions[subInd] = subDiv;
                    subInd += 1;
                    subDiv = 0;
            }
        }
        
        subdivisions[subInd] = subDiv;

        return new AccompRhythm(items, subdivisions);
    }

    static getPresets(filterFn?: (ar: AccompRhythm) => boolean): AccompRhythm[] {
        let result = [];
        for (let arStr of presets) {
            let ar = AccompRhythm.fromString(arStr);
            if (filterFn !== undefined && filterFn(ar)) {
                result.push(ar);
            }
        }

        return result;
    }

}
