//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet apropos' command. Runs phantomjs via TIBET's phantomtsh
 *     script runner. The script run is ':apropos' with optional arguments.
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

// NOTE this is a subtype of the 'tsh' command focused on running :apropos.
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
'Runs the TSH :apropos command to find methods related to one or more topics.\n\n' +

'You can provide one or more search terms and the command will use them all\n' +
'to construct a total match count which serves to sort results. Methods with\n' +
'higher match counts are returned first. Match counts are provided behind\n' +
'each result line so you have a sense of which methods are most relevant.\n\n' +

'For example, you can find methods which may relate to \'clipping\' via:\n\n' +

'$ tibet apropos clipping\n' +
'...\n' +
'TP_Primitive_elementGetClipRect (5)\n' +
'TP_Primitive_elementSetClipRect (5)\n' +
'TP_Primitive_elementWrapToContent (1)\n' +
'TP.core.MultiTransition_Inst_step (1)\n' +
'...\n\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': [],
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
    'tibet apropos [terms]';

//  ---
//  Instance Methods
//  ---

/**
 * Computes and returns the proper profile configuration to boot. This value is
 * appended to the value from getProfileRoot() to produce the full boot profile
 * value. Most commands use the same root but some will alter the configuration.
 * @returns {String} The profile config ID.
 */
Cmd.prototype.getProfileConfig = function() {
    return 'reflection';
};


/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {

    var terms,
        prefix,
        suffix,
        script;

    //  The options._ object holds non-qualified parameters. [0] is the
    //  command name (tsh in this case). The rest will be the terms.
    terms = this.options._.slice(1);
    if (CLI.isEmpty(terms)) {
        return;
    }

    prefix = ':apropos ';

    //  To be sure each term stays quoted properly we need to preserve quoting
    //  in our argument string.
    suffix = terms.reduce(function(prev, curr) {
        if (curr.match(/'/)) {
            return prev + ' ' + '"' + curr + '"';
        } else {
            return prev + ' ' + '\'' + curr + '\'';
        }
    }, '');

    script = prefix + suffix;

    return script;
};


module.exports = Cmd;

}());
