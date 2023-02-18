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
    const typ = PRINTF_TYPES[typKey];

    if (specifier.value !== '%' && !typ)
        throw {message: `Invalid format specifier %${typKey}`};

    const {header, details, types} = formatSpecifierWithTypeToProse(specifier, typ);
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

function formatSpecifierWithTypeToProse(specifier, typ) {
    const details = formatSpecifierFlagsToProse(specifier);
    const header = formatSpecifierWithTypeToProseHeader(specifier, typ);
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

    const precisionName = PRECISION_MEANINGS[specifier.value] ?? 'precision';
    if (typeof(specifier.precision) === 'number') {
        details.push(`${precisionName}: ${specifier.precision}`);
    }
    else if (specifier.precision === '*') {
        types.push('int');
        details.push(`.*: ${precisionName} is read from int argument`);
    }

    return {header, details, types};
}

function formatSpecifierWithTypeToProseHeader(specifier, typ) {
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