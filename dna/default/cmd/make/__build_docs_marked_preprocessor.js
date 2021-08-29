#!/usr/bin/env node
/*
 * Simple preprocessor for Marked2 so that it can preview TIBET docs as if they
 * have already been run through the `tibet build_docs` routine.
 */

var preproc = require('./__markdown_preproc.js');

var header = '<div class="ccm-page"><main>';
var footer = '<main>\n</div>';

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var buffer = '';

rl.on('line', function(line){
    buffer += line + '\n';
})

rl.on('close', function() {
    console.log(header + preproc(buffer) + footer);
});
