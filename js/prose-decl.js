const SPECIFIER_CONFLICTS = [
    ['class', 'struct', 'union', 'enum', 'char', 'int', 'float', 'double', 'void', '_Atomic()',
        'typedef-name', 'bool'],
    ['class', 'struct', 'union', 'enum', 'char', 'short', 'long', 'float', 'void', '_Atomic()',
        'bool'],
    ['class', 'struct', 'union', 'enum', 'char', 'short', 'long', 'typedef-name', 'bool'],
    ['class', 'struct', 'union', 'enum', 'void', 'complex', '_Atomic()', 'bool'],
    ['class', 'struct', 'union', 'enum', 'signed', 'unsigned', 'float', 'double', 'void',
        '_Atomic()'],
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
    '_Atomic()', 'struct', 'class', 'enum',
    'void', 'bool', 'char', 'short', 'long', 'int',
    'float', 'double'
];

/**
 * @typedef DeclarationSpecifier
 * @type {[string, string]}
 */

/**
 * @typedef Declarator
 * @type {DeclaratorPart[]}
 */

/**
 * @typedef DeclaratorPart
 * @type {Object}
 * @property {string} typ the type, a stringly typed enumeration
 * @property {string?} id the identifier, if any
 * @property {string[]?} qualifiers the list of qualifiers
 * @property {boolean?} statik true if the array is static
 * @property {?number} size the array size
 * @property {Object[]?} params the function parameters
 */

/**
 * @typedef DeclarationContext
 * @type {'top-level' | 'parameter' | 'atomic'}
 */

/**
 * An explainer for C declarations.
 * @property {Set<string>} diagnostics The set of output diagnostics.
 */
export class Explainer {

    constructor() {
        this.diagnostics = new Set();
    }

    /**
     * Adds the diagnostic with the given id to the output diagnostics.
     * @param {string} id the diagnostics id
     * @returns {void}
     */
    showDiagnostic(id) {
        this.diagnostics.add(id);
    }

    /**
     * Converts an AST to prose.
     * @param {Object} ast the abstract syntax tree
     * @returns {string[]} an array of paragraphs
     */
    astToProse(ast) {
        if (ast.declarators.length === 0) {
            throw {message: 'Nothing declared'};
        }

        const specifiersProse = this.specifiersToProse(ast.specifiers, 'top-level');

        const paragraphs = [];
        for (const declarator of ast.declarators) {
            const paragraph = this.declarationWithKnownSpecifiersToProse(specifiersProse,
                declarator, 'top-level')
                .replace(/ +/g, ' ');
            paragraphs.push(paragraph);
        }

        return paragraphs;
    }

    /**
     * Converts a declaration to prose.
     * @param {DeclarationSpecifier[]} specifiers the declaration specifiers
     * @param {Declarator} declarator the declarator
     * @param {DeclarationContext} kind the context
     * @returns {string} the prose paragraph
     */
    declarationToProse(specifiers, declarator, kind) {
        return this.declarationWithKnownSpecifiersToProse(
            this.specifiersToProse(specifiers, kind), declarator, kind);
    }

    /**
     * Converts a declaration with specifiers already processed to prose.
     * @param {Object} specifiersProse the prose so far
     * @param {Declarator} declarator the declarator
     * @param {DeclarationContext} kind the context
     * @returns {string} the prose paragraph
     */
    declarationWithKnownSpecifiersToProse(specifiersProse, declarator, kind) {
        const histo = specifiersProse.histogram;
        if (histo.has('void')) {
            if (declarator.length !== 0 && declarator[declarator.length - 1].typ === '[]') {
                this.showDiagnostic('array-of-void');
            }
            if (declarator.length !== 0 && ['&', '&&']
                .includes(declarator[declarator.length - 1].typ)) {
                this.showDiagnostic('reference-to-void');
            }
            if (declarator.length === 1 && declarator[0].typ === 'id') {
                this.showDiagnostic('void-variable');
            }
            // FIXME does this work for _Atomic(void) ?
            const isValueParameter = declarator.length === 0
                || declarator.length === 1 && declarator[0].typ === 'id';
            const isQualified = histo.has('const')
                || histo.has('volatile')
                || histo.has('restrict')
                || histo.has('_Atomic');
            if (kind === 'parameter' && isValueParameter && isQualified) {
                this.showDiagnostic('qualified-void-parameter');
            }
        }

        const declaratorProse = this.declaratorToProse(declarator, kind);
        let result = declaratorProse.leadingIdentifier.length ?
            'Declare ' + declaratorProse.leadingIdentifier + ' ' : ' ';
        result += specifiersProse.outer + ' ';
        result += declaratorProse.text + ' ';
        result += specifiersProse.inner + ' ';
        result += specifiersProse.atomic + ' ';
        result += declaratorProse.trailingIdentifier;
        return result.trim();
    }

    /**
     * Converts a declaration specifier sequence to a prose object.
     * @param {DeclarationSpecifier[]} specifiers the specifiers
     * @param {DeclarationContext} kind the context
     * @returns {{histogram: Map<string, number>, atomic: (string|string),
     * outer: string, inner: string}}
     */
    specifiersToProse(specifiers, kind) {
        const specifierKeywords = specifiers.map(Explainer.specifierToKeyword);
        const histogram = Explainer.makeHistogram(specifierKeywords);

        Explainer.checkForMisuse(specifiers, kind);
        Explainer.checkForConflicts(specifierKeywords);
        Explainer.checkForDuplicates(histogram);

        if (!specifierKeywords.some(s => EXPLICIT_TYPE_SPECIFIERS.has(s))) {
            const toAdd = histogram.has('complex') ? 'double' : 'int';
            specifiers.push(['type-specifier', toAdd]);
            if (toAdd === 'double') {
                this.showDiagnostic('implicit-double');
            }
            else if (toAdd === 'int' &&
                !specifierKeywords.some(s => IDIOMATIC_IMPLICIT_INT_SPECIFIERS.has(s))) {
                this.showDiagnostic('implicit-int');
            }
        }
        const atomicSpecifier = specifiers.filter(s => s[0] === 'atomic-type-specifier')[0];
        const atomic = atomicSpecifier === undefined ? '' :  'atomic ' + this.declarationToProse(
            atomicSpecifier[1].specifiers, atomicSpecifier[1].declarator, 'atomic');

        const outer = Explainer.processedSpecifiersToText(
            specifiers.filter(s => OUTER_SPECIFIER_TYPES.has(s[0])));
        const inner = Explainer.processedSpecifiersToText(
            specifiers.filter(s => INNER_SPECIFIER_TYPES.has(s[0])));

        return {outer, inner, atomic, histogram};
    }

    /**
     * Converts a specifier object to a keyword string.
     * For most specifiers, this is simply the text, e.g. `"int"` for `int`.
     * However, for specifiers such as `enum T`, the result is just `"enum"`.
     * @param {DeclarationSpecifier} s the specifier
     * @returns {string} the keyword
     */
    static specifierToKeyword(s) {
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

    /**
     * Creates a histogram from a list of specifiers in text form.
     * @param {string[]} specifiers the specifiers
     * @returns {Map<string, number>}
     */
    static makeHistogram(specifiers) {
        const result = new Map();
        specifiers.forEach(s => {
            result.set(s, (result.get(s) ?? 0) + 1);
        });
        return result;
    }

    /**
     * Throws if there is a conflict between the given specifiers.
     * @param {string[]} specifierIds the list of specifier ids
     * @returns {void}
     */
    static checkForConflicts(specifierIds) {
        for (const conflictPool of SPECIFIER_CONFLICTS) {
            let first = undefined;
            for (const s of specifierIds) {
                if (!conflictPool.includes(s)) {
                    continue;
                }
                if (first === undefined) {
                    first = s;
                }
                else if (first !== s) {
                    throw {message: `Conflicting specifiers ${first} and ${s}`};
                }
            }
        }
    }

    /**
     * Throws on (excessive) duplication of declaration specifiers.
     * For most specifiers, a single duplicate throws, however, `long`
     * is handled with `long double` and `long long` in mind.
     * @param {Map<string, number>} specifierHistogram the specifier histogram
     * @returns {void}
     */
    static checkForDuplicates(specifierHistogram) {
        for (const [key, val] of specifierHistogram) {
            if (key === 'long') {
                if (val > 2) {
                    throw {message: 'long long long is too long'};
                }
                if (val > 1 && (specifierHistogram.get('double') > 0 ||
                    specifierHistogram.get('complex') > 0)) {
                    throw {message: 'long long is not compatible with double and/or complex'};
                }
            }
            else if (val > 1) {
                throw {message: 'Duplicate specifier ' + key};
            }
        }
    }

    /**
     * Throws if there is misuse of specifiers in the declaration specifier
     * sequence, depending on the provided kind of context.
     * @param {DeclarationSpecifier[]} specifiers the specifiers
     * @param {'top-level' | 'atomic' | 'parameter'} kind the kind of context
     * @returns {void}
     */
    static checkForMisuse(specifiers, kind) {
        switch (kind) {
        case 'top-level':
            return;
        case 'atomic':
            specifiers.forEach(Explainer.checkForSpecifierMisuseInAtomicTypeSpecifier);
            break;
        case 'parameter':
            specifiers.forEach(Explainer.checkForSpecifierMisuseInFunctionParameter);
            break;
        }
    }

    /**
     * Throws if the wrong kind of declaration specifier was used in _Atomic().
     * @param {DeclarationSpecifier} s the specifier
     * @returns {void}
     */
    static checkForSpecifierMisuseInAtomicTypeSpecifier(s) {
        switch (s[0]) {
        case 'storage-class-specifier':
            throw {message: 'Storage class specifier ' + s[1] +
                    ' is not allowed in atomic type specifier'};
        case 'function-specifier':
            throw {message: 'Function specifier ' + s[1] +
                    ' is not allowed in atomic type specifier'};
        case 'type-qualifier':
            throw {message: '_Atomic() type specifier of ' + s[1] +
                    ' qualified type is not allowed'};
        case 'atomic-type-specifier':
            throw {message: 'Nested _Atomic() type specifier is not allowed'};
        }
    }

    /**
     * Throws if the wrong kind of declaration specifier was used in a function
     * parameter.
     * @param {DeclarationSpecifier} s the specifier
     * @returns {void}
     */
    static checkForSpecifierMisuseInFunctionParameter(s) {
        switch (s[0]) {
        case 'storage-class-specifier':
            throw {message: 'Storage class specifier ' + s[1] +
                    ' is not allowed in function parameters'};
        case 'function-specifier':
            throw {message: 'Function specifier ' + s[1] +
                    ' is not allowed in function parameters'};
        }
    }

    /**
     * Converts a declaration specifier sequence to prose.
     * @param {DeclarationSpecifier[]} specifiers the specifiers
     * @returns {string}
     */
    static processedSpecifiersToText(specifiers) {
        return specifiers
            .sort((a, b) => Explainer.compareSpecifiers(a[1], b[1]))
            .map(Explainer.specifierToText)
            .join(' ');
    }

    /**
     * Compares two specifiers.
     * @param {string} a the first specifier
     * @param {string} b the second specifier
     * @returns {number} -1 if `a < b`, 1 if `a > b`, 0 otherwise
     */
    static compareSpecifiers(a, b) {
        return SPECIFIER_ORDERING.indexOf(a) - SPECIFIER_ORDERING.indexOf(b);
    }

    /**
     * Converts a declaration specifier to readable text form.
     * @param {DeclarationSpecifier} specifier the specifier
     * @returns {string} the human-readable text form
     */
    static specifierToText(specifier) {
        switch (specifier[0]) {
        case 'struct-or-union-specifier':
            return specifier.length > 2 ? specifier[1] + ' ' + specifier[2]
                                        : 'anonymous ' + specifier[1];
        case 'enum-specifier':
            return 'enum ' + specifier[1];
        default:
            return Explainer.remapSpecifierTextForReadability(specifier[1]);
        }
    }

    /**
     * Remaps some declaration specifier names onto a more human-readable
     * form, e.g. `typedef` becomes "type alias for".
     * @param {string} text the raw declaration specifier text form
     * @returns {string} the human-readable text form
     */
    static remapSpecifierTextForReadability(text) {
        return text === 'typedef' ? 'type alias for'
             : text === '_Atomic' ? 'atomic'
                                  : text;
    }

    /**
     * Converts a declarator to a prose object.
     * @param {Declarator} decl the declarator
     * @param {DeclarationContext} kind the context
     * @returns {{trailingIdentifier: string, leadingIdentifier: string,
     * text: string}}
     */
    declaratorToProse(decl, kind) {
        const isParameter = kind === 'parameter';
        let result = '';
        let pluralS = '';
        let leadingIdentifier = '';
        let trailingIdentifier = '';
        let i = 0;
        for (const /** @type {DeclaratorPart} */ d of decl) {
            const isFirst = i === 0 || decl[i - 1].typ === 'id';
            switch (d.typ) {
            case 'id': {
                if (isParameter) {
                    trailingIdentifier = ' named ' + d.id;
                }
                else {
                    leadingIdentifier = ' ' + d.id + ' as';
                }
                break;
            }
            case '::': {
                if (i !== 0 && (decl[i - 1].typ === '&' || decl[i - 1].typ === '&&')) {
                    this.showDiagnostic('reference-to-member');
                }

                const ns = d.id ?? 'global namespace';
                result += ` member${pluralS} of ${ns}, with type`;
                break;
            }
            case '*': {
                const q = d.qualifiers
                    .sort(Explainer.compareSpecifiers)
                    .map(Explainer.remapSpecifierTextForReadability)
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
                    this.showDiagnostic('array-of-references');
                }
                if (i !== 0 && decl[i - 1].typ === '*') {
                    this.showDiagnostic('pointer-to-reference');
                }

                const rvalue = d.typ === '&&' ? 'rvalue-' : '';
                result += ` ${rvalue}reference${pluralS} to`;
                pluralS = '';
                break;
            }
            case '[*]': {
                if (!isParameter || i > 1 || i === 1 && decl[0].typ !== 'id') {
                    this.showDiagnostic('non-parameter-vla');
                }
                const q = d.qualifiers
                    .sort(Explainer.compareSpecifiers)
                    .map(Explainer.remapSpecifierTextForReadability)
                    .join(' ');
                result += ` ${q} VLA${pluralS} of unspecified size of`;
                pluralS = 's';
                break;
            }
            case '[]': {
                if (!isParameter && d.qualifiers.length !== 0) {
                    this.showDiagnostic('qualified-array');
                }
                if (i !== 0 && decl[i - 1].typ === '()') {
                    this.showDiagnostic('returning-array');
                }
                if (isParameter && isFirst) {
                    this.showDiagnostic('array-to-pointer-decay');
                }
                if (isFirst && kind === 'atomic') {
                    this.showDiagnostic('atomic-array');
                }
                if (d.size && d.size.value === 0) {
                    this.showDiagnostic('zero-size-array');
                }

                const q = d.qualifiers.sort(Explainer.compareSpecifiers).join(' ');
                const statik = d.statik ? ' (size checked)' : '';
                const size = d.size !== null ? `[${d.size.value}]` : '';
                result += ` ${q} array${pluralS}${size}${statik} of`;
                pluralS = 's';
                break;
            }
            case '()': {
                if (i !== 0 && decl[i - 1].typ === '()') {
                    this.showDiagnostic('returning-function');
                }
                if (i !== 0 && decl[i - 1].typ === '[]') {
                    this.showDiagnostic('array-of-functions');
                }
                if (isParameter && isFirst) {
                    this.showDiagnostic('function-to-pointer-decay');
                }
                if (isFirst && kind === 'atomic') {
                    this.showDiagnostic('atomic-function');
                }

                const paramsProses = [];
                for (const p of d.params) {
                    if (p.typ === '...') {
                        paramsProses.push('ellipsis parameter');
                    }
                    else {
                        paramsProses.push(
                            this.declarationToProse(p.specifiers, p.declarator, 'parameter'));
                    }
                }
                if (paramsProses.length === 0) {
                    this.showDiagnostic('empty-function-parameters');
                }

                let overrideFinal = d.qualifiers[d.qualifiers.length - 1];
                if (!['override', 'final'].includes(overrideFinal)) {
                    overrideFinal = undefined;
                }
                const qualifiersLimit = d.qualifiers.length - Number(overrideFinal !== undefined);
                const qualifiersFront = d.qualifiers.length === 0 ? []
                    : d.qualifiers.splice(0, qualifiersLimit);
                if (qualifiersFront.includes('_Atomic')) {
                    this.showDiagnostic('atomic-qualified-function');
                }
                if (qualifiersFront.includes('restrict')) {
                    this.showDiagnostic('restrict-qualified-function');
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

        const text = result.trimStart();
        return {text, leadingIdentifier, trailingIdentifier};
    }

}
