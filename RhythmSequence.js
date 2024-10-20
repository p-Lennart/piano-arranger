class RhythmSequence {

    constructor(valueStr) { // Init from string representation
        this.value = [];
        this.beatmap = {};
        this.subdivision = 4; // Default value

        this.fromString(valueStr);
    }

    fromString(valueStr) {
        this.subdivision = valueStr.indexOf(",");
        if (this.subdivision === -1) {
            console.error("RhythmSequence has no subdivision value, defaulting to subdivision=4");
            this.subdivision = 4;
        }

        for (let i = 0; i < valueStr.length; i++) {
            let char = valueStr[i];

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

    toString() {
        return RhythmSequence.stringify(this.value, this.subdivision);
    }
    
    static stringify(rpValue, rpGroupSize) {
        let out = "";
        
        for (let i = 0; i < rpValue.length; i++) {
            out += rpValue[i];
            if (i % rpGroupSize == rpGroupSize - 1 && i !== rpValue.length - 1) {  // Seperate beats with comma
                out += ","
            }
        }

        return out;
    }

    writeBeatmap() {
        this.beatmap = {};
        
        for (let i = 0; i < this.value.length; i++) {
            if (!this.beatmap[this.value[i]]) {
                this.beatmap[this.value[i]] = [];
            }

            this.beatmap[this.value[i]].push(i);
        }

        return this.beatmap;
    }

    getBeats(key) {
        return this.beatmap[key];
    }

    setBeats(key, indices) {
        for (let ind of indices) {
            this.value[ind] = key;
        }

        return this.writeBeatmap();
    }

    getRests() {
        return this.getBeats('-');
    }

    setRests(indices) {
        return this.setBeats('-', indices);
    }

}

module.exports = RhythmSequence;
