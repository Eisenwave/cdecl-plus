const cdecl = {showDiagnostic: id => showDiagnostic(id)};

function astToProse(ast) {
    if (ast['declarators']) {
        return declarationsToProse(ast);
    }
    else if (ast['printfArgs']) {
        return printfArgsToProse(ast);
    }
    throw {message: 'Empty AST'};
}



