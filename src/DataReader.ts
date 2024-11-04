import MidiParser from 'midi-parser-js';
import fs from "fs";
import Note from 'Note';
import NoteSequence from 'NoteSqeuence';
import { findSourceMap } from 'module';

const gcd = function(a, b) {
    if (!b) {
      return a;
    }
  
    return gcd(b, a % b);
}

const findSubDivisor = function(durations: number[]): number {
    durations = durations.sort((a, b) => a - b);

    let divisor = durations[0];
    let passed = true;

    while (passed) {
        for (let d of durations) {
            if (d % divisor !== 0) {
                passed = false;
                divisor = gcd(d, divisor);
                break;
            }
        }
    }

    return divisor;
}

interface midiTimings {
    timeSignature: [number, number],
    ticksPerQuarter: number,
    ticksPerBeat: number,
    ticksPerMeasure: number,
}

interface bufferEntry {
    note: Note,
    duration: number | null,
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
        this.midiTimings = DataReader.calculateMidiTimings(m, m.timeDivision);
        
        let tt = m.track[0];
        
        let playheadTick = 0;
        let measures = [];
        
        let measureBuffer = {} as Record<number, bufferEntry>;

        for (let event of tt.event) {
            let dt = event.deltaTime;
            playheadTick += dt;

            if (playheadTick >= this.midiTimings.ticksPerMeasure) {
                let ns = this.createBestNoteSequence(measureBuffer);
                
                measures.push(ns);
                                
                measureBuffer = {};
                playheadTick = playheadTick - this.midiTimings.ticksPerMeasure;
            }

            if (event.type === 9) {
                let ed = event.data;
                let note = new Note(ed[0]);
                let velocity = ed[1];

                if (velocity !== 0) {
                    measureBuffer[playheadTick] = { note: note, duration: null };
                } else {
                    measureBuffer[playheadTick - dt].duration = dt;
                }
            }
        }

        console.log(measures);
    }

    createBestNoteSequence(measureBuffer: Record<number, bufferEntry>): NoteSequence {
        let result = new NoteSequence([], [], []);

        // WIP: algorithm to distinguish rhythms

        // let startChunk = this.midiTimings.ticksPerMeasure * 4;
        
        // let durations = Object.values(measureBuffer).map(a => a.duration);
        // let bruteForce = findSubDivisor(durations);

        // let bruteDivisions = startChunk / bruteForce;

        // let testChunk = startChunk / 2;


        // for (let i = 0; i < 9; i++) {  // Go up to 128th division
            
        // } 

        return result;
    }

    static calculateMidiTimings(midiEventArray, timeDivision: number): midiTimings {
        let data = midiEventArray.data;

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
}