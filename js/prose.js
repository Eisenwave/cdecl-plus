"use strict";

import {declarationsToProse} from "./prose-decl.js";
import {formatArgsToProse} from "./prose-printf.js";

export const cdecl = {showDiagnostic: undefined};

/**
 * Sets the diagnostics callback.
 * @param {function(string): void} callback the diagnostics callback
 */
export function setDiagnosticsCallback(callback) {
    cdecl.showDiagnostic = callback;
}

/**
 * Converts an AST to a prose string.
 * @param {Object} ast the abstract syntax tree
 * @return {string}
 */
export function astToProse(ast) {
    return astToProseParagraphs(ast).join('\n\n');
}

/**
 * Converts an AST to an array of prose paragraphs.
 * @param {Object} ast the abstract syntax tree
 * @return {string[]}
 */
export function astToProseParagraphs(ast) {
    if (ast['declarators']) {
        return declarationsToProse(ast);
    }
    if (ast['functionName']) {
        return formatArgsToProse(ast['functionName'], ast['formatArgs']);
    }
    throw {message: 'Empty AST'};
}

