import RhythmSequence from "./RhythmSequence";

export default class AccompRhythm extends RhythmSequence {
    downbeats: Array<number>;
    upbeats: Array<number>;

    constructor(data: string) {
        super(data);
        this.downbeats = (this.getDownbeats() as number[]);
        this.upbeats = (this.getUpbeats() as number[]);
    }

    getDownbeats() {
        return super.getBeats("d");
    }

    getUpbeats() {
        return super.getBeats("u");
    }

    setDownbeats(indices: Array<number>) {
        return super.setBeats("d", indices);
    }

    setUpbeats(indices: Array<number>) {
        return super.setBeats("u", indices);
    }

    static createEmpty(length: number, subdivision: number): AccompRhythm {
        let data = "";
        
        for (let i = 0; i < length; i++) {
            data += "-";
            if (i % subdivision === subdivision - 1 && i !== length - 1) {  // Seperate beats with comma
                data += ","
            }
        }
    
        return new AccompRhythm(data);
    }

    static presets = [
        "d---,u-d-,--d-,u---",
        "d---,d-u-,--d-,u---",
        "d---,u-u-,d---,u-u-",
        "d-u-,u-u-,u-u-,u-u-",
        "du-u,-u-u,-u-u,-u-u",
        "d---,--d-,u---,u---",
        "d--d,--d-,u---,----",
        "d--u,--u-,d--u,--u-",
        "d--d,--d-,-d--,dudu",
        "d---,u--d,--d-,u---",
    ];

}
