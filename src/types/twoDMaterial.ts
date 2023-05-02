enum F {
    'NCS', 'SH', 'NO', 'OH', 'PH', 'NCO', 'Cl', 'OCN', 'Se', 'F', 'SCN', 'S', 'O', 'I', 'Te', 'NC', 'Br', 'CN', 'NH'
}

enum M {
    'Bi', 'Cr', 'La', 'W', 'Zn', 'Ga', 'Pt', 'Cu', 'Y', 'Rh', 'Ru', 'Hf', 'Sn', 'Mo', 'Al', 'Tc', 'Os', 'Fe', 'Zr', 'Sm', 'Lu', 'Ce', 'Be', 'Ba', 'Sc', 'Re', 'Ge', 'Ti', 'Cd', 'Pb', 'Ni', 'Sr', 'Ca', 'Nd', 'Ir', 'Te', 'In', 'Pd', 'Mn', 'Gd', 'Mg', 'Co'
}

interface searchById {
    id: string;
}

interface searchObjects {
    F1?: F & string;
    F2?: F & string;
    M?: M & string;
    currentPage?: number;
    isSuggest?: boolean;
}

export {
    F, M, searchById, searchObjects
}