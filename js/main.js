import {astToProse, setDiagnosticsCallback} from "./prose.js";
import {MAIN_PARSER} from "./parser.js";

const INPUT = document.getElementById("input");
const EXAMPLES = document.getElementById("examples");
const EXAMPLES_LIST = document.getElementById("examples-list");
const PROSE = document.getElementById("prose");
const DEBUG_OUTPUT = document.getElementById("debug-output");
const DIAGNOSTICS = document.getElementById("diagnostics");

export function parseInput(input) {
    updatePageQuery(input);

    if (input.trim().length === 0) {
        hideOutput();
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

/**
 * Updates the page query given the content of the text input.
 * @param {string} input the input string
 * @return {void}
 */
function updatePageQuery(input) {
    input = input.trim();

    let url = window.location.href.split('?')[0];
    if (input.length !== 0) {
        url += '?q=';
        url += encodeURI(input)
            .replaceAll('&', '%26');
    }

    window.history.replaceState({}, null, url);
}

function setOutput(output) {
    INPUT.className = output.isError ? 'error' : '';

    PROSE.innerText = output.prose;
    PROSE.style.opacity = '1';

    DEBUG_OUTPUT.innerText = output.debug;

    EXAMPLES.classList.remove('fade-in');
    EXAMPLES.style.display = 'none';
}

function hideOutput() {
    EXAMPLES.classList.add('fade-in');
    EXAMPLES.style.display = 'block';
    PROSE.style.opacity = '0';
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

/**
 * Hides or unhides all diagnostics.
 * @param {boolean} hidden true if diagnostics should be hidden
 */
function setDiagnosticsHidden(hidden = true) {
    for (const child of DIAGNOSTICS.children) {
        child.hidden = hidden;
    }
}

/**
 * Displays or hides a diagnostic element.
 * @param {string} id the element id
 * @param {boolean} shown true if the element should be shown
 * @return {void}
 */
function showDiagnostic(id, shown = true) {
    const element = document.getElementById('d-' + id);
    element.hidden = !shown;
}

setDiagnosticsCallback(showDiagnostic);

window.addEventListener('load', () => {
    const urlSearchParams = new URLSearchParams(window.location.search);

    for (const param of ['q', 'decl']) {
        const value = urlSearchParams.get(param);
        if (value !== null) {
            INPUT.value = value;
            parseInput(INPUT.value);
        }
    }
})

for (const li of EXAMPLES_LIST.childNodes) {
    li.addEventListener('click', () => {
        parseInput(INPUT.value = li.innerText);
    });
}

INPUT.oninput = (event) =>  parseInput(event.target.value);