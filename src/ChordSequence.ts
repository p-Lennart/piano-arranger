import RhythmicSequence from "abstract/RhythmicSequence";
import NoteSequence from "NoteSqeuence";
import Note from "./Note";

export default class ChordSequence extends RhythmicSequence<Note[]> {

    static fromNoteSequence(noteSequence: NoteSequence): ChordSequence {
        const spread = noteSequence.spreadContents();
        const newSpread = spread.map(n => [n]);

        return new ChordSequence(newSpread, noteSequence.subdivisions, noteSequence.subdurations);
    }
    
}