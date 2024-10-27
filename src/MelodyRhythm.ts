import RhythmicSequence, { SequenceItem, SequenceReference } from "abstract/RhythmicSequence";
import NoteSequence from "NoteSqeuence";

const presets = [
    "s-ww,s-s-,s-ws,-s-w",
];


class MelRhySeqItem implements SequenceItem {
    label: string;

    constructor(data: string) {
        this.label = data;
    } 

    toString(): string {
        return this.label;
    }
}

export default class MelodyRhythm extends RhythmicSequence<MelRhySeqItem> {
    static REST_LABEL = "-";
    static SUBDIV_LABEL = ",";
    static STRONG_BEAT = new MelRhySeqItem("s");
    static WEAK_BEAT = new MelRhySeqItem("w");

    setStrongbeat(ref: SequenceReference) {
        return super.setItem(ref, MelodyRhythm.STRONG_BEAT);
    }

    setWeakbeat(ref: SequenceReference) {
        return super.setItem(ref, MelodyRhythm.WEAK_BEAT);
    }
    
    getStrongbeats() {
        return super.bulkGet(MelodyRhythm.STRONG_BEAT);
    }

    getWeakbeats() {
        return super.bulkGet(MelodyRhythm.WEAK_BEAT);
    }

    setStrongbeats(refs: SequenceReference[]) {
        return super.bulkSet(MelodyRhythm.STRONG_BEAT, refs);
    }

    setWeakbeats(refs: SequenceReference[]) {
        return super.bulkSet(MelodyRhythm.WEAK_BEAT, refs);
    }

    static createEmpty(subdivisions: number[], subdurations: number[]): MelodyRhythm {
        let items = [] as null[];
        for (let sd of subdivisions) {
            items.concat(Array(sd).fill(null));
        }

        return new MelodyRhythm(items, subdivisions, subdurations);
    }

    static fromString(data: string) {
        let items = [];
        let subdivisions = [];
        let subdurations = [];
        
        let subInd = 0;
        let subDiv = 0;
        
        for (let c of data) {
            switch (c) {
                case this.STRONG_BEAT.toString(): 
                    items.push(this.STRONG_BEAT);
                    subDiv += 1;
                    break;
                case this.WEAK_BEAT.toString():
                    items.push(this.WEAK_BEAT);
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
        subdurations = subdivisions.map(n => { return n / items.length });

        return new MelodyRhythm(items, subdivisions, subdurations);
    }

    static getPresets(filterFn?: (mr: MelodyRhythm) => boolean): MelodyRhythm[] {
        let result = [];
        for (let arStr of presets) {
            let ar = MelodyRhythm.fromString(arStr);
            if (filterFn !== undefined && filterFn(ar)) {
                result.push(ar);
            }
        }
        
        return result;
    }

    // static parseMelody(melody: NoteSequence): MelodyRhythm[] {
    //     let result = [] as MelodyRhythm[];
    //     for (let i = 0; i < melody.contents.length; i++) {
    //         result[i] = MelodyRhythm.createEmpty(melody.contents[i].length, melody.subdivisions[i])
    //     }
    // }

}


