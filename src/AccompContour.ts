import RhythmicSequence from "abstract/RhythmicSequence";
import AccompRhythm from "./AccompRhythm";
import Fraction from "common/Fraction";
import Note from "Note";

const presets = {
    "straight": [
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16,
    ],
    "staggered4": [
        1, 2, 3, 4,
        2, 3, 4, 5,
        3, 4, 5, 6,
        4, 5, 6, 7,
    ],
    "staggered5": [
        1, 2, 3, 4,
        5, 3, 4, 5,
        6, 4, 5, 6,
        7, 5, 6, 7,
    ],
    "unravelB": [
        1, 4, 3, 4,
        2, 3, 4, 5, 
        6, 4, 3, 4,
        2, 4, 3, 4,
    ],
    "unravelE": [
        1, 4, 3, 4,
        2, 6, 7, 8,
        11, 10, 9, 10,
        3, 8, 7, 8,
    ],
    "alberti": [
        1, 3, 2, 3,
        1, 3, 2, 3,
        1, 3, 2, 3,
        1, 3, 2, 3,
    ],
}

export default class AccompContour extends RhythmicSequence<number | number[]> {
    range: number;

    constructor(contents: number[], subdivisions: number[], subdurations?: Fraction[]) {
        super(contents, subdivisions, subdurations);
        
        let max = 0;
        for (let vector of this.spreadContents()) {
            if (typeof vector === "number" && vector > max) {
                max = vector;
            } else if (typeof vector !== "number" && Math.max(...vector) > max) {
                max = Math.max(...vector);
            }
        }
        
        this.range = max;
    }

    applyAtIndex(index: number, sourceNotes: Note[]): Note[] {
        let vector = this.spreadContents()[index];
        if (!vector) {
            throw new Error("AccompContour access index out of bounds");
        }

        if (typeof vector === "number") {
            return [sourceNotes[vector]];
        } else {
            return vector.map(ind => sourceNotes[ind]);
        }
        
    }

    static fromAccompRhythm(ar: AccompRhythm, source: AccompContour): AccompContour {
        let contents = [];

        let arSpread = ar.spreadContents();
        let sourceSpread = source.spreadContents();
        let pos = 0;
        
        for (let a of arSpread) {
            let currentValue = sourceSpread[pos] as number;
            
            if (a?.toString() === AccompRhythm.DOWN_BEAT.toString()) {
                pos -= 1;
                if (pos < 0) {
                    pos = 0;
                }

                contents.push(currentValue);
            } else if (a?.toString() === AccompRhythm.UP_BEAT.toString()) {
                pos += 1;
                contents.push(currentValue);
            } else {
                pos += 1;
                contents.push(currentValue);
                // resultValue[i] = NaN;
            }
        }

        return new AccompContour(contents, ar.subdivisions);
    }

    toAccompRhythm(): AccompRhythm {
        let resultItems = [AccompRhythm.DOWN_BEAT];
        let contentSpread = this.spreadContents();

        let lastValue = contentSpread[0];

        for (let i = 1; i < contentSpread.length; i++) {
            let thisValue = contentSpread[i] as number;
            lastValue = contentSpread[i - 1] as number;
            
            if (thisValue - lastValue > 0) {
                resultItems.push(AccompRhythm.DOWN_BEAT);
            } else {
                resultItems.push(AccompRhythm.UP_BEAT);
            } 
        }

        return new AccompRhythm(resultItems, this.subdivisions);
    }
    
    static getPresets(filterFn?: (ar: AccompContour) => boolean): AccompContour[] {
        let result = [];
        for (let value of Object.values(presets)) {
            let ar = new AccompContour(value, [4, 4, 4, 4]);
            if (filterFn === undefined || filterFn(ar)) {
                result.push(ar);
            }
        }
        return result;
    }

}
