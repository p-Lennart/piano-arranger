// import AccompContour from "AccompContour";
// import AccompRhythm from "AccompRhythm";
// import MelodyRhythm from "MelodyRhythm";
// import Note from "Note";
// import NoteSequence from "NoteSqeuence";
// import Scale from "Scale";

// export default class ArrangementBuilder {
//     melody: NoteSequence;
//     accomp: NoteSequence;

//     constructor() {
//         this.melody = new NoteSequence();
//         this.accomp = new NoteSequence();
//     }

//     static createAccomp(melody: NoteSequence, chord: string): NoteSequence {
//         const mr = MelodyRhythm.parseMelody(melody);  // Implement later, static MelodyRhythm finds strong and weak subbeats in notesequence

//         let arOptions: AccompRhythm[] = [
//             ...AccompRhythm.getPresets(a => true || a), // add len and subdiv checks
//             AccompRhythm.synchronizedAccomp(mr),
//             AccompRhythm.syncopatedAccomp(mr),
//         ];

//         let chosenAr = ArrangementBuilder.selectAR(mr, arOptions);

//         let acOptions: AccompContour[] = [
//             ...AccompContour.getPresets(a => true || a),
//             AccompContour.fromAccompRhythm(chosenAr, AccompContour.getPresets()[0] as AccompContour),
//         ];

//         let chosenAc = ArrangementBuilder.selectAC(mr, acOptions);
        
//         let chosenSn = ArrangementBuilder.selectSourceNotes(chord);

//         return ArrangementBuilder.renderAccompNS(chosenAr, chosenAc, chosenSn);
//     }

//     static selectAR(mr: MelodyRhythm, arOptions: AccompRhythm[]): AccompRhythm {
//         return (arOptions[Math.floor(Math.random() * arOptions.length)] as AccompRhythm);  // Replace with intelligent selection algo
//     }

//     static selectAC(mr: MelodyRhythm, acOptions: AccompContour[]): AccompContour {
//         return (acOptions[Math.floor(Math.random() * acOptions.length)] as AccompContour);  // Replace with intelligent selection algo 
//     }

//     static selectSourceNotes(cStr: string) {
//         let s = new Scale(cStr, Scale.bases.major);
//         let slice = s.spacedSpan.filter(n => n.getOctave() >= 3);
//         return slice;
//     }

//     static renderAccompNS(ar: AccompRhythm, ac: AccompContour, sn: Note[]) {
//         if (ac.range > sn.length) {
//             throw new Error("AccompContour range beyond bounds of source note slice");
//         }

//         let result = new NoteSequence();
//         const rests = ar.getRests();

//         let noteBuffer = [];
//         let acInd = 0;

//         for (let i = 0; i < ar.length; i++) {
//             if (rests.includes(i)) {
//                 noteBuffer.push(null);
//             } else {
//                 let n = sn[ac.get(acInd)] as Note;
//                 acInd += 1;
                
//                 noteBuffer.push(n);

//                 if (noteBuffer.length === ar.subdivision) {
//                     result.append(noteBuffer);
//                     noteBuffer = [];
//                 }
//             }
//         }
    
//         return result;
//     }

// }