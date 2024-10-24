export default class RhythmSequence {
    value: Array<string>;
    length: number;
    beatmap: Record<string, Array<number>>;
    subdivision: number;

    constructor(data: string) { // Init from string representation
        this.value = [];
        this.length = 0;
        this.beatmap = {};
        this.subdivision = 4; // Default value

        this.subdivision = data.indexOf(",");
        if (this.subdivision === -1) {
            console.error("RhythmSequence has no subdivision value, defaulting to subdivision=4");
            this.subdivision = 4;
        }

        for (let i = 0; i < data.length; i++) {
            let char = (data[i] as string);
            if (char === ",") {
                if (i % this.subdivision !== 0 && this.subdivision !== 4) { // Check if comma-seperated group size is consistent from group to group
                    console.error("RhythmSequence init string contains inconsistent subdivision values, defaulting to subdivision=4");
                    this.subdivision = 4;
                }
            } else {
                this.value.push(char);
            }
        }
        
        this.writeBeatmap();
    }

    toString(): string {
        let out = "";
        
        for (let i = 0; i < this.value.length; i++) {
            out += this.value[i];
            if (i % this.subdivision == this.subdivision - 1 && i !== this.value.length - 1) {  // Seperate beats with comma
                out += ","
            }
        }
    
        return out;
    }

    static createEmpty(length: number, subdivision: number): RhythmSequence {
        let data = "";
        
        for (let i = 0; i < length; i++) {
            data += "-";
            if (i % subdivision === subdivision - 1 && i !== length - 1) {  // Seperate beats with comma
                data += ","
            }
        }
    
        return new RhythmSequence(data);
    }

    writeBeatmap(): Record<string, Array<number>> {
        this.beatmap = {};
        
        for (let i = 0; i < this.value.length; i++) {
            let label = (this.value[i] as string);

            if (!this.beatmap[label]) {
                this.beatmap[label] = [];
            }

            this.beatmap[label].push(i);
        }

        return this.beatmap;
    }

    getBeats(label: string): Array<number> {
        let beats = this.beatmap[label];
        if (typeof beats == undefined) {
            throw new Error(`Undefined beatmap for ${label}`);
        } 
        return (this.beatmap[label] as Array<number>);
    }

    setBeats(label: string, indices: Array<number>): Record<string, Array<number>> {
        for (let ind of indices) {
            this.value[ind] = label;
        }

        return this.writeBeatmap();
    }

    getRests() {
        return this.getBeats('-');
    }

    setRests(indices: Array<number>) {
        return this.setBeats('-', indices);
    }

}