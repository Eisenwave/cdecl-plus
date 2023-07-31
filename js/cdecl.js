import * as cdecl from './prose-decl.js';
import * as printf from './prose-printf.js';
import {MAIN_PARSER} from './parser.js';

/**
 * @typedef AbstractSyntaxTree
 * @type {Object}
 */

/**
 * @typedef Prose
 * @type {Object}
 * @property {string[]} paragraphs the list of paragraphs
 * @property {string[]} diagnostics the list of diagnostics ids
 */

/**
 * Converts an AST to prose.
 * @param {AbstractSyntaxTree} ast the abstract syntax tree
 * @returns {Prose} the prose
 */
export function astToProse(ast) {
    const explainer = ast['declarators'] ? new cdecl.Explainer()
                    : ast['functionName'] ? new printf.Explainer()
                    : null;
    if (explainer === null) {
        throw {message: 'Empty or ill-formed AST'};
    }

    const paragraphs = explainer.astToProse(ast);
    const diagnostics = [...explainer.diagnostics];
    return {paragraphs, diagnostics};
}

/**
 * Sanitizes and parses the user input.
 * @param {string} code the C/C++ code
 * @returns {AbstractSyntaxTree}
 */
export function pegParse(code) {
    return MAIN_PARSER.parse(sanitizeInput(code));
}

/**
 * Sanitizes and parses the user input.
 * @param {string} code the C/C++ code
 * @returns {Prose}
 */
export function codeToProse(code) {
    return astToProse(pegParse(code));
}

/**
 * Sanitizes user input.
 * @param {string} input the user input to be turned into prose
 * @returns {string}
 */
function sanitizeInput(input) {
    return input
        .trim()
        .replace(/\s+/g, ' ');
}

