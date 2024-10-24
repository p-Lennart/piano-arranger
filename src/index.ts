import MelodyRhythm from "./MelodyRhythm";
import Note from "./Note";
import Scale from "./Scale";

// let n = new Note(94);
// console.log("Note object with value 95, using Db scale:", n.toString("Db"));
// console.log("Note object with value 95, using F# scale:", n.toString("F#"));

// let m = new Note("C-1");
// console.log("Note object instantiated with string, value:", m.value);


// let s = new Scale("F#m", Scale.bases.major);
// console.log(s.getNoteLabels());

// let n = s.span[39];
// console.log(n.toString());
// console.log(s.nextNote(n).toString());

// let ap = new AccompContour(AccompContour.presets.alberti);
// let aprp = ap.toAccompRhythm();
// console.log(aprp);



const demoMelody = new MelodyRhythm("s-ww,s-s-,s-ws,-s-w");
console.log("Demo melody:                ", demoMelody.toString());

const syncAccomp = demoMelody.syncopatedAccomp();
console.log("Syncopated Accompaniment:   ", syncAccomp.toString());

const synchrAccomp = demoMelody.synchronizedAccomp();
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