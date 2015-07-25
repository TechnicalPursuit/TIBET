//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet doclint' command. Runs phantomjs via TIBET's phantomtsh
 *     script runner. The script run is ':doclint' with optional arguments.
 */
//  ========================================================================

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    Parent,
    Cmd;


CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

// NOTE this is a subtype of the 'tsh' command focused on running :doclint.
Parent = require('./tsh');

Cmd = function() {};
Cmd.prototype = new Parent();


//  ---
//  Type Attributes
//  ---


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


/**
 * The default path to the TIBET-specific phantomjs script runner.
 * @type {String}
 */
Cmd.DEFAULT_RUNNER = Parent.DEFAULT_RUNNER;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {String}
 */
Cmd.prototype.HELP =
'Runs the TSH :doclint command to validate method comment content.\n\n' +

'The doclint command uses TIBET reflection to find all methods in your\n' +
'application and check their comment text for conformance to JSDoc3 and\n' +
'TIBET comment standards. This check can be a part of an overall quality\n' +
'pass which includes running `tibet lint` and `tibet test` on your code.\n\n' +

'If you provide an optional string parameter it will be used as a filter\n' +
'for filenames. Using a string which begins and ends with / will cause the\n' +
'pattern to be treated as a regular expression for testing purposes.\n\n' +

'Note that because it uses method reflection, not file lists, to drive\n' +
'the checks when this command outputs file counts they represent the\n' +
'number of unique files containing matching methods, not a full list\n' +
'of project files. This can be disconcerting at first if you are used\n' +
'to listings which are built by file-driven tools.' +

'\n';

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['tibet'],
        'string': [],
        'default': {}
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE =
    'tibet doclint [<pattern>]';

//  ---
//  Instance Methods
//  ---

/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {

    var filter,
        prefix;

    if (CLI.notEmpty(this.options.filter)) {
        filter = this.options.filter;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name. [1] should be the "filter" if any.
        filter = this.options._[1];
    }

    prefix = ':doclint ';

    filter = filter || '';
    if (filter.length > 0 && filter.indexOf(prefix) !== 0) {
        //  Quote the filter since it can contain separators etc.
        filter = prefix + '--filter=' + '\'' + filter + '\'';
    } else {
        filter = prefix;
    }

    if (this.options.tibet) {
        filter += ' --tibet';
    }

    return filter;
};


module.exports = Cmd;

}());
