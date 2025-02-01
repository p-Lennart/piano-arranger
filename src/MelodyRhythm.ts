import RhythmicSequence, { SequenceItem, SequenceReference } from "abstract/RhythmicSequence";
import Fraction from "common/Fraction";
import NoteSequence from "NoteSqeuence";
import { createSolutionBuilder } from "typescript";

const REST_LABEL = "-";
const SUBDIV_LABEL = ",";
const STRONG_BEAT_LABEL = "s";
const WEAK_BEAT_LABEL = "w";

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
    static REST: MelRhySeqItem = null;
    static STRONG_BEAT = new MelRhySeqItem(STRONG_BEAT_LABEL);
    static WEAK_BEAT = new MelRhySeqItem(WEAK_BEAT_LABEL);

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
        subdurations = subdivisions.map(n => n / items.length);

        return new MelodyRhythm(items, subdivisions, subdurations);
    }

    static getPresets(filterFn?: (mr: MelodyRhythm) => boolean): MelodyRhythm[] {
        let result: MelodyRhythm[] = [];
        
        for (let arStr of presets) {
            let ar = MelodyRhythm.fromString(arStr);
            if (filterFn !== undefined && filterFn(ar)) {
                result.push(ar);
            }
        }
        
        return result;
    }

    static fromMelodyNotes(melody: NoteSequence): MelodyRhythm {
        let result = MelodyRhythm.createEmpty(melody.subdivisions, melody.subdurations);

        for (let slice of melody) {
            let newContent: MelRhySeqItem[];

            let unitSize = slice.subduration.divide(slice.subdivision);
            if (unitSize.evaluate() < 1/8) {  // Shorter notes are weak
                newContent = slice.content.map(() => MelodyRhythm.WEAK_BEAT);
            } else {
                newContent = slice.content.map(() => MelodyRhythm.STRONG_BEAT);
            }

            result.setSlice(newContent, slice.index);   
        }

        return result;
    }

}


