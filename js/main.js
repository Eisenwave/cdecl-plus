const INPUT = document.getElementById("input");
const OUTPUT = document.getElementById("output");
const DEBUG_OUTPUT = document.getElementById("debug-output");

function parseInput(input) {
    updatePageQuery(input);

    if (input.trim().length === 0) {
        INPUT.className = '';
        OUTPUT.innerText = '';
        DEBUG_OUTPUT.innerText = '';
        return;
    }
    try {
        const ast = pegParse(input);
        processAst(ast);
    } catch (e) {
        INPUT.className = 'error';
        DEBUG_OUTPUT.innerText = e.message;
        if (e instanceof module.exports.SyntaxError) {
            OUTPUT.innerText = 'Syntax Error';
        }
        else {
            OUTPUT.innerText = e.constructor.name + ': ' + e.message;
            console.error(e);
        }
    }
}

function updatePageQuery(input) {
    const urlStart = window.location.href.split('?');
    const query = input.trim().length === 0 ? '' : '?decl=' + encodeURI(input);
    window.history.replaceState({}, null, urlStart[0] + query);
}

function pegParse(input) {
    return module.exports.parse(sanitizeInput(input));
}

function sanitizeInput(input) {
    return input
        .trim()
        .replace(/\s+/g, ' ');
}

function processAst(ast) {
    INPUT.className = '';
    try {
        OUTPUT.innerText = astToProse(ast);
        DEBUG_OUTPUT.innerText = JSON.stringify(ast, undefined, 4);
    } catch (e) {
        INPUT.className = 'error';
        OUTPUT.innerText = 'Error: ' + e.message;
        DEBUG_OUTPUT.innerText = e instanceof TypeError ? JSON.stringify(ast, undefined, 4) : '';
    }
}


window.addEventListener('load', () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const decl = urlSearchParams.get('decl');
    if (decl !== null) {
        INPUT.value = decl;
        parseInput(INPUT.value);
    }
})
