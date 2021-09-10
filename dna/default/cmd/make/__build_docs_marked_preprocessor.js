#!/usr/bin/env node
/*
 * Simple preprocessor for Marked2 so that it can preview TIBET docs as if they
 * have already been run through the `tibet build_docs` routine.
 */

var preproc,

    header,
    footer,

    readline,
    rl,
    buffer;

preproc = require('./__markdown_preproc.js');

header = '<div class="ccm-page"><main>';
footer = '<main>\n</div>';

readline = require('readline');

rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

buffer = '';

rl.on('line', function(line) {
    buffer += line + '\n';
});

rl.on('close', function() {
    console.log(header + preproc(buffer) + footer);
});
