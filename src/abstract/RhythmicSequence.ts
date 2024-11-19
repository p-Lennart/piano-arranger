import Fraction from "common/Fraction";

export interface SequenceReference {
    out: number,
    inn: number,
}

export interface SequenceItem {
    toString(): string,
}

export interface SequenceSlice<T extends SequenceItem> {
    content: (T | null)[];
    subdivision: number;
    subduration: Fraction;
    index?: number;
}

export default abstract class RhythmicSequence<T extends SequenceItem> implements Iterable<SequenceSlice<T>> {
    contents: (T | null)[][];
    subdivisions: number[];
    subdurations: Fraction[];
    contentMap: Record<string, SequenceReference[]>;

    static REST_LABEL = "-";
    static SUBDIV_LABEL = ",";

    constructor(contentsSpread: (T | null)[], subdivisions: number[], subdurations?: Fraction[]) {
        this.subdivisions = subdivisions;
        if (subdurations === undefined) {
            this.subdurations = subdivisions.map(n => new Fraction(n, contentsSpread.length).simplify());
        } else {
            this.subdurations = subdurations;
        }
        
        this.contents = [];
        this.contentMap = {};

        this.writeContentsAndMap(contentsSpread);

    }
    [Symbol.iterator](): Iterator<SequenceSlice<T>> {
        let index = 0;

        let instance = this;

        return {
            next(): IteratorResult<SequenceSlice<T>> {
                if (index < instance.contents.length) {
                    let currentInd = index;
                    index++;
                    return { value: instance.getSlice(currentInd), done: false };
                } else {
                    return { value: undefined, done: true };
                }
            }
        };
    }  
    
    getSlice(index: number): SequenceSlice<T> {
        if (index < 0 || index >= this.subdivisions.length) {
            throw new Error("RhythmicSequence index out of bounds");
        } 

        return {
            content: this.contents[index],
            subdivision: this.subdivisions[index],
            subduration: this.subdurations[index],
            index: index,
        };
    }


    setSlice(content: T[], index: number): void {
        if (index < 0 || index > this.subdivisions.length) {
            throw new Error("RhythmicSequence index out of bounds");
        } else if (content.length !== this.subdivisions[index]) {
            throw new Error(`New slice for RhythmicSequence must be of length ${this.subdivisions[index]}`);
        }

        this.contents[index] = content;
        this.writeContentsAndMap();
    }

    appendSlice(ss: SequenceSlice<T | null>) {
        this.contents.push(ss.content);
        this.subdivisions.push(ss.subdivision);
        this.subdurations.push(ss.subduration);

        this.writeContentsAndMap();
    }

    getItem(ref: SequenceReference): (T | null) {
        let result = this.contents[ref.out]?.[ref.inn];
        if (result === undefined) {
            throw new Error("RhythmicSequence SequenceReference out of bounds");
        }
        return result as (T | null);
    }

    setItem(item: T | null, ref: SequenceReference): void {
        const outer = this.contents[ref.out];
        if (outer?.[ref.inn] === undefined) {
            throw new Error("RhythmicSequence SequenceReference out of bounds");
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

    bulkSet(item: (T | null), refs: SequenceReference[]) {
        for (let r of refs) {
            this.setItem(item, r);
        }
    }

    toString(): string {
        let out = "";
        
        for (let cOut of this.contents) {
            for (let cIn of cOut) {
                if (cIn === null) {
                    out += RhythmicSequence.REST_LABEL;
                } else {
                    out += cIn?.toString();
                }
            }
            out += ",";
        }
    
        return out.slice(0, -1);  // delete trailing comma
    }

    spreadContents(): (T | null)[] {
        let spread: (T | null)[] = [];
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

        let seqRef: SequenceReference = { out: 0, inn: 0 };
        let contentsBuffer: (T | null)[] = [];

        for (let item of items) {
            contentsBuffer.push(item);

            let key: string;
            if (item !== null) {
                key = item.toString();
            } else {
                key = RhythmicSequence.REST_LABEL;
            }

            if (this.contentMap[key] === undefined) {
                this.contentMap[key] = [];
            }

            this.contentMap[key].push(seqRef);
            seqRef = { out: seqRef.out, inn: seqRef.inn + 1 };
            
            if (contentsBuffer.length === this.subdivisions[seqRef.out]) {
                this.contents[seqRef.out] = contentsBuffer;
                
                contentsBuffer = [];
                seqRef = { out: seqRef.out + 1, inn: 0 };
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

    static createEmpty<T, Child extends RhythmicSequence<T>>(
        this: new (
          contentsSpread: (T | null)[],
          subdivisions: number[],
          subdurations?: Fraction[]
        ) => Child,
        subdivisions: number[],
        subdurations: Fraction[]
    ): Child {      
    
        let items: null[] = [];
        for (let sd of subdivisions) {
            for (let i = 0; i < sd; i++) {
                items.push(null);
            }
        }

        return new this(items, subdivisions, subdurations);
    }

}