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

'By default this command searches method names for matches to search terms.\n' +
'The terms provided can be simple strings or the foundation for a RegExp. If\n' +
'a method name matches a term it is always included in the output regardless\n' +
'of any other flag settings.\n\n' +

'Use the --comments to search comment text in addition to the method name.\n\n' +

'When searching comment text the --limit flag can be used to set a minimum\n' +
'match count for success. Items which don\'t match the search term at least\n' +
'--limit number of times will be discarded.\n\n' +

'You can use a case-sensitive search by using --no-ignorecase. Searches are\n' +
'normally case-insensitive to improve the chances you will find appropriate\n' +
'suggestions in the result list.\n\n' +

'For example\n\n' +
'tibet apropos clip --comments --limit 1\n' +
'# Loading TIBET via PhantomJS 2.0.0 at September 26, 2015 at 11:14:56 MDT\n' +
'# TIBET loaded in 3516 ms. Starting execution.\n' +
'# - by name\n' +
'#\n' +
'# TP_Primitive_elementSetClipRect (8)\n' +
'# TP_Primitive_elementGetClipRect (7)\n' +
'#\n' +
'# - by comment\n' +
'#\n' +
'# TP.core.MultiTransition_Inst_step (1)\n' +
'# TP.xctrls.clipbox_Inst_setDisplayValue (1)\n' +
'# TP_Primitive_elementWrapToContent (1)\n';

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['comments', 'ignorecase'],
        'number': ['limit'],
        'string': [],
        'default': {
            comments: false,
            ignorecase: true
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE =
    'tibet apropos [terms] [--limit=N] [--comments] [--no-ignorecase]';

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

    if (this.options.limit) {
        script += ' -limit=' + this.options.limit;
    }

    if (this.options.ignorecase) {
        script += ' -ignorecase=true';
    } else {
        script += ' -ignorecase=false';
    }

    if (this.options.comments) {
        script += ' -comments=true';
    }

    return script;
};


module.exports = Cmd;

}());
