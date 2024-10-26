import AccompRhythm from "./AccompRhythm";

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

export default class AccompContour {
    value: Array<number>;
    subdivision: number;
    range: number;

    constructor(value: Array<number>, subdivision=4) {
        this.value = value;
        this.subdivision = subdivision;
        
        let max = 0;
        for (let offset of value) {
            if (offset > max) {
                max = offset;
            }
        }
        
        this.range = max;
    }

    get(ind: number): number {
        if (this.value[ind] === undefined) {
            throw new Error("Requested index beyond bounds of AccompContour");
        }
        return this.value[ind];
    }

    static fromAccompRhythm(accompRhythm: AccompRhythm, source: AccompContour) {
        let downbeats = accompRhythm.getDownbeats();
        let upbeats = accompRhythm.getDownbeats(); 

        let resultValue = ([] as number[]);

        let pos = 0;
        for (let i = 0; i < accompRhythm.value.length; i++) {
            let currentValue = (source.value[pos] as number)

            if (downbeats.includes(i)) {
                pos -= 1;
                if (pos < 0) {
                    pos = 0;
                }

                resultValue[i] = currentValue;
            } else if (upbeats.includes(i)) {
                pos += 1;
                resultValue[i] = currentValue;
            } else {
                pos += 1;
                resultValue[i] = currentValue;
                // resultValue[i] = NaN;
            }
        }

        return new AccompContour(resultValue, accompRhythm.subdivision);
    }

    toAccompRhythm() {
        let rhythmString = "d";
        let lastValue = this.value[0];

        for (let i = 1; i < this.value.length; i++) {
            let thisValue = (this.value[i] as number);
            lastValue = (this.value[i - 1] as number);
            
            if (thisValue - lastValue > 0) {
                rhythmString += "d";
            } else {
                rhythmString += "u";
            } 
        }

        return new AccompRhythm(rhythmString);
    }
    
    static getPresets(filterFn?: (ar: AccompContour) => boolean): AccompContour[] {
        let result = [];
        for (let value of Object.values(presets)) {
            let ar = new AccompContour(value, 4);
            if (filterFn !== undefined && filterFn(ar)) {
                result.push(ar);
            }
        }
        return result;
    }

}
