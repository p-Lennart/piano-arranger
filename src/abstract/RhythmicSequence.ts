import Fraction from "common/Fraction";

export interface SequenceItem {
    toString(): string,
}

export interface SequenceReference {
    out: number,
    inn: number,
}

export default abstract class RhythmicSequence<T extends SequenceItem> {
    contents: (T | null)[][];
    subdivisions: number[];
    subdurations: (number | Fraction)[];
    contentMap: Record<string, SequenceReference[]>;

    static REST_LABEL = "-";
    static SUBDIV_LABEL = ",";

    constructor(itemSpread: (T | null)[], subdivisions: number[], subdurations?: (number | Fraction)[]) {
        this.subdivisions = subdivisions;
        if (subdurations === undefined) {
            this.subdurations = subdivisions.map(n => { return n / itemSpread.length });
        } else {
            this.subdurations = subdurations;
        }
        
        this.contents = [];
        this.contentMap = {};

        this.writeContentsAndMap(itemSpread);

    }

    getItem(ref: SequenceReference): (T | null) {
        let result = this.contents[ref.out]?.[ref.inn];
        if (result === undefined) {
            throw new Error("RhythmicSequence item reference out of bounds");
        }
        return result as (T | null);
    }

    setItem(ref: SequenceReference, item: T | null): void {
        const outer = this.contents[ref.out];
        if (outer?.[ref.inn] === undefined) {
            throw new Error("RhythmicSequence item reference out of bounds");
        }
    
        outer[ref.inn] = item;
        this.contents[ref.out] = outer;

        this.writeContentsAndMap();
    }

    bulkGet(item: (T | null)): SequenceReference[] {
        let label = RhythmicSequence.REST_LABEL;

        if (item === undefined) {
            throw new Error("Invalid item for bulkGet in RhythmicSequence");
        } else if (item !== null) {
            label = item.toString();
        }

        let result = this.contentMap[label];
        if (result === undefined) {
            throw new Error("Invalid item for bulkGet in RhythmicSequence");
        }
        return result as SequenceReference[];
    }

    bulkSet(itemSpread: (T | null), refs: SequenceReference[]) {
        for (let r of refs) {
            this.setItem(r, itemSpread);
        }
    }

    append(content: T[], subdivision, subduration) {
        this.contents.push(content);
        this.subdivisions.push(subdivision);
        this.subdurations.push(subduration);

        this.writeContentsAndMap();
    } 

    getRests(): SequenceReference[] {
        return this.bulkGet(null);
    }

    setRests(refs: SequenceReference[]) {
        return this.bulkSet(null, refs);
    }

    toString(): string {
        let out = "";
        
        for (let co of this.contents) {
            for (let ci of co) {
                if (ci === null) {
                    out += RhythmicSequence.REST_LABEL;
                } else {
                    out += ci?.toString();
                }
            }
            out += ",";
        }
    
        return out.slice(0, -1);  // delete trailing comma
    }

    spreadContents() {
        let spread = [] as (T | null)[];
        for (let c of this.contents) {
            spread = spread.concat(c);
        }
        return spread;
    }

    incRef(ref: SequenceReference, amt: number = 1): SequenceReference {
        this.getItem(ref);  // Check validity
        
        let out = ref.out;
        let inn = ref.inn;
        
        let amtN = Math.abs(amt);
        for (let i = 0; i < amtN; i++) {
            inn += amt / amtN;

            if (inn < 0) {
                if (out > 0) {
                    out -= 1;
                    inn = (this.subdivisions[out] as number) - 1;
                } else {
                    out = 0;
                    inn = 0;
                    break;
                }
            } else if (inn >= (this.subdivisions[out] as number)) {
                if (out < this.subdivisions.length) {
                    out += 1;
                    inn = 0;
                } else {
                    out = this.subdivisions.length - 1;
                    inn = (this.subdivisions[out] as number) - 1;
                    break;
                }
            }
        }

        return { out: out, inn: inn };
    }
    
    writeContentsAndMap(items: (T | null)[] = this.spreadContents()) {
        this.contents = [];
        this.contentMap = {};

        let subIndex = 0;
        let contentsBuffer = [];

        for (let item of items) {
            contentsBuffer.push(item);

            let key = RhythmicSequence.REST_LABEL;
            if (item !== null) {
                key = item.toString();
            }

            let mapEntry = this.contentMap[key];
            if (mapEntry === undefined) {
                mapEntry = [];
            }
            
            mapEntry.push({ out: subIndex, inn: contentsBuffer.length - 1});
            this.contentMap[key] = mapEntry;
            
            if (contentsBuffer.length === this.subdivisions[subIndex]) {
                this.contents[subIndex] = contentsBuffer;
                contentsBuffer = [];
                subIndex += 1;
            }
        }

        if (this.subdivisions.length > this.contents.length ||
            this.subdurations.length > this.contents.length) {
            throw new Error("RhythmicSequence division properties impropperly mapped to contents");
        }
    }

    checkSpace(ref: SequenceReference, offset: number, items?: T[]): boolean {
        if (offset !== 0) {
            ref = this.incRef(ref, offset);
        }

        if (items === undefined) {
            return this.getItem(ref) === null;
        } else {
            for (let i of items) {
                let label = i.toString();
                if (this.contentMap[label] !== undefined &&
                    this.contentMap[label].includes(ref)) {
                    return false;
                }
            }
            
            return true;
        }
    }

    // static createEmpty(subdivisions: number[], subdurations: number[]): RhythmicSequence<T> {
    //     let items = [] as null[];
    //     for (let sd of subdivisions) {
    //         items.concat(Array(sd).fill(null));
    //     }
    // }

}