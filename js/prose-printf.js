const PRINTF_TYPES = {
    'c': 'int',
    'lc': 'wint_t',

    's': 'char*',
    'ls': 'wchar_t*',

    'hhd': 'signed char',
    'hhi': 'signed char',
    'hd': 'short',
    'hi': 'short',
    'd': 'int',
    'i': 'int',
    'ld': 'long int',
    'li': 'long int',
    'lld': 'long long int',
    'lli': 'long long int',
    'jd': 'intmax_t',
    'ji': 'intmax_t',
    'zd': 'ssize_t',
    'zi': 'ssize_t',
    'td': 'ptrdiff_t',
    'ti': 'ptrdiff_t',

    'hho': 'unsigned char',
    'hhx': 'unsigned char',
    'hhX': 'unsigned char',
    'hhu': 'unsigned char',
    'ho': 'unsigned short',
    'hx': 'unsigned short',
    'hX': 'unsigned short',
    'hu': 'unsigned short',
    'o': 'unsigned int',
    'x': 'unsigned int',
    'X': 'unsigned int',
    'u': 'unsigned int',
    'lo': 'unsigned long',
    'lx': 'unsigned long',
    'lX': 'unsigned long',
    'lu': 'unsigned long',
    'llo': 'unsigned long long',
    'llx': 'unsigned long long',
    'llX': 'unsigned long long',
    'llu': 'unsigned long long',
    'jo': 'uintmax_t',
    'jx': 'uintmax_t',
    'jX': 'uintmax_t',
    'ju': 'uintmax_t',
    'zo': 'size_t',
    'zx': 'size_t',
    'zX': 'size_t',
    'zu': 'size_t',
    'to': 'unsigned ptrdiff_t',
    'tx': 'unsigned ptrdiff_t',
    'tX': 'unsigned ptrdiff_t',
    'tu': 'unsigned ptrdiff_t',

    'f': 'double',
    'F': 'double',
    'e': 'double',
    'E': 'double',
    'a': 'double',
    'A': 'double',
    'g': 'double',
    'G': 'double',

    'lf': 'double',
    'lF': 'double',
    'le': 'double',
    'lE': 'double',
    'la': 'double',
    'lA': 'double',
    'lg': 'double',
    'lG': 'double',

    'Lf': 'long double',
    'LF': 'long double',
    'Le': 'long double',
    'LE': 'long double',
    'La': 'long double',
    'LA': 'long double',
    'Lg': 'long double',
    'LG': 'long double',

    'hhn': 'signed char*',
    'hn': 'short*',
    'n': 'int*',
    'ln': 'long*',
    'lln': 'long long*',
    'jn': 'intmax_t*',
    'zn': 'ssize_t*',
    'tn': 'ptrdiff_t*',

    'p': 'void*'
};

function printfArgsToProse(ast) {
    let out = "";

    let types = undefined;

    for (let i = 0; i < ast.printfArgs.length; ++i) {
        if (i === 0) {
            const res = formatStringToProse(ast.printfArgs[i]);
            out += res.prose;
            types = res.types;
            console.log(types);
            continue;
        }
        const typ = types[i - 1] ?? 'TOO MANY ARGUMENTS';
        out += `\n\n${printfArgumentToProse(ast.printfArgs[i], i)} (${typ})`;
    }

    return out;
}

function formatStringToProse(parts) {
    const proses = parts.map(formatSpecifierToProse);
    return {
        prose: proses.map(p => p.prose).join('\n'),
        types: proses.map(p => p.typ).filter(p => p)
    };
}

function formatSpecifierToProse(specifier) {
    if (specifier.typ === 'literal') {
        return {
            prose: `Write "${specifier.value}"`,
            typ: null
        };
    }

    const typKey = specifier.length + specifier.value;
    const typ = PRINTF_TYPES[typKey];

    if (specifier.value !== '%' && !typ)
        throw {message: `Invalid format specifier %${typKey}`};

    return {
        prose: formatSpecifierWithTypeToProse(specifier, typ),
        typ
    };
}

function formatSpecifierWithTypeToProse(specifier, typ) {
    const cas = specifier.value === specifier.value.toUpperCase() ? 'upper-case'
        : 'lower-case';

    switch (specifier.value) {
        case '%':
            return 'Write "%"';
        case 'c': {
            const convType = specifier.length === 'l' ? 'wchar_t[2]'
                : 'unsigned char';
            return `Write single character of type ${typ}, converted to ${convType}`;
        }
        case 's':
            return `Write a null-terminated ${typ} string of type`;
        case 'd':
        case 'i':
            return `Write a decimal ${typ}`;
        case 'o':
            return `Write an octal ${typ}`;
        case 'x':
        case 'X':
            return `Write a hexadecimal ${typ} using ${cas} letters`;
        case 'u':
            return `Write a decimal ${typ}`;
        case 'f':
        case 'F':
            return `Write a decimal ${typ} with ${cas} infinity/NaN symbols`;
        case 'e':
        case 'E':
            return `Write a ${typ} in decimal exponent notation, with ${cas} infinity/NaN symbols`;
        case 'a':
        case 'A':
            return `Write a ${typ} in hexadecimal exponent notation, with ${cas} infinity/NaN symbols`;
        case 'g':
        case 'G':
            return `Write a ${typ} in notation which depends on the value, with ${cas} infinity/NaN symbols`;
        case 'n':
            return `Write the number of characters written so far to ${typ}`;
        case 'p':
            return `Write an implementation-defined sequence defining a ${typ}`;
    }
}

function printfArgumentToProse(str, index) {
    return `Arg ${index}: ${str.replaceAll(' ', '')}`;
}