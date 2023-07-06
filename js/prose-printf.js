"use strict";

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

const NUMBER_PRECISION_MEANING = "minimum digit count (left-pad with '0')";
const FLOATING_PRECISION_MEANING = "number of fractional digits";

const PRECISION_MEANINGS = {
    's': 'maximum string length',
    'd': NUMBER_PRECISION_MEANING,
    'i': NUMBER_PRECISION_MEANING,
    'o': NUMBER_PRECISION_MEANING,
    'x': NUMBER_PRECISION_MEANING,
    'X': NUMBER_PRECISION_MEANING,
    'u': NUMBER_PRECISION_MEANING,
    'f': FLOATING_PRECISION_MEANING,
    'F': FLOATING_PRECISION_MEANING,
    'e': FLOATING_PRECISION_MEANING,
    'E': FLOATING_PRECISION_MEANING,
    'a': FLOATING_PRECISION_MEANING,
    'A': FLOATING_PRECISION_MEANING,
    'g': FLOATING_PRECISION_MEANING,
    'G': FLOATING_PRECISION_MEANING,
};

const FORMAT_FUNCTION_PREFIX_TYPES = {
    scanf: [],
    fscanf: ["FILE*"],
    sscanf: ["const char*"],
    scanf_s: [],
    fscanf_s: ["FILE*"],
    sscanf_s: ["const char*"],

    printf: [],
    sprintf: ["char*"],
    fprintf: ["FILE*"],
    snprintf: ["char*", "size_t"],
    printf_s: [],
    fprintf_s: ["FILE*"],
    sprintf_s: ["char*", "rsize_t"],
    snprintf_s: ["char*", "rsize_t"]
};

const NTH_ENGLISH = ['0th', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

const ARGUMENTS_TITLE = "ARGUMENTS & EXPECTED TYPES";
const ARGUMENTS_HEADER = `\n\n${ARGUMENTS_TITLE}\n${'-'.repeat(ARGUMENTS_TITLE.length)}`;

/**
 * Converts a call to a scanf/printf family function to prose.
 * @param {string} functionName the function name
 * @param {ConvSpecification[]} args the arguments, where string arguments are base-64 encoded
 * @returns {string} the prose
 * @typedef {{typ: string, value: string}} ConvSpecification
 */
function formatArgsToProse(functionName, args) {
    if (args.length === 0) {
        throw {message: 'printf requires at least one argument'};
    }
    args.filter(arg => arg.typ === 'string')
        .forEach(arg => arg.value = atob(arg.value));

    cdecl.showDiagnostic(`${functionName}-io`);

    const isScanf = functionName.includes('scanf');
    const isSafe = functionName.endsWith('_s');

    cdecl.showDiagnostic(isScanf ? 'scanf' : 'printf');
    if (isSafe) {
        cdecl.showDiagnostic('format-bounds-checked')
    }

    const parser = isScanf ? SCANF_PARSER : PRINTF_PARSER;
    const prefixTypes = FORMAT_FUNCTION_PREFIX_TYPES[functionName];
    const firstVaIndex = prefixTypes.length + 1;
    const formatString = args[firstVaIndex - 1];

    if (args.length < firstVaIndex) {
        throw {message: `${functionName} requires at least ${firstVaIndex} arguments, got ${args.length}`};
    }
    if (formatString.typ !== 'string') {
        throw {message: `Expected format string for ${NTH_ENGLISH[firstVaIndex]} argument, got "${formatString.value}"`}
    }

    let parsedFormat;
    try {
        parsedFormat = parser.parse(formatString.value);
    } catch (e) {
        if (e.name === 'SyntaxError') {
            cdecl.showDiagnostic('format-syntax-error');
            return '';
        }
        throw e;
    }

    const {prose, types} = formatStringToProse(parsedFormat, isScanf, isSafe);
    const allTypes = [...prefixTypes, ...types];

    return prose + formatStringArgsToProse(args, firstVaIndex, allTypes);
}

/**
 * Converts format string arguments to prose.
 * @param {{value: string}[]} args the arguments
 * @param {number} firstVaIndex the index of the first variadic argument to the function
 * @param {string[]} types the list of expected argument types
 * @returns {string}
 */
function formatStringArgsToProse(args, firstVaIndex, types) {

    const relevantArgsCount = Math.max(args.length, types.length + 1);

    if (args.length < types.length + 1) {
        cdecl.showDiagnostic('format-not-enough-args');
    }
    else if (args.length > types.length + 1) {
        cdecl.showDiagnostic('format-too-many-args');
    }

    let prose = relevantArgsCount > 1 ? ARGUMENTS_HEADER : '';

    for (let i = 0, t = 0; i < relevantArgsCount; ++i) {
        if (i + 1 === firstVaIndex) {
            continue; // skip format string, but keep all args before/after
        }

        const expr = args[i]?.value.replaceAll(' ', '') ?? 'MISSING';
        const typ = types[t++];
        prose += `\n${expr}${typ ? ` (${typ})` : ''}`;
    }

    return prose;
}

/**
 * Returns true if a specifier skips leading whitespace automatically.
 * @param {{typ: string, value: string}} spec the specification
 * @returns {boolean}
 */
function isSpecifierSkippingWhitespace(spec) {
    return spec.typ === 'whitespace' ||
           spec.typ === '%' && spec.value !== 'c' && spec.value !== '[]';
}

/**
 * Converts a format string to prose.
 * @param {*[]} parts the literal and format specifier parts of the prose
 * @param {boolean} isScanf true if this is a scanf function
 * @param {boolean} isSafe true if this is a safe function (_s)
 * @returns {{prose: Object, types: FlatArray<*, 1>[]}}
 */
function formatStringToProse(parts, isScanf, isSafe) {
    function isWhitespaceProblematic(p, i) {
        if (isSpecifierSkippingWhitespace(p)) {
            return false;
        }
        return i === 0 || parts[i - 1].typ !== 'whitespace';
    }
    if (isScanf && parts.find(isWhitespaceProblematic)) {
        cdecl.showDiagnostic('scanf-leading-whitespace');
    }

    const proses = parts.map(e => formatSpecifierToProse(e, isScanf, isSafe));
    return {
        prose: proses.map(p => p.prose).join('\n'),
        types: proses.map(p => p.types).flat()
    };
}

/**
 * Converts a conversion specifier to prose and type information of the arguments.
 * @param {{typ: string, length: string, value:string}} specifier the specifier object
 * @param {boolean} isScanf true if this is a scanf family function
 * @param {boolean} isSafe true if this is a safe function (_s)
 * @returns {{prose: string, types: string[]}}
 */
function formatSpecifierToProse(specifier, isScanf, isSafe) {
    if (specifier.typ === 'literal') {
        const prose = isScanf ? `Match "${specifier.value}"`
                              : `Write "${specifier.value}"`;
        return {prose, types: []};
    }
    if (specifier.typ === 'whitespace') {
        // can only appear in scanf, merged to literal in printf
        const prose = `Match any amount of whitespace`;
        return {prose, types: []};
    }

    const typKey = specifier.length + specifier.value;
    const typ = (isScanf ? SCANF_TYPES : PRINTF_TYPES)[typKey];

    if (specifier.value !== '%' && !typ) {
        throw {message: `Invalid format specifier %${typKey}`};
    }

    const {header, details, types}
        = formatSpecifierWithTypeToProse(specifier, typ, isScanf, isSafe);
    const indent = '    ';
    const prose = header + (details.length ? '\n' + details.map(p => indent + p).join('\n') : '');

    return {prose, types};
}

/**
 * Converts a printf flag to prose.
 * @param {string} flag the flag
 * @param {string} kind the kind of format specifier (s, d, etc.)
 * @returns {string} the prose
 */
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

/**
 * Converts conversion specification flags to prose, ignoring any duplicates.
 * @param {Object} specifier the specification object
 * @returns {string[]} an array of prose for each flag
 */
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

/**
 * Converts the field width of a conversion specification to prose.
 * @param {Object} specifier the specification object
 * @param {string?} typ the specifier type, if any
 * @param {string[]} details the output list of detail prose for the specifier
 * @returns {{typ: string | null, extraTypes: string[]}}
 */
function printfFieldWidthToProse(specifier, typ, details) {
    const extraTypes = [];

    if (typeof(specifier.width) === 'number') {
        details.push(`${specifier.width}: field width`);
    }
    else if (specifier.width === '*') {
        extraTypes.push('int');
        details.push('*: field width is read from int argument');
    }

    return {typ: typ ?? null, extraTypes};
}

/**
 * Converts the scanf conversion specification width to prose.
 * @param {Object} specifier the specification object
 * @param {string?} typ the type, if any
 * @param {string[]} details the output details list
 * @param {boolean} isSafe true if this is for a safe (_s) function
 * @returns {{typ: string | null, extraTypes: string[]}}
 */
function scanfWidthToProse(specifier, typ, details, isSafe) {
    if (specifier.supressed) {
        details.push('*: suppress assignment');
    }
    if (typeof(specifier.width) === 'number') {
        details.push(`${specifier.width}: maximum field width (in characters)`);
    }
    if (specifier.supressed) {
        return {typ: null, extraTypes: []};
    }

    const extraTypes = [];
    if (isSafe && ['s', 'c', '[]'].includes(specifier.value)) {
        cdecl.showDiagnostic('rsize_t');
        extraTypes.push('rsize_t');
        details.push('_s: receiving buffer size is read from rsize_t argument');
        if (typeof(specifier.width) === 'number') {
            cdecl.showDiagnostic('scanf-max-field-width-_s')
        }
    }

    return {typ: typ ?? null, extraTypes}
}

/**
 * Returns the prose of a single format specifier, with the type already determined.
 * @param specifier the format specifier object
 * @param {string?} typ the type of the format specifier, if any (may be undefined for %n)
 * @param {boolean} isScanf true if this is a scanf format specifier
 * @param {boolean} isSafe true
 * @returns {{types: string[], header: string, details: string[]}}
 */
function formatSpecifierWithTypeToProse(specifier, typ, isScanf, isSafe) {
    const details = isScanf ? [] : formatSpecifierFlagsToProse(specifier);
    const header = isScanf ? scanfSpecifierWithTypeToProseHeader(specifier, typ)
                           : printfSpecifierWithTypeToProseHeader(specifier, typ);
    const typesObj = (isScanf ? scanfWidthToProse : printfFieldWidthToProse)(specifier, typ, details, isSafe);

    if (isScanf) {
        if (specifier.value === '[]') {
            const incl = specifier.negated ? 'excludes' : 'includes';
            for (const range of specifier.ranges) {
                details.push(range[0] === range[1] ?
                    `set ${incl} ${range[0]}` :
                    `set ${incl} range ${range[0]}-${range[1]}`);
            }
        }
        if (!isSafe && (specifier.value === 's' || specifier.value === '[]') &&
            specifier.width === null) {
            cdecl.showDiagnostic('scanf-unbounded-string');
        }
        if (specifier.value === '%' && (specifier.supressed || specifier.width !== null || specifier.length)) {
            cdecl.showDiagnostic('scanf-%%');
        }
    }
    else {
        const precisionName = PRECISION_MEANINGS[specifier.value] ?? 'precision';
        if (typeof(specifier.precision) === 'number') {
            details.push(`${precisionName}: ${specifier.precision}`);
        }
        else if (specifier.precision === '*') {
            typesObj.extraTypes.push('int');
            details.push(`.*: ${precisionName} is read from int argument`);
        }
        else if (specifier.precision === '.') {
            details.push(`.: ${precisionName} is taken as zero`)
        }

        if (specifier.value === '%' && (specifier.flags.length || specifier.width !== null || specifier.precision !== null || specifier.length)) {
            cdecl.showDiagnostic('printf-%%');
        }
    }

    const types = typesObj.extraTypes;
    if (typesObj.typ !== null) {
        types.push(typesObj.typ);
    }

    return {header, details, types};
}

/**
 * Converts a scanf conversion specification object to prose.
 * @param {{typ: string, width: number | '*', value: string}} specifier the specification object
 * @param {string?} typ the type, if any
 * @returns {string}
 */
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

/**
 * Converts a printf conversion specification to a prose header.
 * @param {{typ: string, length: string, value: string}} specifier the specification
 * @param {string?} typ the type, if any
 * @returns {string}
 */
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