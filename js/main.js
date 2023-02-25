const INPUT = document.getElementById("input");
const OUTPUT = document.getElementById("output");
const DEBUG_OUTPUT = document.getElementById("debug-output");
const DIAGNOSTICS = document.getElementById("diagnostics");

function parseInput(input) {
    updatePageQuery(input);

    if (input.trim().length === 0) {
        setOutput({isError: false, prose: '', debug: ''});
        setDiagnosticsHidden();
        return;
    }
    setDiagnosticsHidden();

    try {
        const ast = pegParse(input);
        setOutput(processAst(ast));
    } catch (e) {
        const error = {isError: true, debug: e.message};
        if (e.name === 'SyntaxError') {
            error.prose = 'Syntax Error';
        } else {
            error.prose = e.constructor.name + ': ' + e.message;
            console.error(e);
        }
        setOutput(error);
    }
}

function updatePageQuery(input) {
    const urlStart = window.location.href.split('?');
    const query = input.trim().length === 0 ? '' : '?decl=' + encodeURI(input);
    window.history.replaceState({}, null, urlStart[0] + query);
}

function setOutput(output) {
    INPUT.className = output.isError ? 'error' : '';
    OUTPUT.innerText = output.prose;
    DEBUG_OUTPUT.innerText = output.debug;
}

function pegParse(input) {
    return MAIN_PARSER.parse(sanitizeInput(input));
}

function sanitizeInput(input) {
    return input
        .trim()
        .replace(/\s+/g, ' ');
}

function processAst(ast) {
    const astJson = JSON.stringify(ast, undefined, 4);
    try {
        return {isError: false, prose: astToProse(ast), debug: astJson};
    } catch (e) {
        return {isError: true, prose: 'Fatal Error: ' + e.message, debug: astJson};
    }
}

function setDiagnosticsHidden(hidden = true) {
    for (const child of DIAGNOSTICS.children) {
        child.hidden = hidden;
    }
}


function showDiagnostic(id, shown = true) {
    const element = document.getElementById('d-' + id);
    element.hidden = !shown;
}


window.addEventListener('load', () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const decl = urlSearchParams.get('decl');
    if (decl !== null) {
        INPUT.value = decl;
        parseInput(INPUT.value);
    }
})
