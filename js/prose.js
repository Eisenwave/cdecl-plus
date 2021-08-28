const SPECIFIER_CONFLICTS = [
    ['class', 'struct', 'union', 'enum', 'char', 'int', 'float', 'double', 'void', '_Atomic()'],
    ['class', 'struct', 'union', 'enum', 'char', 'short', 'long', 'float', 'void', '_Atomic()'],
    ['class', 'struct', 'union', 'enum', 'char', 'short', 'long',],
    ['class', 'struct', 'union', 'enum', 'void', 'complex', '_Atomic()'],
    ['class', 'struct', 'union', 'enum', 'signed', 'unsigned', 'float', 'double', 'void', '_Atomic()'],
    ['class', 'struct', 'union', 'enum', 'signed', 'unsigned', 'complex'],
    ['int', 'complex'],
    ['char', 'short', 'short', 'void', 'bool', 'complex'],
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
    if (kind !== 'parameter') {
        const isArrayDeclaration = declarator.length >= 1 && declarator[0].typ === '[]'
            || declarator.length >= 2 && declarator[0].typ === 'id' && declarator[1].typ === '[]';
        if (isArrayDeclaration && specifiersProse.histogram.has('void')) {
            showDiagnostic('array-of-void');
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
    const specifiersText = specifiers
        .map(s => s[0] === 'atomic-type-specifier' ? '_Atomic()' : s[0] === 'typedef-name' ? 'typedef-name' : s[1]);

    const histogram = makeHistogram(specifiersText);

    checkForMisuse(specifiers, kind);
    checkForConflicts(specifiersText);
    checkForDuplicates(histogram);

    if (!specifiersText.some(s => EXPLICIT_TYPE_SPECIFIERS.has(s))) {
        const toAdd = histogram.has('complex') ? 'double' : 'int';
        specifiers.push(['type-specifier', toAdd]);
        if (toAdd === 'double') {
            showDiagnostic('implicit-double');
        } else if (toAdd === 'int' && !specifiersText.some(s => IDIOMATIC_IMPLICIT_INT_SPECIFIERS.has(s))) {
            showDiagnostic('implicit-int');
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

function makeHistogram(specifiers) {
    const result = new Map();
    specifiers.forEach(s => {
        result.set(s, (result.get(s) ?? 0) + 1);
    });
    return result;
}

function checkForConflicts(specifiers) {
    for (const conflictPool of SPECIFIER_CONFLICTS) {
        let first = undefined;
        for (const s of specifiers) {
            if (!conflictPool.includes(s))
                continue;
            if (first === undefined)
                first = s;
            else if (first !== s)
                throw {message: 'Conflicting specifiers ' + first + ' and ' + s};
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
    let text = specifier[1];
    if (specifier[0] === 'struct-or-union-specifier' || specifier[0] === 'enum-specifier') {
        text = specifier.length > 2 ? text + ' ' + specifier[2] : 'anonymous ' + text;
    }
    return remapSpecifierTextForReadability(text);
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
                const ns = d.id ?? 'global namespace';
                result += ` member${pluralS} of ${ns}, with type`;
                break;
            }
            case '*': {
                const q = d.qualifiers.sort(compareSpecifiers).map(remapSpecifierTextForReadability).join(' ');
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
                    showDiagnostic('array-of-references');
                }
                if (i !== 0 && decl[i - 1].typ === '*') {
                    showDiagnostic('pointer-to-reference');
                }

                const rvalue = d.typ === '&&' ? 'rvalue-' : '';
                result += ` ${rvalue}reference${pluralS} to`;
                pluralS = '';
                break;
            }
            case '[*]': {
                if (!isParameter || i > 1 || i === 1 && decl[0].typ !== 'id') {
                    showDiagnostic('non-parameter-vla');
                }
                const q = d.qualifiers.sort(compareSpecifiers).join(' ');
                result += ` ${q} VLA${pluralS} of unspecified size of`;
                pluralS = 's';
                break;
            }
            case '[]': {
                if (!isParameter && d.qualifiers.length !== 0) {
                    showDiagnostic('qualified-array');
                }
                if (i !== 0 && decl[i - 1].typ === '()') {
                    showDiagnostic('returning-array')
                }
                if (isParameter && isFirst) {
                    showDiagnostic('array-to-pointer-decay');
                }
                if (isFirst && kind === 'atomic') {
                    showDiagnostic('atomic-array');
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
                    showDiagnostic('returning-function');
                }
                if (i !== 0 && decl[i - 1].typ === '[]') {
                    showDiagnostic('array-of-functions');
                }
                if (isParameter && isFirst) {
                    showDiagnostic('function-to-pointer-decay');
                }
                if (isFirst && kind === 'atomic') {
                    showDiagnostic('atomic-function');
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
                    showDiagnostic('empty-function-parameters')
                }

                const paramsText = paramsProses.join(', ').trim();
                const parenthesizedParams = paramsProses.length === 0 ? '' : `(${paramsText})`;
                result += ` function${pluralS}${parenthesizedParams} returning`;
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
