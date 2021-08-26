const INPUT = document.getElementById("input");
const OUTPUT = document.getElementById("output");
const DEBUG_OUTPUT = document.getElementById("debug-output");

function sanitizeInput(input) {
    return input
        .trim()
        .replace(/\s+/g, ' ');
}

function pegParse(input) {
    return module.exports.parse(sanitizeInput(input));
}

function updatePageQuery(input) {
    const urlStart = window.location.href.split('?');
    const query = input.trim().length === 0 ? '' : '?decl=' + encodeURI(input);
    window.history.replaceState({}, null, urlStart[0] + query);
}

function parseInput(input) {
    updatePageQuery(input);

    if (input.trim().length === 0) {
        INPUT.className = '';
        OUTPUT.innerText = '';
        DEBUG_OUTPUT.innerText = '';
        return;
    }
    try {
        const result = pegParse(input);
        INPUT.className = '';
        try {
            OUTPUT.innerText = astToProse(result);
        } catch (e) {
            INPUT.className = 'error';
            OUTPUT.innerText = 'Error: ' + e.message;
            DEBUG_OUTPUT.innerText = e instanceof TypeError ? JSON.stringify(result, undefined, 4) : '';
            return;
        }
        DEBUG_OUTPUT.innerText = JSON.stringify(result, undefined, 4);
    } catch (e) {
        INPUT.className = 'error';
        OUTPUT.innerText = 'Syntax Error';
        DEBUG_OUTPUT.innerText = e.message;
    }
}

const Type = {
    CHAR: {id: 'c', name: 'char'},
    INT: {id: 'i', name: 'int'},
    SHORT: {id: 's', name: 'short int'},
    LONG: {id: 'l', name: 'long int'},
    LONG_LONG: {id: 'll', name: 'long long int'}
}

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

function checkForMisuse(specifiers, isParameter) {
    if (!isParameter) {
        return;
    }
    for (const s of specifiers) {
        if (s[0] === 'storage-class-specifier') {
            throw {message: 'Storage class specifier ' + s[1] + ' is not allowed in function parameters'};
        } else if (s[0] === 'function-specifier') {
            throw {message: 'Function specifier ' + s[1] + ' is not allowed in function parameters'};
        }
    }
}

function makeHistogram(specifiers) {
    const result = new Map();
    specifiers.forEach(s => {
        result.set(s, (result.get(s) ?? 0) + 1);
    });
    return result;
}

function compareSpecifiers(a, b) {
    return SPECIFIER_ORDERING.indexOf(a) - SPECIFIER_ORDERING.indexOf(b);
}

function specifiersToProse(specifiers, isParameter) {
    const specifiersText = specifiers
        .map(s => s[0] === 'atomic-type-specifier' ? '_Atomic()' : s[0] === 'typedef-name' ? 'typedef-name' : s[1]);

    const histogram = makeHistogram(specifiersText);

    checkForMisuse(specifiers, isParameter);
    checkForConflicts(specifiersText);
    checkForDuplicates(histogram);

    if (!specifiersText.some(s => EXPLICIT_TYPE_SPECIFIERS.has(s))) {
        const toAdd = histogram.has('complex') ? 'double' : 'int';
        specifiers.push(['type-specifier', toAdd]);
    }
    const atomicSpecifier = specifiers.filter(s => s[0] === 'atomic-type-specifier')[0];
    let atomicProse = atomicSpecifier !== undefined ?
        '_Atomic ' + declarationToProse(atomicSpecifier[1].specifiers, atomicSpecifier[1].declarator, true) : '';

    return {
        outer: processedSpecifiersToText(specifiers.filter(s => OUTER_SPECIFIER_TYPES.has(s[0]))),
        inner: processedSpecifiersToText(specifiers.filter(s => INNER_SPECIFIER_TYPES.has(s[0]))),
        atomic: atomicProse
    };
}

function processedSpecifiersToText(specifiers) {
    return specifiers
        .sort((a, b) => compareSpecifiers(a[1], b[1]))
        .map(specifierToText)
        .join(' ');
}

function specifierToText(specifier) {
    const text = specifier[0] === 'struct-or-union-specifier' || specifier[0] === 'enum-specifier'
        ? specifier[1] + ' ' + specifier[2] : specifier[1];
    return remapSpecifierTextForReadability(text);
}

function remapSpecifierTextForReadability(text) {
    return text === 'typedef' ? 'type alias for'
        : text === '_Atomic' ? 'atomic'
            : text;
}

function declaratorToProse(decl, isParameter) {
    let result = '';
    let pluralS = '';
    let leadingIdentifier = '';
    let trailingIdentifier = '';
    let i = 0;
    for (const d of decl) {
        switch (d.typ) {
            case 'id':
                if (isParameter) {
                    trailingIdentifier = ' named ' + d.id;
                } else {
                    leadingIdentifier = ' ' + d.id + ' as';
                }
                break;
            case '*':
                const q = d.qualifiers.sort(compareSpecifiers).map(remapSpecifierTextForReadability).join(' ');
                result += ` ${q} pointer${pluralS} to`;
                pluralS = '';
                break;
            case '&':
                if (i !== 0 && ['&', '&&'].includes(decl[i - 1].typ)) {
                    throw {message: 'Reference to reference is not allowed'};
                }
                result += ` reference${pluralS} to`;
                pluralS = '';
                break;
            case '&&':
                if (i !== 0 && ['&', '&&'].includes(decl[i - 1].typ)) {
                    throw {message: 'Reference to reference is not allowed'};
                }
                result += ` rvalue-reference${pluralS} to`;
                pluralS = '';
                break;
            case '[*]': {
                if (!isParameter || i > 1 || i === 1 && decl[0].typ !== 'id') {
                    throw {message: 'VLA of unspecified size may only appear in function parameters'};
                }
                const q = d.qualifiers.sort(compareSpecifiers).join(' ');
                result += ` ${q} VLA${pluralS} of unspecified size of`;
                pluralS = 's';
                break;
            }
            case '[]': {
                if (!isParameter && d.qualifiers.length !== 0) {
                    throw {message: 'Arrays with type qualifiers may only appear in function parameters'};
                }
                const q = d.qualifiers.sort(compareSpecifiers).join(' ');
                const statik = d.statik ? ' (size checked)' : '';
                const size = d.size !== null ? `[${d.size.value}]` : '';
                result += ` ${q} array${pluralS}${size}${statik} of`;
                pluralS = 's';
                break;
            }
            case '()': {
                const paramsProses = [];
                for (const p of d.params) {
                    if (p.typ === '...') {
                        paramsProses.push('ellipsis parameter');
                    } else {
                        paramsProses.push(declarationToProse(p.specifiers, p.declarator, true));
                    }
                }
                result += ` function${pluralS}(${paramsProses.join(', ').trim()}) returning`;
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

function declarationToProse(specifiers, declarator, isParameter) {
    return declarationWithKnownSpecifiersToProse(specifiersToProse(specifiers, isParameter), declarator, isParameter);
}

function declarationWithKnownSpecifiersToProse(specifiersProse, declarator, isParameter) {
    const declaratorProse = declaratorToProse(declarator, isParameter);
    let result = declaratorProse.leadingIdentifier.length ? 'Declare ' + declaratorProse.leadingIdentifier + ' ' : ' ';
    result += specifiersProse.outer + ' '
    result += declaratorProse.text + ' ';
    result += specifiersProse.inner + ' ';
    result += specifiersProse.atomic + ' ';
    result += declaratorProse.trailingIdentifier;
    return result.trim();
}


function astToProse(ast) {
    if (ast.declarators.length === 0) {
        throw {message: 'Nothing declared'};
    }

    const specifiersProse = specifiersToProse(ast.specifiers, false);

    const declarationProses = [];
    for (const declarator of ast.declarators) {
        declarationProses.push(declarationWithKnownSpecifiersToProse(specifiersProse, declarator, false));
    }

    return declarationProses.join('\n\n').replace(/ +/g, ' ');
}

window.addEventListener('load', () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const decl = urlSearchParams.get('decl');
    if (decl !== null) {
        INPUT.value = decl;
        parseInput(INPUT.value);
    }
})
