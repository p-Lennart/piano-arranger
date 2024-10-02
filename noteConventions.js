function sharp(label) {
    return `${label}#`;
}

function flat(label) {
    return `${label}b`;
}

function note(label, octave) {
    return `${label}${octave}`;
}

module.exports = {

    noteChars: { // Octave -1
        "C": 0,
        "D": 2,
        "E": 4,
        "F": 5,
        "G": 7,
        "A": 9,
        "B": 11,
    },

    scale: (note) => {
        let scales = {
            "C": ["C", "D", "E", "F", "G", "A", "B"],
            "D": ["D", "E", sharp("F"), "G", "A", "B", sharp("C")],
            "E": ["E", sharp("F"), sharp("G"), "A", "B", sharp("C"), sharp("D")],
            "F": ["F", "G", "A", flat("B"), "C", "D", "E"],
            "G": ["G", "A", "B", "C", "D", "E", sharp("F")],
            "A": ["A", "B", sharp("C"), "D", "E", sharp("F"), sharp("G")],
            "B": ["B", sharp("C"), sharp("D"), E, sharp("F"), sharp("G"), sharp("A")],
        };
        scales[flat("D")] = [flat("D"), flat("E"), "F", flat("G"), flat("A"), flat("B"), "C"];
        scales[flat("E")] = [flat("E"), "F", "G", flat("A"), flat("B"), "C", "D"];
        scales[sharp("F")] = [sharp("F"), sharp("G"), sharp("A"), "B", sharp("C"), sharp("D"), "F"];
        scales[flat("A")] = [flat("A"), flat("B"), "C", flat("D"), flat("E"), "F", "G"];
        scales[flat("B")] = [flat("B"), "C", "D", flat("E"), "F", "G", "A"];

        return scales[note];
    },

    sharp: sharp,

    flat: flat,
    
    note: note,

}