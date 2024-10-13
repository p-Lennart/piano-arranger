class RhythmPattern {

    constructor(valueStr) { // Init from string representation
        this.value = [];
        this.beatmap = {};
        this.groupSize = 4; // Default value

        this.fromString(valueStr);
    }

    fromString(valueStr) {
        this.groupSize = valueStr.indexOf(",");
        if (this.groupSize === -1) {
            console.error("RhythmPattern has no group size, defaulting to groupSize=4");
            this.groupSize = 4;
        }

        for (let i = 0; i < valueStr.length; i++) {
            let char = valueStr[i];

            if (char === ",") {

                if (i % this.groupSize !== 0 && this.groupSize !== 4) { // Check if comma-seperated group size is consistent from group to group
                    console.error("RhythmPattern init string contains inconsistent group sizes, defaulting to groupSize=4");
                    this.groupSize = 4;
                }

            } else {
                this.value.push(char);
            }
        }
        
        this.writeBeatmap();
    }

    toString() { // Separate groups of groupSize with a comma
        return RhythmPattern.stringify(this.value, this.groupSize);
    }
    
    static stringify(rpValue, rpGroupSize) {
        let out = "";
        
        for (let i = 0; i < rpValue.length; i++) {
            out += rpValue[i];
            if (i % rpGroupSize == rpGroupSize - 1 && i !== rpValue.length - 1) {
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

module.exports = RhythmPattern;
