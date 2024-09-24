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

}

module.exports = RhythmPattern;
