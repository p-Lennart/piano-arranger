import * as MidiFile from 'midi-file';
import fs from "fs";
import Note from 'Note';
import NoteSequence from 'NoteSqeuence';
import Fraction from 'common/Fraction';
import ChordSequence from 'ChordSequence';

interface measureBufferEntry extends tickedEvent<Note | null> {
    tick: number,
    data: Note | null,
    duration: number | null,
    timeToNext: number | null,
}

export const DURATION_TOLERANCE = 0.000525;
export const DEFAULT_TIME_SIG: MidiFile.MidiTimeSignatureEvent = {
    "deltaTime": 0,
    "type": "timeSignature",
    "numerator": 4,
    "denominator": 4,
    "metronome": 24,
    "thirtyseconds": 8
};

export interface tickedEvent<T> {
    tick: number,
    data: T,
}

// export interface timeSignature {
//     "numerator": number,
//     "denominator": number,
//     "metronome": number,
//     "thirtyseconds": number,
// }

function createBestNoteSequence(measureBuffer: measureBufferEntry[], tpm: number): NoteSequence {
    let result = new NoteSequence([], [], []);
    
    let sameLenNotes: Note[] = [];
    let sameLensDuration = 0;

    if (measureBuffer.length === 0 || measureBuffer[0].tick !== 0) {  // If measure doesn't start with a beat 
        let timeToNext = tpm;
        if (measureBuffer[0]) {
            timeToNext = measureBuffer[0].tick;
        }
        
        // Add null spacer to keep things aligned
        measureBuffer.unshift({
            tick: 0,
            data: null,
            duration: timeToNext,
            timeToNext: timeToNext,
        });
    }

    for (let i = 0; i < measureBuffer.length ; i++) {
        sameLenNotes.push(measureBuffer[i].data);
        sameLensDuration += measureBuffer[i].timeToNext;

        let thisProportion = measureBuffer[i].timeToNext / tpm;
        let nextProportion = -1;

        if (i < measureBuffer.length - 1) {
            nextProportion = measureBuffer[i + 1].timeToNext / tpm;
        }
    
        let deviation = Math.abs(nextProportion - thisProportion);

        if (deviation > DURATION_TOLERANCE) {  // If durations are close enough, count them as the same duration
            let subduration = new Fraction(sameLensDuration,tpm).simplify();

            result.appendSlice({
                content: sameLenNotes,
                subdivision: sameLenNotes.length,
                subduration: subduration,
            });

            sameLenNotes = [];
            sameLensDuration = 0;
        }

    }

    return result;
}

export default class DataReader {
    data: MidiFile.MidiData;
    header: MidiFile.MidiHeader;
    timeSigs: tickedEvent<MidiFile.MidiTimeSignatureEvent>[];
    measures: NoteSequence[];

    constructor(filepath: string) {
        this.data = this.readData(filepath);

        this.header = this.data.header;
        this.timeSigs = [];
        this.measures = this.parseTrack(this.data.tracks[0]);
    }

    readData(filepath: string) {
        if (!filepath.endsWith('.mid') && !filepath.endsWith('.midi')) {
            throw new Error(`Filepath ${filepath} is not a MIDI file!`);
        }

        let raw = fs.readFileSync(filepath);
        let data = MidiFile.parseMidi(raw);

        // fs.writeFileSync(`read_${filepath}.json`, JSON.stringify(data, null, 4));
        return data;
    }

    parseTrack(track: MidiFile.MidiEvent[]): NoteSequence[] {
        let measures = [];    
        let measureBuffer = [] as measureBufferEntry[];
        
        let currentTpm = this.header.ticksPerBeat * DEFAULT_TIME_SIG.numerator;
        
        let tick = 0 + track[0].deltaTime;
        let measureTick = 0 + track[0].deltaTime;
        
        for (let i = 0; i < track.length; i++) {
            let event = track[i];

            switch (event.type) {
                case "timeSignature":
                    this.timeSigs.push({
                        tick: tick,
                        data: event,
                    });
                    currentTpm = this.header.ticksPerBeat * event.numerator;
                    break;
                case "keySignature":
                    break;
                case "noteOn":
                    let lastInd = measureBuffer.length - 1;
                    console.log(lastInd);
                    if (lastInd >= 0) {
                        let diff = measureTick - measureBuffer[lastInd].tick;
                        measureBuffer[lastInd].timeToNext = diff;
                    }
                    
                    let note = new Note(event.noteNumber);
                    measureBuffer.push({ data: note, tick: measureTick, duration: null, timeToNext: null });
                    break;
                case "noteOff":
                    let offNote = new Note(event.noteNumber);
                    let noteOnInd = measureBuffer.findLastIndex(be => be.data.equals(offNote));
                    
                    if (measureBuffer[noteOnInd].duration === null) {
                        measureBuffer[noteOnInd].duration = measureTick - measureBuffer[noteOnInd].tick;
                    }

                    break;       
            }

            if (i < track.length - 1) {
                tick += track[i + 1].deltaTime;
                measureTick += track[i + 1].deltaTime;
            }
            
            if (measureTick >= currentTpm || i === track.length - 1) {
                let lastInd = measureBuffer.length - 1;
                measureBuffer[lastInd].timeToNext = currentTpm - measureBuffer[lastInd].tick;

                let ns = createBestNoteSequence(measureBuffer, currentTpm);
                measures.push(ns);
                
                measureBuffer = [];
                measureTick = measureTick - currentTpm;
            }
        }

        console.dir(measures, { depth: null });
        return measures;
    }
}