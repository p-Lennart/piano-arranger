class RhythmPattern {

    constructor(valueStr) { // Init from string representation
        this.value = [];
        this.beatmap = {};
        this.groupSize = valueStr.indexOf(",");

        for (let i = 0; i < valueStr.length; i++) {
            let char = valueStr[i];

            if (char === ",") {

                if (i % this.groupSize !== 0 && this.groupSize !== 4) { // Check if comma-seperated group size is consistent from group to group
                    console.error("RhythmPattern init string contains inconsistent group sizes, defaulting to groupSize=4");
                    this.groupSize = 4;
                }

            } else {

                if (!this.beatmap[char]) {
                    this.beatmap[char] = [];
                }
    
                this.beatmap[char].push(i);
                this.value.push(char);
            }
        }
    }

    toString() { // Separate groups of groupSize with a comma
        let out = "";
        for (let i = 0; i < this.value.length; i++) {
            out += this.value[i];
            if (i % this.groupSize == this.groupSize - 1 && i !== this.value.length - 1) {
                out += ","
            }
        }

        return out;
    }

}

module.exports = RhythmPattern;
