import AccompRhythm from "AccompRhythm";
import MelodyRhythm from "MelodyRhythm";
import Note from "Note";
import Scale from "Scale";
import DataReader from "DataReader";
import DataWriter from "DataWriter";
import ChordSequence from "ChordSequence";
import ArrangementBuilder from "ArrangementBuilder";

const demoMelody = MelodyRhythm.fromString("s-ww,s-s-,s-ws,-s-w");
console.log("Demo melody:                ", demoMelody.toString());

const syncAccomp = AccompRhythm.syncopatedAccomp(demoMelody);
console.log("Syncopated Accompaniment:   ", syncAccomp.toString());

const synchrAccomp = AccompRhythm.synchronizedAccomp(demoMelody);
console.log("Synchronized Accompaniment: ", synchrAccomp.toString());

// const synchrContour = AccompContour.fromAccompRhythm(synchrAccomp, AccompContour.presets.straightUp);
// console.log("Synchronized Contour:       ", synchrContour);


const demoNotes = [new Note("B4"), new Note(75), new Note("F#7")];
console.log("Demo note labels", demoNotes.map(n => n.toString()));
console.log("Demo note values", demoNotes.map(n => n.getValue()));

console.log("Recontextualize D#5 in a C minor scale:",
    new Note("D#5", "Cm").toString());

const demo2Basis = Scale.bases["7th"];
const demo2 = new Scale("Db", demo2Basis);
console.log("7th chord applied to Db:",
    demo2.getNoteLabels());

const demo1Basis = Scale.bases.major;
const demo1 = new Scale("F#m", demo1Basis);
console.log("Full scale applied to F# minor:", 
    demo1.getNoteLabels());

const demo1Span = demo1.span;
console.log("Span: ");
demo1Span.slice(14).forEach(s => 
    process.stdout.write(s.toString() + ", "));
process.stdout.write("\n");

const demo1Spaced = demo1.spacedSpan;
console.log("Spaced span: ");
demo1Spaced.slice(2,24).forEach(s =>
    process.stdout.write(s.toString() + ", "));
process.stdout.write("\n");

// console.log(DataReader.findSubDivisor([4,4,6,8]));
// console.log(DataReader.findSubDivisor([4,4,6,8]));

// let tiff = new DataReader("tifftest.mid");



let kawaki = new DataReader("./demo/kawakiTest.mid");

let kawakiAcc = new ArrangementBuilder(kawaki.measures, [
        new Scale("D", Scale.bases.major),
        new Scale("E", Scale.bases.major),
        new Scale("F#m", Scale.bases["7th"]),
        new Scale("B", Scale.bases.major),
        new Scale("D", Scale.bases.major),
        new Scale("E", Scale.bases.major),
        new Scale("D", Scale.bases.major),
    ]
).accomp;

new DataWriter("./demo/OUTPUT.mid",
    kawaki.header,
    [kawaki.measures.map(ns => ChordSequence.fromNoteSequence(ns)),
    kawakiAcc],
    kawaki.timeSigs);