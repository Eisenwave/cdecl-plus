const cdecl = {showDiagnostic: id => showDiagnostic(id)};

const SPECIFIER_CONFLICTS = [
    ['class', 'struct', 'union', 'enum', 'char', 'int', 'float', 'double', 'void', '_Atomic()', 'typedef-name', 'bool'],
    ['class', 'struct', 'union', 'enum', 'char', 'short', 'long', 'float', 'void', '_Atomic()', 'bool'],
    ['class', 'struct', 'union', 'enum', 'char', 'short', 'long', 'typedef-name', 'bool'],
    ['class', 'struct', 'union', 'enum', 'void', 'complex', '_Atomic()', 'bool'],
    ['class', 'struct', 'union', 'enum', 'signed', 'unsigned', 'float', 'double', 'void', '_Atomic()'],
    ['class', 'struct', 'union', 'enum', 'signed', 'unsigned', 'complex'],
    ['int', 'complex'],
    ['char', 'short', 'long', 'void', 'bool', 'complex'],
    ['int', 'float', 'double', 'void', '_Atomic()'],
    ['char', 'short', 'float', 'double', 'void', '_Atomic()'],
    ['typedef', 'register', 'auto', 'extern', 'static', 'thread_local'],
    ['_Atomic', 'void']
];

const EXPLICIT_TYPE_SPECIFIERS = new Set([
    'void', 'char', 'int', 'bool',
    'float', 'double',
    'struct', 'class', 'union', 'enum',
    '_Atomic()', 'typedef-name']);

const IDIOMATIC_IMPLICIT_INT_SPECIFIERS = new Set([
    'short', 'long', 'signed', 'unsigned'
]);

const OUTER_SPECIFIER_TYPES = new Set([
    'storage-class-specifier',
    'function-specifier'
]);
const INNER_SPECIFIER_TYPES = new Set([
    'type-specifier',
    'type-qualifier',
    'struct-or-union-specifier',
    'enum-specifier',
    'typedef-name'
]);

const SPECIFIER_ORDERING = [
    'typedef', 'extern', 'static', 'thread_local', 'auto', 'register', 'inline',
    'const', 'volatile', 'restrict', '_Atomic',
    '_Atomic()', 'struct', 'class', 'enum', 'void', 'bool', 'char', 'short', 'long', 'int', 'float', 'double'
];

function astToProse(ast) {
    if (ast.declarators.length === 0) {
        throw {message: 'Nothing declared'};
    }

    const specifiersProse = specifiersToProse(ast.specifiers, 'top-level');

    const declarationProses = [];
    for (const declarator of ast.declarators) {
        declarationProses.push(declarationWithKnownSpecifiersToProse(specifiersProse, declarator, 'top-level'));
    }

    return declarationProses.join('\n\n').replace(/ +/g, ' ');
}

function declarationToProse(specifiers, declarator, kind) {
    return declarationWithKnownSpecifiersToProse(specifiersToProse(specifiers, kind), declarator, kind);
}

function declarationWithKnownSpecifiersToProse(specifiersProse, declarator, kind) {
    const histo = specifiersProse.histogram;
    if (histo.has('void')) {
        if (declarator.length !== 0 && declarator[declarator.length - 1].typ === '[]') {
            cdecl.showDiagnostic('array-of-void');
        }
        if (declarator.length !== 0 && ['&', '&&'].includes(declarator[declarator.length - 1].typ)) {
            cdecl.showDiagnostic('reference-to-void')
        }
        if (declarator.length === 1 && declarator[0].typ === 'id') {
            cdecl.showDiagnostic('void-variable')
        }
        // FIXME does this work for _Atomic(void) ?
        const isQualified = histo.has('const') || histo.has('volatile') || histo.has('restrict') || histo.has('_Atomic');
        if (kind === 'parameter' && (declarator.length === 0 || declarator.length === 1 && declarator[0].typ === 'id') && isQualified) {
            cdecl.showDiagnostic('qualified-void-parameter');
        }
    }

    const declaratorProse = declaratorToProse(declarator, kind);
    let result = declaratorProse.leadingIdentifier.length ? 'Declare ' + declaratorProse.leadingIdentifier + ' ' : ' ';
    result += specifiersProse.outer + ' ';
    result += declaratorProse.text + ' ';
    result += specifiersProse.inner + ' ';
    result += specifiersProse.atomic + ' ';
    result += declaratorProse.trailingIdentifier;
    return result.trim();
}

function specifiersToProse(specifiers, kind) {
    const specifierIds = specifiers.map(specifierToId);
    const histogram = makeHistogram(specifierIds);

    checkForMisuse(specifiers, kind);
    checkForConflicts(specifierIds);
    checkForDuplicates(histogram);

    if (!specifierIds.some(s => EXPLICIT_TYPE_SPECIFIERS.has(s))) {
        const toAdd = histogram.has('complex') ? 'double' : 'int';
        specifiers.push(['type-specifier', toAdd]);
        if (toAdd === 'double') {
            cdecl.showDiagnostic('implicit-double');
        } else if (toAdd === 'int' && !specifierIds.some(s => IDIOMATIC_IMPLICIT_INT_SPECIFIERS.has(s))) {
            cdecl.showDiagnostic('implicit-int');
        }
    }
    const atomicSpecifier = specifiers.filter(s => s[0] === 'atomic-type-specifier')[0];
    let atomicProse = atomicSpecifier !== undefined ?
        'atomic ' + declarationToProse(atomicSpecifier[1].specifiers, atomicSpecifier[1].declarator, 'atomic') : '';

    return {
        outer: processedSpecifiersToText(specifiers.filter(s => OUTER_SPECIFIER_TYPES.has(s[0]))),
        inner: processedSpecifiersToText(specifiers.filter(s => INNER_SPECIFIER_TYPES.has(s[0]))),
        atomic: atomicProse,
        histogram: histogram
    };
}

function specifierToId(s) {
    switch (s[0]) {
        case 'atomic-type-specifier':
            return '_Atomic()';
        case 'typedef-name':
            return 'typedef-name';
        case 'enum-specifier':
            return 'enum';
        default:
            return s[1];
    }
}

function makeHistogram(specifiers) {
    const result = new Map();
    specifiers.forEach(s => {
        result.set(s, (result.get(s) ?? 0) + 1);
    });
    return result;
}

function checkForConflicts(specifierIds) {
    for (const conflictPool of SPECIFIER_CONFLICTS) {
        let first = undefined;
        for (const s of specifierIds) {
            if (!conflictPool.includes(s))
                continue;
            if (first === undefined)
                first = s;
            else if (first !== s)
                throw {message: `Conflicting specifiers ${first} and ${s}`};
        }
    }
}

function checkForDuplicates(specifierHistogram) {
    for (let [key, val] of specifierHistogram) {
        if (key === 'long') {
            if (val > 2) {
                throw {message: 'long long long is too long'};
            }
            if (val > 1 && (specifierHistogram.get('double') > 0 || specifierHistogram.get('complex') > 0)) {
                throw {message: 'long long is not compatible with double and/or complex'}
            }
        } else if (val > 1) {
            throw {message: 'Duplicate specifier ' + key};
        }
    }
}

function checkForMisuse(specifiers, kind) {
    switch (kind) {
        case 'top-level':
            return;
        case 'atomic':
            specifiers.forEach(checkForSpecifierMisuseInAtomicTypeSpecifier);
            break;
        case 'parameter':
            specifiers.forEach(checkForSpecifierMisuseInFunctionParameter);
            break;
    }
}

function checkForSpecifierMisuseInAtomicTypeSpecifier(s) {
    switch (s[0]) {
        case 'storage-class-specifier':
            throw {message: 'Storage class specifier ' + s[1] + ' is not allowed in atomic type specifier'};
        case 'function-specifier':
            throw {message: 'Function specifier ' + s[1] + ' is not allowed in atomic type specifier'};
        case 'type-qualifier':
            throw {message: '_Atomic() type specifier of ' + s[1] + ' qualified type is not allowed'};
        case 'atomic-type-specifier':
            throw {message: 'Nested _Atomic() type specifier is not allowed'}
    }
}

function checkForSpecifierMisuseInFunctionParameter(s) {
    switch (s[0]) {
        case 'storage-class-specifier':
            throw {message: 'Storage class specifier ' + s[1] + ' is not allowed in function parameters'};
        case 'function-specifier':
            throw {message: 'Function specifier ' + s[1] + ' is not allowed in function parameters'};
    }
}

function processedSpecifiersToText(specifiers) {
    return specifiers
        .sort((a, b) => compareSpecifiers(a[1], b[1]))
        .map(specifierToText)
        .join(' ');
}

function compareSpecifiers(a, b) {
    return SPECIFIER_ORDERING.indexOf(a) - SPECIFIER_ORDERING.indexOf(b);
}

function specifierToText(specifier) {
    switch (specifier[0]) {
        case 'struct-or-union-specifier':
            return specifier.length > 2 ? specifier[1] + ' ' + specifier[2] : 'anonymous ' + specifier[1];
        case 'enum-specifier':
            return 'enum ' + specifier[1];
        default:
            return remapSpecifierTextForReadability(specifier[1]);
    }
}

function remapSpecifierTextForReadability(text) {
    return text === 'typedef' ? 'type alias for'
        : text === '_Atomic' ? 'atomic'
            : text;
}

function declaratorToProse(decl, kind) {
    const isParameter = kind === 'parameter';
    let result = '';
    let pluralS = '';
    let leadingIdentifier = '';
    let trailingIdentifier = '';
    let i = 0;
    for (const d of decl) {
        const isFirst = i === 0 || decl[i - 1].typ === 'id';
        switch (d.typ) {
            case 'id': {
                if (isParameter) {
                    trailingIdentifier = ' named ' + d.id;
                } else {
                    leadingIdentifier = ' ' + d.id + ' as';
                }
                break;
            }
            case '::': {
                if (i !== 0 && (decl[i - 1].typ === '&' || decl[i - 1].typ === '&&')) {
                    cdecl.showDiagnostic('reference-to-member');
                }

                const ns = d.id ?? 'global namespace';
                result += ` member${pluralS} of ${ns}, with type`;
                break;
            }
            case '*': {
                const q = d.qualifiers
                    .sort(compareSpecifiers)
                    .map(remapSpecifierTextForReadability)
                    .join(' ');
                result += ` ${q} pointer${pluralS} to`;
                pluralS = '';
                break;
            }
            case '&':
            case '&&': {
                if (i !== 0 && ['&', '&&'].includes(decl[i - 1].typ)) {
                    throw {message: 'Reference to reference is not allowed'};
                }
                if (i !== 0 && decl[i - 1].typ === '[]') {
                    cdecl.showDiagnostic('array-of-references');
                }
                if (i !== 0 && decl[i - 1].typ === '*') {
                    cdecl.showDiagnostic('pointer-to-reference');
                }

                const rvalue = d.typ === '&&' ? 'rvalue-' : '';
                result += ` ${rvalue}reference${pluralS} to`;
                pluralS = '';
                break;
            }
            case '[*]': {
                if (!isParameter || i > 1 || i === 1 && decl[0].typ !== 'id') {
                    cdecl.showDiagnostic('non-parameter-vla');
                }
                const q = d.qualifiers
                    .sort(compareSpecifiers)
                    .map(remapSpecifierTextForReadability)
                    .join(' ');
                result += ` ${q} VLA${pluralS} of unspecified size of`;
                pluralS = 's';
                break;
            }
            case '[]': {
                if (!isParameter && d.qualifiers.length !== 0) {
                    cdecl.showDiagnostic('qualified-array');
                }
                if (i !== 0 && decl[i - 1].typ === '()') {
                    cdecl.showDiagnostic('returning-array')
                }
                if (isParameter && isFirst) {
                    cdecl.showDiagnostic('array-to-pointer-decay');
                }
                if (isFirst && kind === 'atomic') {
                    cdecl.showDiagnostic('atomic-array');
                }
                if (d.size && d.size.value === 0) {
                    cdecl.showDiagnostic('zero-size-array');
                }

                const q = d.qualifiers.sort(compareSpecifiers).join(' ');
                const statik = d.statik ? ' (size checked)' : '';
                const size = d.size !== null ? `[${d.size.value}]` : '';
                result += ` ${q} array${pluralS}${size}${statik} of`;
                pluralS = 's';
                break;
            }
            case '()': {
                if (i !== 0 && decl[i - 1].typ === '()') {
                    cdecl.showDiagnostic('returning-function');
                }
                if (i !== 0 && decl[i - 1].typ === '[]') {
                    cdecl.showDiagnostic('array-of-functions');
                }
                if (isParameter && isFirst) {
                    cdecl.showDiagnostic('function-to-pointer-decay');
                }
                if (isFirst && kind === 'atomic') {
                    cdecl.showDiagnostic('atomic-function');
                }

                const paramsProses = [];
                for (const p of d.params) {
                    if (p.typ === '...') {
                        paramsProses.push('ellipsis parameter');
                    } else {
                        paramsProses.push(declarationToProse(p.specifiers, p.declarator, 'parameter'));
                    }
                }
                if (paramsProses.length === 0) {
                    cdecl.showDiagnostic('empty-function-parameters')
                }

                let overrideFinal = d.qualifiers[d.qualifiers.length - 1];
                if (!['override', 'final'].includes(overrideFinal)) {
                    overrideFinal = undefined;
                }
                const qualifiersFront = d.qualifiers.length === 0 ? []
                    : d.qualifiers.splice(0, d.qualifiers.length - Number(overrideFinal !== undefined));
                if (qualifiersFront.includes('_Atomic')) {
                    cdecl.showDiagnostic('atomic-qualified-function');
                }
                if (qualifiersFront.includes('restrict')) {
                    cdecl.showDiagnostic('restrict-qualified-function');
                }

                const qualifiersText = qualifiersFront.length === 0 ? '' : `${qualifiersFront.join('-')}-qualified`;
                const overrideText = overrideFinal === undefined ? ''
                    : (qualifiersText.length === 0 ? '' : ', ') + overrideFinal;

                const paramsText = paramsProses.join(', ').trim();
                const parenthesizedParams = paramsProses.length === 0 ? '' : `(${paramsText})`;
                result += ` ${qualifiersText}${overrideText} function${pluralS}${parenthesizedParams} returning`;
                pluralS = '';
                break;
            }
        }
        ++i;
    }
    return {
        text: result.trimLeft(),
        leadingIdentifier: leadingIdentifier,
        trailingIdentifier: trailingIdentifier
    };
}
