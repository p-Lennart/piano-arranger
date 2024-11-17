import fs from "fs";
import * as MidiFile from 'midi-file';
import { DEFAULT_TIME_SIG, tickedEvent } from './DataReader';
import ChordSequence from 'ChordSequence';

function tickedToMidiEvents(tickedTrack: tickedEvent<MidiFile.MidiEvent>[]): MidiFile.MidiEvent[] {
    let midiTrack: MidiFile.MidiEvent[] = [];

    for (let i = tickedTrack.length - 1; i >= 0; i--) {
        let ticksToPrevious = 0;
        if (i > 0) {
            ticksToPrevious = tickedTrack[i].tick - tickedTrack[i - 1].tick;
        }
        
        let thisEvent = tickedTrack[i].data;
        thisEvent.deltaTime = ticksToPrevious;
        
        if (ticksToPrevious < 0) {
            throw new Error("Negative deltaTime value will break midi buffer");
        }

        midiTrack.unshift(thisEvent);
    }   

    return midiTrack;
}

export default class DataWriter {
    midiObject: MidiFile.MidiData;

    constructor(filepath: string,
        header: MidiFile.MidiData["header"],
        tracks: ChordSequence[][],
        timeSigs?: tickedEvent<MidiFile.MidiTimeSignatureEvent>[]) {
            
        if (!filepath.endsWith('.mid') && !filepath.endsWith('.midi')) {
            throw new Error(`Filepath ${filepath} is not a MIDI file!`);
        }

        this.midiObject = {
            header: header,
            tracks: [],
        }

        for (let dataTrack of tracks) {
            let writerTrack: MidiFile.MidiEvent[] = [];
            
            writerTrack.push({
                "deltaTime": 0,
                "meta": true,
                "type": "trackName",
                "text": "Piano\u0000"
            });

            let trackContents = this.trackNotesToMidi(header, dataTrack, timeSigs);
            writerTrack.push(...trackContents);
            
            writerTrack.push({
                "deltaTime": 1,
                "meta": true,
                "type": "endOfTrack"
            });

            this.midiObject.tracks.push(writerTrack);
        }

        // fs.writeFileSync(`RW_${filepath}.json`, JSON.stringify(this.midiObject, null, 4));
        
        let midiBuffer = MidiFile.writeMidi(this.midiObject);
        let fileBuffer = Buffer.from(midiBuffer);
        fs.writeFileSync(filepath, fileBuffer);
    }

    trackNotesToMidi(header: MidiFile.MidiData["header"],
        track: ChordSequence[],
        timeSigs?: tickedEvent<MidiFile.MidiTimeSignatureEvent>[]): MidiFile.MidiEvent[] {
        
        let tickedEvents: tickedEvent<MidiFile.MidiEvent>[] = [];
        let tick = 0;

        let currentTimeSig: MidiFile.MidiTimeSignatureEvent;
        if (timeSigs && timeSigs[0] && timeSigs[0].tick === 0) {
            currentTimeSig = timeSigs[0].data;
        } else {
            tickedEvents.push({
                tick: 0,
                data: DEFAULT_TIME_SIG
            });
            currentTimeSig = DEFAULT_TIME_SIG; 
        }
        
        let currentTpm = header.ticksPerBeat * DEFAULT_TIME_SIG.numerator;
        
        for (let measureNum = 0; measureNum < track.length; measureNum++) {  // Need to handle time sig changes
            let measure = track[measureNum];
            
            for (let i = 0; i < measure.contents.length; i++) {
                let chunk = measure.contents[i];

                let chunkTicks = measure.subdurations[i].scale(currentTpm).evaluate();
                let chordTicks = chunkTicks / measure.subdivisions[i];
                
                for (let chord of chunk) {
                    for (let note of chord) {
                        if (note !== null) {
                            tickedEvents.push({
                                tick: tick,
                                data: {
                                    "deltaTime": 0,
                                    "running": true,
                                    "channel": 0,
                                    "type": "noteOn",
                                    "noteNumber": note.getValue(),
                                    "velocity": 80,
                                },
                            });
                        }
                    };
                    
                    tick += chordTicks;
                    
                    for (let note of chord) {
                        if (note !== null) {
                            tickedEvents.push({
                                tick: tick,
                                data: {
                                    "deltaTime": 0,
                                    "running": true,
                                    "channel": 0,
                                    "type": "noteOff",
                                    "noteNumber": note.getValue(),
                                    "velocity": 0,
                                    "byte9": true
                                },
                            });
                        }
                    };
                }
            }

            // THIS BREAKS // tick = (measureNum + 1) * currentTpm;  // Hard set tick to the next measure to prevent precision errors compounding 
        }

        let result = tickedToMidiEvents(tickedEvents);
        return result;
    }
    
}