import RhythmSequence from "./RhythmSequence";

export default class MelodyRhythm extends RhythmSequence {
    strongbeats: Array<number>;
    weakbeats: Array<number>;

    constructor(valueStr: string) {
        super(valueStr);
        this.strongbeats = this.getStrongbeats();
        this.weakbeats = this.getWeakbeats();
    }
    
    getStrongbeats() {
        return super.getBeats("s");
    }

    getWeakbeats() {
        return super.getBeats("w");
    }

    setStrongbeats(indices: Array<number>) {
        return super.setBeats("s", indices);
    }

    setWeakbeats(indices: Array<number>) {
        return super.setBeats("w", indices);
    }
    
    checkSpace(index: number, includeWeak?: boolean) {
        if (index === 0) {
            return false;
        }
        
        if (includeWeak) {
            return !this.getStrongbeats().includes(index) && !this.getWeakbeats().includes(index);
        } else {
            return !this.getStrongbeats().includes(index);
        }
        
    }

    static createEmpty(length: number, subdivision: number): MelodyRhythm {
        let data = "";
        
        for (let i = 0; i < length; i++) {
            data += "-";
            if (i % subdivision === subdivision - 1 && i !== length - 1) {  // Seperate beats with comma
                data += ","
            }
        }
    
        return new MelodyRhythm(data);
    }

    static presets = [
        "s-ww,s-s-,s-ws,-s-w",
    ];


}


