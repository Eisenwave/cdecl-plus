const cdecl = {showDiagnostic: id => showDiagnostic(id)};

function astToProse(ast) {
    if (ast['declarators']) {
        return declarationsToProse(ast);
    }
    else if (ast['functionName']) {
        return formatArgsToProse(ast['functionName'], ast['formatArgs']);
    }
    throw {message: 'Empty AST'};
}

