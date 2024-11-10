import RhythmicSequence, { SequenceItem, SequenceReference } from "abstract/RhythmicSequence";
import MelodyRhythm from "MelodyRhythm";

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
    static REST_LABEL = "-";
    static SUBDIV_LABEL = ",";
    static DOWN_BEAT = new AccRhySeqItem("d");
    static UP_BEAT = new AccRhySeqItem("u");

    setDownbeat(ref: SequenceReference) {
        return super.setItem(ref, AccompRhythm.DOWN_BEAT);
    }

    setUpbeat(ref: SequenceReference) {
        return super.setItem(ref, AccompRhythm.UP_BEAT);
    }
    
    getDownbeats() {
        return super.bulkGet(AccompRhythm.DOWN_BEAT);
    }

    getUpbeats() {
        return super.bulkGet(AccompRhythm.UP_BEAT);
    }

    setDownbeats(refs: SequenceReference[]) {
        return super.bulkSet(AccompRhythm.DOWN_BEAT, refs);
    }

    setUpbeats(refs: SequenceReference[]) {
        return super.bulkSet(AccompRhythm.UP_BEAT, refs);
    }

    static createEmpty(subdivisions: number[], subdurations?: any[]): AccompRhythm {
        let items = [];
        let index = 0;

        for (let sd of subdivisions) {
            for (let i = 0; i < sd; i++) {
                items[index] = null;
                index += 1;
            }
        }

        return new AccompRhythm(items, subdivisions, subdurations);
    }

    static syncopatedAccomp(mr: MelodyRhythm) {
        let res = AccompRhythm.createEmpty(mr.subdivisions, mr.subdurations);  // Empty init string of same groupings

        res.setUpbeats(mr.getRests());     // Fill rests with upbeats
        res.setUpbeats(mr.getWeakbeats()); // Fill rests with upbeats
        res.setRests(mr.getStrongbeats()); // Rest on strong beats
        res.setItem({ out: 0, inn: 0 }, AccompRhythm.DOWN_BEAT); // Start with downbeat

        return res;
    }

    static synchronizedAccomp(mr: MelodyRhythm) {
        let res = AccompRhythm.createEmpty(mr.subdivisions, mr.subdurations);  // Empty init string of same groupings
        
        // res.setRests(mr.getWeakbeats()); // Rest during weak beats
        
        for (let ref of mr.getStrongbeats()) { // Iterate backward through strong beats
            if (mr.checkSpace(ref, -2, [MelodyRhythm.STRONG_BEAT])) { // Two-subbeat leadup (downbeat-upbeat) to upbeat, if applicable
                res.setDownbeat(mr.incRef(ref, -2))
                res.setUpbeat(mr.incRef(ref, -1))
            } else if (mr.checkSpace(ref, -1), [MelodyRhythm.STRONG_BEAT]) { // One-subbeat leadup (downbeat) to upbeat, if applicable
                res.setDownbeat(mr.incRef(ref, -1))
            }

            res.setUpbeat(ref); // Sync upbeat with strong beat in question
        }
    
        res.setDownbeat({ out: 0, inn: 0 }); // Start with downbeat

        return res;
    }

    static fromString(data: string) {
        let items = [];
        let subdivisions = [];
        
        let subInd = 0;
        let subDiv = 0;
        
        for (let c of data) {
            switch (c) {
                case this.DOWN_BEAT.toString(): 
                    items.push(this.DOWN_BEAT);
                    subDiv += 1;
                    break;
                case this.UP_BEAT.toString():
                    items.push(this.UP_BEAT);
                    subDiv += 1;
                    break;
                case this.REST_LABEL:
                    items.push(null);
                    subDiv += 1;
                    break;
                case this.SUBDIV_LABEL:
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
