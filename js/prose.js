"use strict";

import * as cdecl from "./prose-decl.js";
import * as printf from "./prose-printf.js";

/**
 * @typedef Prose
 * @type {Object}
 * @property {string[]} paragraphs the list of paragraphs
 * @property {string[]} diagnostics the list of diagnostics ids
 */

/**
 * Converts an AST to prose.
 * @param {Object} ast the abstract syntax tree
 * @return {Prose} the prose
 */
export function astToProse(ast) {
    if (ast['declarators']) {
        const explainer = new cdecl.Explainer();
        const paragraphs = explainer.declarationsToProse(ast);
        const diagnostics = [...explainer.diagnostics];
        return {paragraphs, diagnostics};
    }
    if (ast['functionName']) {
        const explainer = new printf.Explainer();
        const paragraphs = explainer.formatArgsToProse(ast['functionName'], ast['formatArgs']);
        const diagnostics = [...explainer.diagnostics];
        return {paragraphs, diagnostics};
    }
    throw {message: 'Empty AST'};
}

