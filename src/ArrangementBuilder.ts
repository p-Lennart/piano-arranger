import AccompContour from "AccompContour";
import AccompRhythm from "AccompRhythm";
import ChordSequence from "ChordSequence";
import MelodyRhythm from "MelodyRhythm";
import Note from "Note";
import NoteSequence from "NoteSqeuence";
import Scale from "Scale";
import { SequenceSlice } from './abstract/RhythmicSequence';

export default class ArrangementBuilder {
    melody: NoteSequence[];
    chords: Scale[];
    accomp: ChordSequence[];

    constructor(melody: NoteSequence[], chords: Scale[]) {
        if (melody.length !== chords.length) {
            throw new Error("ArrangementBuilder given mismatched melody and chords");
        }

        let accomp: ChordSequence[] = [];
        
        for (let i = 0; i < melody.length; i++) {
            let accMes = ArrangementBuilder.createMeasureAccomp(melody[i], chords[i]);
            accomp.push(accMes);
        }

        this.melody = melody;
        this.accomp = accomp;
    }

    static createMeasureAccomp(melody: NoteSequence, scale: Scale): ChordSequence {
        const mr = MelodyRhythm.fromMelodyNotes(melody);  // Implement later, static MelodyRhythm finds strong and weak subbeats in notesequence

        let arOptions: AccompRhythm[] = [
            // ...AccompRhythm.getPresets(a => true), // add len and subdiv checks
            // AccompRhythm.fromString("duuu,uuuu,uuuu,uuuu"),
            // AccompRhythm.fromString("duuu,uuuu,uuuu,uuuu"),
            AccompRhythm.fromString("duuu,uuuu,uuuu,uuuu"),
            // AccompRhythm.synchronizedAccomp(mr),
            // AccompRhythm.syncopatedAccomp(mr),
        ];

        let chosenAr = ArrangementBuilder.selectAR(mr, arOptions);

        let acOptions: AccompContour[] = [
            ...AccompContour.getPresets(a => true),
            // AccompContour.fromAccompRhythm(chosenAr, AccompContour.getPresets()[0]),
        ];

        let chosenAc = ArrangementBuilder.selectAC(mr, acOptions);
        
        let chosenSn = ArrangementBuilder.selectSourceNotes(scale);

        return ArrangementBuilder.renderAccompCS(chosenAr, chosenAc, chosenSn);
    }

    static selectAR(mr: MelodyRhythm, arOptions: AccompRhythm[]): AccompRhythm {
        return (arOptions[Math.floor(Math.random() * arOptions.length)] as AccompRhythm);  // Replace with intelligent selection algo
    }

    static selectAC(mr: MelodyRhythm, acOptions: AccompContour[]): AccompContour {
        return (acOptions[Math.floor(Math.random() * acOptions.length)] as AccompContour);  // Replace with intelligent selection algo 
    }

    static selectSourceNotes(scale: Scale) {
        let slice = scale.spacedSpan.filter(n => n.getOctave() >= 1);
        return slice;
    }

    static renderAccompCS(ar: AccompRhythm, ac: AccompContour, sourceNotes: Note[]): ChordSequence {
        if (ac.range > sourceNotes.length) {
            throw new Error("AccompContour range beyond bounds of source note slice");
        }

        let accompCS = ChordSequence.createEmpty([], []);

        let acInd = 0;

        for (let seqSlice of ar) {
            let newContent = seqSlice.content.map(arSeqItem => {
                if (arSeqItem === null) {
                    return null;
                } else {
                    return ac.applyAtIndex(acInd++, sourceNotes)
                }
            });

            accompCS.appendSlice({
                content: newContent,
                subdivision: seqSlice.subdivision,
                subduration: seqSlice.subduration,
            });
        }

        return accompCS;
    }

}