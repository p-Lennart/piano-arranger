import MidiParser from 'midi-parser-js';
import fs from "fs";
import Note from 'Note';
import NoteSequence from 'NoteSqeuence';
import Fraction from 'common/Fraction';

interface midiTimings {
    timeSignature: [number, number],
    ticksPerQuarter: number,
    ticksPerBeat: number,
    ticksPerMeasure: number,
}

interface bufferEntry {
    note: Note,
    tick: number,
    duration: number | null,
    timeToNext: number | null,
}

export default class DataReader {
    midiArray: any;
    midiTimings: midiTimings;

    constructor(filepath: string) {
        // read a .mid binary (as base64)
        let data = fs.readFileSync(filepath, 'base64');
        this.midiArray = MidiParser.parse(data);
        
        fs.writeFileSync(`test${filepath}.json`, JSON.stringify(this.midiArray, null, 4)); 

        let m = this.midiArray; 
        let tt = m.track[0];

        let meta88 = tt.event.find(e => e.metaType === 88);
        if (!meta88) {
            throw new Error("MIDI track missing meta 88 event");
        }

        this.midiTimings = DataReader.calculateMidiTimings(meta88, m.timeDivision);
        
        let measureTick = 0;
    
        let measures = [];    
        let measureBuffer = [] as bufferEntry[];

        for (let event of tt.event) {
            let dt = event.deltaTime;
            measureTick += dt;

            if (measureTick >= this.midiTimings.ticksPerMeasure) {
                let lastInd = measureBuffer.length - 1;
                measureBuffer[lastInd].timeToNext = this.midiTimings.ticksPerMeasure - measureBuffer[lastInd].tick;

                let ns = this.createBestNoteSequence(measureBuffer);
                
                measures.push(ns);
                measureBuffer = [];
                measureTick = measureTick - this.midiTimings.ticksPerMeasure;
            }

            if (event.type === 9) {
                let note = new Note(event.data[0]);
                let velocity = event.data[1];

                if (velocity !== 0) {
                    let lastInd = measureBuffer.length - 1;
                    if (lastInd >= 0) {
                        measureBuffer[lastInd].timeToNext = measureTick - measureBuffer[lastInd].tick;
                    } 
                    
                    measureBuffer.push({ note: note, tick: measureTick, duration: null, timeToNext: null });
                } else {
                    // let noteOnInd = measureBuffer.findLastIndex(be => be.tick === measureTick - dt);  // Old way of finding note-on
                    let noteOnInd = measureBuffer.findLastIndex(be => be.note.equals(note));
                    measureBuffer[noteOnInd].duration = measureTick - measureBuffer[noteOnInd].tick;
                }
            }
        }
        
        let lastInd = measureBuffer.length - 1;
        measureBuffer[lastInd].timeToNext = this.midiTimings.ticksPerMeasure - measureBuffer[lastInd].tick;

        let ns = this.createBestNoteSequence(measureBuffer);       
        measures.push(ns);
        

        console.dir(measures, { depth: null })
        // console.log(measures);
    }

    createBestNoteSequence(measureBuffer: Record<number, bufferEntry>): NoteSequence {
        let result = new NoteSequence([], [], []);
        
        let measureValues = Object.values(measureBuffer);

        let sameLenNotes = [];

        for (let i = 0; i < measureValues.length ; i++) {

            let thisProportion = measureValues[i].timeToNext / this.midiTimings.ticksPerMeasure;
            
            let nextProportion: number = -1;
            if (i < measureValues.length - 1) {
                nextProportion = measureValues[i + 1].timeToNext / this.midiTimings.ticksPerMeasure;
            }

            sameLenNotes.push(measureValues[i].note);

            if (nextProportion !== thisProportion) {
                let n = sameLenNotes.length;
                let subduration = new Fraction(measureValues[i].timeToNext * n,
                    this.midiTimings.ticksPerMeasure);
                result.append(sameLenNotes, n, subduration.simplify());

                sameLenNotes = [];
            }

        }

        return result;
    }

    static calculateMidiTimings(meta88obj, timeDivision: number): midiTimings {
        let data = meta88obj.data;

        let tSig = [ data[0], 2 ** data[1] ] as [number, number];

        let tpq = timeDivision;  // example file: 480
        let tpb = (4 / tSig[1]) * tpq;  // tpq is quarter note, divide 4 by denominator of key sig, multiply tpq by resulting ratio 
        let tpMes = tpb * tSig[0];  // example file: 1920

        return {
            timeSignature: tSig,
            ticksPerQuarter: tpq,
            ticksPerBeat: tpb,
            ticksPerMeasure: tpMes,
        };
    }

    // TODO: parse key signature, update "current key signature" as progressing through events
    // static calculateMidiKeySignature(meta89obj) {
        
    // }
}