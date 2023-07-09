"use strict";

const cdecl = {showDiagnostic: id => showDiagnostic(id)};

/**
 * Converts an AST to a prose string.
 * @param {Object} ast the abstract syntax tree
 * @return {string}
 */
function astToProse(ast) {
    return astToProseParagraphs(ast).join('\n\n');
}

/**
 * Converts an AST to an array of prose paragraphs.
 * @param {Object} ast the abstract syntax tree
 * @return {string[]}
 */
function astToProseParagraphs(ast) {
    if (ast['declarators']) {
        return declarationsToProse(ast);
    }
    if (ast['functionName']) {
        return formatArgsToProse(ast['functionName'], ast['formatArgs']);
    }
    throw {message: 'Empty AST'};
}

