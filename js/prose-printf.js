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
    'ld': 'long',
    'li': 'long',
    'lld': 'long long',
    'lli': 'long long',
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

const SCANF_TYPES = {
    'c': 'char*',
    'lc': 'wchar_t*',
    's': 'char*',
    'ls': 'wchar_t*',
    '[]': 'char*',
    'l[]': 'wchar_t*',

    'hhd': 'signed char* or unsigned char*',
    'hhi': 'signed char* or unsigned char*',
    'hho': 'signed char* or unsigned char*',
    'hhu': 'signed char* or unsigned char*',
    'hhx': 'signed char* or unsigned char*',
    'hhX': 'signed char* or unsigned char*',
    'hhn': 'signed char* or unsigned char*',

    'hd': 'short* or unsigned short*',
    'hi': 'short* or unsigned short*',
    'ho': 'short* or unsigned short*',
    'hu': 'short* or unsigned short*',
    'hx': 'short* or unsigned short*',
    'hX': 'short* or unsigned short*',
    'hn': 'short* or unsigned short*',

    'd': 'int* or unsigned int*',
    'i': 'int* or unsigned int*',
    'o': 'int* or unsigned int*',
    'u': 'int* or unsigned int*',
    'x': 'int* or unsigned int*',
    'X': 'int* or unsigned int*',
    'n': 'int* or unsigned int*',

    'ld': 'long* or unsigned long*',
    'li': 'long* or unsigned long*',
    'lo': 'long* or unsigned long*',
    'lu': 'long* or unsigned long*',
    'lx': 'long* or unsigned long*',
    'lX': 'long* or unsigned long*',
    'ln': 'long* or unsigned long*',

    'lld': 'long long* or unsigned long long*',
    'lli': 'long long* or unsigned long long*',
    'llo': 'long long* or unsigned long long*',
    'llu': 'long long* or unsigned long long*',
    'llx': 'long long* or unsigned long long*',
    'llX': 'long long* or unsigned long long*',
    'lln': 'long long* or unsigned long long*',

    'jd': 'intmax_t* or uintmax_t*',
    'ji': 'intmax_t* or uintmax_t*',
    'jo': 'intmax_t* or uintmax_t*',
    'ju': 'intmax_t* or uintmax_t*',
    'jx': 'intmax_t* or uintmax_t*',
    'jX': 'intmax_t* or uintmax_t*',
    'jn': 'intmax_t* or uintmax_t*',

    'zd': 'size_t*',
    'zi': 'size_t*',
    'zo': 'size_t*',
    'zu': 'size_t*',
    'zx': 'size_t*',
    'zX': 'size_t*',
    'zn': 'size_t*',

    'td': 'ptrdiff_t*',
    'ti': 'ptrdiff_t*',
    'to': 'ptrdiff_t*',
    'tu': 'ptrdiff_t*',
    'tx': 'ptrdiff_t*',
    'tX': 'ptrdiff_t*',
    'tn': 'ptrdiff_t*',

    'f': 'float*',
    'F': 'float*',
    'e': 'float*',
    'E': 'float*',
    'a': 'float*',
    'A': 'float*',
    'g': 'float*',
    'G': 'float*',

    'lf': 'double*',
    'lF': 'double*',
    'le': 'double*',
    'lE': 'double*',
    'la': 'double*',
    'lA': 'double*',
    'lg': 'double*',
    'lG': 'double*',

    'Lf': 'long double*',
    'LF': 'long double*',
    'Le': 'long double*',
    'LE': 'long double*',
    'La': 'long double*',
    'LA': 'long double*',
    'Lg': 'long double*',
    'LG': 'long double*',

    'p': 'void**'
};

const ARGUMENTS_TITLE = "ARGUMENTS & EXPECTED TYPES";
const ARGUMENTS_HEADER = `\n\n${ARGUMENTS_TITLE}\n${'-'.repeat(ARGUMENTS_TITLE.length)}`;

function printfArgsToProse(ast) {
    return formatArgsToProse(ast['printfArgs'], false);
}

function scanfArgsToProse(ast) {
    return formatArgsToProse(ast['scanfArgs'], true);
}

function formatArgsToProse(args, isScanf) {
    if (args.length === 0) {
        throw {message: 'printf requires at least one argument'};
    }

    let {prose, types} = formatStringToProse(args[0], isScanf);
    const expectedArgsCount = Math.max(args.length, types.length + 1);

    if (expectedArgsCount > 1) {
        prose += ARGUMENTS_HEADER;
    }


    for (let i = 1; i < expectedArgsCount; ++i) {
        const expr = args[i]?.replaceAll(' ', '') ?? 'MISSING';
        const typ = types[i - 1] ?? 'TOO MANY ARGUMENTS';
        prose += `\n${expr} (${typ})`;
    }

    return prose;
}

function formatStringToProse(parts, isScanf) {
    const proses = parts.map(e => formatSpecifierToProse(e, isScanf));
    return {
        prose: proses.map(p => p.prose).join('\n'),
        types: proses.map(p => p.types).flat()
    };
}

function formatSpecifierToProse(specifier, isScanf) {
    if (specifier.typ === 'literal') {
        const prose = isScanf ? `Match "${specifier.value}"`
                              : `Write "${specifier.value}"`;
        return {prose, types: []};
    }
    if (specifier.typ === 'whitespace') {
        // can only appear in scanf, merged to literal in printf
        return {
            prose: `Match any amount of whitespace`,
            types: []
        }
    }

    const typKey = specifier.length + specifier.value;
    const typ = (isScanf ? SCANF_TYPES : PRINTF_TYPES)[typKey];

    if (specifier.value !== '%' && !typ)
        throw {message: `Invalid format specifier %${typKey}`};

    const {header, details, types}
        = formatSpecifierWithTypeToProse(specifier, typ, isScanf);
    const indent = '    ';
    const prose = header + (details.length ? '\n' + details.map(p => indent + p).join('\n') : '');

    return {prose, types};
}

function printfFlagToProse(flag, kind) {
    switch (flag) {
        case '-':
            return `left-justify within the field`;
        case '+':
            return `prepend plus sign for positive numbers`;
        case ' ':
            return `prepend space for positive numbers`;
        case '0':
            return 'zero-pad the field';
        case '#':
            switch (kind) {
                case 'o':
                    return 'minimum digit count increased automatically';
                case 'x':
                case 'X':
                    return '"0x" is prefixed for nonzero numbers';
                case 'f':
                case 'F':
                case 'e':
                case 'E':
                case 'a':
                case 'A':
                    return 'decimal point is always written';
                case 'g':
                case 'G':
                    return 'preserve trailing zeros';
                default:
                    return 'invalid use of alternative flag';
            }
    }
}

function formatSpecifierFlagsToProse(specifier) {
    const result = [];

    const flagsSeen = new Set();
    for (const flag of specifier.flags) {
        if (!flagsSeen.has(flag)) {
            result.push(`${flag}: ${printfFlagToProse(flag, specifier.value)}`);
            flagsSeen.add(flag);
        }
    }

    return result;
}

const PRECISION_MEANINGS = {
    's': 'maximum string length',
    'o': 'minimum digit count',
    'x': 'minimum digit count',
    'X': 'minimum digit count',
    'u': 'minimum digit count',
};

function printfFieldWidthToProse(specifier, typ, details) {
    const types = [];

    if (typ) {
        types.push(typ);
    }

    if (typeof(specifier.width) === 'number') {
        details.push(`field width: ${specifier.width}`);
    }
    else if (specifier.width === '*') {
        types.push('int');
        details.push('*: field width is read from int argument');
    }

    return types;
}

function scanfWidthToProse(specifier, typ, details) {
    const types = [];

    if (typeof(specifier.width) === 'number') {
        switch (specifier.value) {
            case 'c':
            case 's':
            case '[]':
                details.push(`maximum string length: ${specifier.width}`);
                break;
            default:
                details.push(`${specifier.width}: INVALID USE OF STRING LENGTH`);
        }
    }
    else if (specifier.width === '*') {
        details.push('*: suppress assignment');
    }
    else if (typ) {
        types.push(typ);
    }

    return types;
}

function formatSpecifierWithTypeToProse(specifier, typ, isScanf) {
    const details = isScanf ? specifier.flags.length ? ['INVALID USE OF PRINTF FLAGS IN SCANF'] : []
                            : formatSpecifierFlagsToProse(specifier);

    const header = isScanf ? scanfSpecifierWithTypeToProseHeader(specifier, typ)
                           : printfSpecifierWithTypeToProseHeader(specifier, typ);
    const types = (isScanf ? scanfWidthToProse : printfFieldWidthToProse)(specifier, typ, details);

    // FIXME: both assignment suppression and field width are currently
    //        not supported

    if (isScanf) {
        if (specifier.precision) {
            details.push(`${specifier.precision}: INVALID USE OF PRINTF PRECISION IN SCANF`);
        }
    }
    else {
        const precisionName = PRECISION_MEANINGS[specifier.value] ?? 'precision';
        if (typeof(specifier.precision) === 'number') {
            details.push(`${precisionName}: ${specifier.precision}`);
        }
        else if (specifier.precision === '*') {
            types.push('int');
            details.push(`.*: ${precisionName} is read from int argument`);
        }
    }

    if (isScanf && specifier.value === '[]') {
        const incl = specifier.negated ? 'excludes' : 'includes';
        for (const range of specifier.ranges) {
            details.push(range[0] === range[1] ?
                `set ${incl} ${range[0]}` :
                `set ${incl} range ${range[0]}-${range[1]}`);
        }
    }

    return {header, details, types};
}

function scanfSpecifierWithTypeToProseHeader(specifier, typ) {
    switch (specifier.value) {
        case '%':
            return 'Match "%"';
        case 'c':
            return typeof(specifier.width) === 'number' ?
                `Read one or multiple characters ${typ}, with no null-terminator emitted` :
                `Read a single character to ${typ}`;
        case 's':
            return `Read sequence of non-whitespace characters to ${typ}, append null-terminator`;
        case '[]':
            return `Read a non-empty sequence of characters in set to ${typ}`;
        case 'd':
            return `Read decimal integer to ${typ} as if by strtol(..., 10)`;
        case 'i':
            return `Read integer to ${typ} as if by strtol(..., 0)`;
        case 'o':
            return `Read integer to ${typ} as if by strtoul(..., 8)`;
        case 'x':
        case 'X':
            return `Read integer to ${typ} as if by strtoul(..., 16)`;
        case 'u':
            return `Read decimal integer to ${typ} as if by strtoul(..., 10)`;
        case 'f':
        case 'F':
        case 'e':
        case 'E':
        case 'a':
        case 'A':
        case 'g':
        case 'G':
            return `Read a floating-point number to ${typ} as if by strtof(...)`;
        case 'n':
            return `Store the number of characters read so far in ${typ}`;
        case 'p':
            return `Read an implementation-defined sequence defining a pointer to ${typ}`;
    }
}

function printfSpecifierWithTypeToProseHeader(specifier, typ) {
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
            return `Write a null-terminated string of type ${typ}`;
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