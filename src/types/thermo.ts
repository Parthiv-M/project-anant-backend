enum E {
    'Cd', 'Co', 'Zn', 'O'
}

interface searchObjects {
    E1?: E & string;
    E2?: E & string;
    E3?: E & string;
    E4?: E & string;
    E5?: E & string;
    currentPage?: number;
    isSuggest?: boolean;
}

export {
    E, searchObjects
}
