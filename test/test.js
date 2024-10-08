import assert from 'node:assert/strict';
import {describe, it} from 'mocha';
import {codeToProse} from '../js/cdecl.js';

describe('Examples', function () {

    let code = 'char const * const';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('produces exactly one paragraph', function () {
            assert.equal(paragraphs.length, 1);
        });
        it('produces no diagnostics', function() {
            assert.deepEqual(diagnostics, []);
        });
        it('has correct prose', function () {
            const expected = 'const pointer to const char';
            assert.equal(paragraphs[0], expected);
        });
    });

    code = 'int x;\nfloat y;';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('produces two paragraphs', function () {
            assert.equal(paragraphs.length, 2);
        });
        it('produces no diagnostics', function() {
            assert.deepEqual(diagnostics, []);
        });
        it('has correct prose', function () {
            assert.deepEqual(paragraphs, [
                'Declare x as int',
                'Declare y as float'
            ]);
        });
    });

    code = 'int(*(*)[10])()';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('produces exactly one paragraph', function () {
            assert.equal(paragraphs.length, 1);
        });
        it('produces one diagnostic', function() {
            assert.deepEqual(diagnostics, ['empty-function-parameters']);
        });
        it('has correct prose', function () {
            const expected = 'pointer to array[10] of pointers to function returning int';
            assert.equal(paragraphs[0], expected);
        });
    });

    code = 'typedef struct s {} s, *sptr';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('produces two paragraphs', function () {
            assert.equal(paragraphs.length, 2);
        });
        it('produces no diagnostics', function() {
            assert.deepEqual(diagnostics, []);
        });
        it('has correct prose', function () {
            const expected = [
                'Declare s as type alias for struct s',
                'Declare sptr as type alias for pointer to struct s'
            ];
            assert.deepEqual(paragraphs, expected);
        });
    });

    code = 'int(*(*arr)[10])()';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('produces one paragraph', function () {
            assert.equal(paragraphs.length, 1);
        });
        it('produces one diagnostic', function() {
            assert.deepEqual(diagnostics, ['empty-function-parameters']);
        });
        it('has correct prose', function () {
            const expected = 'Declare arr as pointer to array[10]'
                + ' of pointers to function returning int';
            assert.equal(paragraphs[0], expected);
        });
    });

    code = 'void &(int[*]) _Atomic [0]';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('produces one paragraph', function () {
            assert.equal(paragraphs.length, 1);
        });
        it('produces correct diagnostics', function() {
            const expected = [
                'array-of-references',
                'atomic-qualified-function',
                'reference-to-void',
                'returning-array',
                'zero-size-array'
            ];
            assert.deepEqual(diagnostics.sort(), expected);
        });
        it('has correct prose', function () {
            const expected = '_Atomic-qualified function(VLA of unspecified size of int)'
                + ' returning array[0] of references to void';
            assert.equal(paragraphs[0], expected);
        });
    });

    code = 'fprintf(stderr, "%#*.*LF", width, precision, number)';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('produces two paragraphs', function () {
            assert.equal(paragraphs.length, 2);
        });
        it('produces correct diagnostics', function() {
            const expected = ['fprintf-io', 'printf'];
            assert.deepEqual(diagnostics.sort(), expected);
        });
        it('has correct explanation', function () {
            const actual = paragraphs[0];
            const start = 'Write a decimal long double with upper-case infinity/NaN symbols';
            assert(actual.startsWith(start));
            assert(actual.includes('#: decimal point is always written'));
            assert(actual.includes('*: field width is read from int argument'));
            assert(actual.includes('.*: number of fractional digits is read from int argument'));
        });
        it('has correct arguments', function () {
            const actual = paragraphs[1]
                .substring(paragraphs[1].search('-\n') + 2)
                .split('\n');
            const expected = [
                'stderr (FILE*)',
                'width (int)',
                'precision (int)',
                'number (long double)'
            ];
            assert.deepEqual(actual, expected);
        });
    });

    code = 'scanf("%4d/%2d/%2d", &year, &month, &day)';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('produces two paragraphs', function () {
            assert.equal(paragraphs.length, 2);
        });
        it('produces one diagnostic', function() {
            const expected = [
                'scanf',
                'scanf-io',
                'scanf-leading-whitespace-literal'
            ];
            assert.deepEqual(diagnostics.sort(), expected);
        });
        it('has correct explanation', function () {
            const expected =
                'Read decimal integer to int* or unsigned int* as if by strtol(..., 10)\n' +
                '    4: maximum field width (in characters)\n' +
                'Match "/"\n' +
                'Read decimal integer to int* or unsigned int* as if by strtol(..., 10)\n' +
                '    2: maximum field width (in characters)\n' +
                'Match "/"\n' +
                'Read decimal integer to int* or unsigned int* as if by strtol(..., 10)\n' +
                '    2: maximum field width (in characters)';
            assert.equal(paragraphs[0], expected);
        });
        it('has correct arguments', function () {
            const actual = paragraphs[1]
                .substring(paragraphs[1].search('-\n') + 2)
                .split('\n');
            const expected = [
                '&year (int* or unsigned int*)',
                '&month (int* or unsigned int*)',
                '&day (int* or unsigned int*)'
            ];
            assert.deepEqual(actual, expected);
        });
    });

    code = 'signed bool';
    describe(code, function () {
        const codeCopy = code;
        it('throws because "signed" and "bool" conflict', function () {
            assert.throws(() => codeToProse(codeCopy),
                {message: 'Conflicting specifiers signed and bool'});
        });
    });

    code = 'constexpr const int *x';
    describe(code, function () {
        const {paragraphs} = codeToProse(code);
        it('has correct prose', function () {
            const expected = ['Declare x as constexpr pointer to const int'];
            assert.deepEqual(paragraphs, expected);
        });
    });

    code = 'constexpr int x';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('has correct prose', function () {
            const expected = ['Declare x as constexpr int'];
            assert.deepEqual(paragraphs, expected);
        });
        it('has constexpr-implicit-const diagnostic', function() {
            assert.deepEqual(diagnostics, ['constexpr-implicit-const']);
        });
    });

    code = 'constexpr const int x';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('has correct prose', function () {
            const expected = ['Declare x as constexpr const int'];
            assert.deepEqual(paragraphs, expected);
        });
        it('has no diagnostics', function() {
            assert.equal(diagnostics.length, 0);
        });
    });

    code = 'constexpr const int * const x';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('has correct prose', function () {
            const expected = ['Declare x as constexpr const ' +
            'pointer to const int'];
            assert.deepEqual(paragraphs, expected);
        });
        it('has no diagnostics', function() {
            assert.equal(diagnostics.length, 0);
        });
    });

    code = 'constexpr const int * x[][]';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('has correct prose', function () {
            const expected = ['Declare x as constexpr array of arrays ' +
            'of pointers to const int'];
            assert.deepEqual(paragraphs, expected);
        });
        it('has constexpr-implicit-const diagnostic', function() {
            assert.deepEqual(diagnostics, ['constexpr-implicit-const']);
        });
    });

    code = 'constexpr int * const *';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('has correct prose', function () {
            const expected = ['constexpr pointer to const pointer to int'];
            assert.deepEqual(paragraphs, expected);
        });
        it('has constexpr-implicit-const diagnostic', function() {
            assert.deepEqual(diagnostics, ['constexpr-implicit-const']);
        });
    });

    code = 'constexpr int ** const';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('has correct prose', function () {
            const expected = ['constexpr const pointer to pointer to int'];
            assert.deepEqual(paragraphs, expected);
        });
        it('has no constexpr-implicit-const diagnostic', function() {
            assert.ok(!diagnostics.includes('constexpr-implicit-const'));
        });
    });

    code = 'constexpr int f()';
    describe(code, function () {
        const {paragraphs, diagnostics} = codeToProse(code);
        it('has correct prose', function () {
            const expected = ['Declare f as constexpr function returning int'];
            assert.deepEqual(paragraphs, expected);
        });
        it('has no constexpr-implicit-const diagnostic', function() {
            assert.ok(!diagnostics.includes('constexpr-implicit-const'));
        });
    });

    code = 'void() const const';
    describe(code, function () {
        const diagnostics = codeToProse(code).diagnostics;
        it('rejects duplicate qualifiers on function', function() {
            assert.ok(diagnostics.includes('duplicate-function-qualifier'));
        });
    });

    code = 'void * const const';
    describe(code, function () {
        const diagnostics = codeToProse(code).diagnostics;
        it('rejects duplicate qualifiers on pointer', function() {
            assert.ok(diagnostics.includes('duplicate-pointer-qualifier'));
        });
    });
});
