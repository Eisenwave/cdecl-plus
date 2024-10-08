import {astToProse, pegParse} from './cdecl.js';

const INPUT = document.getElementById('input');
const EXAMPLES = document.getElementById('examples');
const EXAMPLES_LIST = document.getElementById('examples-list');
const PROSE = document.getElementById('prose');
const DEBUG_OUTPUT = document.getElementById('debug-output');
const DIAGNOSTICS = document.getElementById('diagnostics');

/**
 * Called when input is provided by the user.
 * @param {string} input the query text contents
 * @returns {void}
 */
export function parseInput(input) {
    updatePageQuery(input);

    const heightBalancingPixels = 4;
    INPUT.style.height = '';
    INPUT.style.height = (INPUT.scrollHeight + heightBalancingPixels) + 'px';

    if (input.trim().length === 0) {
        INPUT.className = '';
        hideOutput();
        setDiagnosticsHidden();
        return;
    }
    setDiagnosticsHidden();

    try {
        const ast = pegParse(input);
        setOutput(processAst(ast));
    }
    catch (e) {
        const error = {isError: true, prose: '', debug: e.message};
        if (e.name === 'SyntaxError') {
            error.prose = 'Syntax Error';
        }
        else {
            error.prose = e.constructor.name + ': ' + e.message;
            console.error(e);
        }
        setOutput(error);
    }
}

/**
 * Replaces a character in a URI with the corresponding escape sequence.
 * @param {string} c the character
 * @returns {string}
 */
function uriReplaceCharacter(c) {
    return '%' + c
        .charCodeAt(0)
        .toString(16)
        .toUpperCase()
        .padStart(2, '0');
}

/**
 * Updates the page query given the content of the text input.
 * @param {string} input the input string
 * @returns {void}
 */
function updatePageQuery(input) {
    input = input.trim();

    let url = window.location.href.split('?')[0];
    if (input.length !== 0) {
        url += '?q=';
        url += encodeURI(input)
            .replaceAll(/[^%0-9a-zA-Z_\u0080-\uffff]/g, uriReplaceCharacter);
    }

    window.history.replaceState({}, null, url);
}

/**
 * @typedef UiOutput
 * @type {Object}
 * @property {boolean} isError true if the output is a fatal error
 * @property {string} prose the text output
 * @property {string} debug the debug output
 */

/**
 * Updates the UI to the given output object.
 * @param {UiOutput} output the output
 * @returns {void}
 */
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



/**
 * Processes the AST and returns UI output information.
 * @param {AbstractSyntaxTree} ast the abstract syntax tree
 * @returns {UiOutput}
 */
function processAst(ast) {
    const debug = JSON.stringify(ast, void 0, 4);
    try {
        const result = astToProse(ast);
        const prose = result.paragraphs.join('\n\n');
        result.diagnostics.map(showDiagnostic);

        return {isError: false, prose, debug};
    }
    catch (e) {
        return {isError: true, prose: 'Fatal Error: ' + e.message, debug};
    }
}

/**
 * Hides or un-hides all diagnostics.
 * @param {boolean} hidden true if diagnostics should be hidden
 * @returns {void}
 */
function setDiagnosticsHidden(hidden = true) {
    for (const child of DIAGNOSTICS.children) {
        child.hidden = hidden;
    }
}

/**
 * Displays or hides a diagnostic element.
 * @param {string} id the element id
 * @returns {void}
 */
function showDiagnostic(id) {
    document.getElementById('d-' + id).hidden = false;
}

/**
 * Sets the input programmatically, e.g. when the user picks an example.
 * @param {string} input the user input
 * @returns {void}
 */
function setInput(input) {
    parseInput(INPUT.value = input);
    INPUT.focus();
}

window.addEventListener('load', () => {
    const urlSearchParams = new URLSearchParams(window.location.search);

    for (const param of ['q', 'decl']) {
        const value = urlSearchParams.get(param);
        if (value !== null) {
            INPUT.value = value;
            parseInput(INPUT.value);
        }
    }
});

for (const li of EXAMPLES_LIST.childNodes) {
    li.onclick = () => setInput(li.innerText);

    li.onkeyup = event => {
        if (event.key === ' ' || event.key === 'Enter') {
            setInput(li.innerText);
        }
    };

    li.enterKeyHint = 'done';
    li.inputMode = 'none';
}

INPUT.oninput = () =>  parseInput(INPUT.value);
