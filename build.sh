#!/bin/sh

pegjs -o js/parser.js grammar.peg 
minify js/parser.js > js/parser.min.js
