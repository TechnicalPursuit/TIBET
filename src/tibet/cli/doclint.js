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

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    Cmd;


CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

// NOTE this is a subtype of the 'tsh' command focused on running :doclint.
Cmd = function() {
    //  empty
};
Cmd.Parent = require('./tsh');
Cmd.prototype = new Cmd.Parent();


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
Cmd.DEFAULT_RUNNER = Cmd.Parent.DEFAULT_RUNNER;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'doclint';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['tap', 'missing'],
        'string': ['target', 'filter', 'context'],
        'default': {
            tap: true,
            context: 'app'
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE =
    'tibet doclint [<target>] [--filter <filter>] [--context <app|lib|all>] [--tap] [--missing]';

//  ---
//  Instance Methods
//  ---

/**
 * Returns a list of options/flags/parameters suitable for command completion.
 * @returns {Array.<string>} The list of options for this command.
 */
Cmd.prototype.getCompletionOptions = function() {
    var list,
        plist;

        list = Cmd.Parent.prototype.getCompletionOptions.call(this);
        plist = Cmd.Parent.prototype.getCompletionOptions();

        return CLI.subtract(plist, list);
};


/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {
    var filter,
        prefix,
        target;

    if (CLI.notEmpty(this.options.target)) {
        target = this.options.target;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name. [1] should be the "target" if any.
        target = this.options._[1];
    }

    if (CLI.notEmpty(this.options.filter)) {
        filter = this.options.filter;
    }

    prefix = ':doclint ';

    target = target || '';
    if (target.length > 0 && target.indexOf(prefix) !== 0) {
        //  Quote the target since it can contain separators etc.
        prefix = prefix + '--target=' + '\'' + target + '\'';
    }

    filter = filter || '';
    if (filter.length > 0 && filter.indexOf(prefix) !== 0) {
        //  Quote the filter since it can contain separators etc.
        prefix = prefix + '--filter=' + '\'' + filter + '\'';
    }

    if (CLI.notEmpty(this.options.context)) {
        prefix += ' --context=' + this.options.context;
    }

    if (CLI.isTrue(this.options.missing)) {
        prefix += ' --missing=' + this.options.missing;
    }

    if (CLI.isFalse(this.options.tap)) {
        prefix += ' --tap=' + this.options.tap;
    }

    return prefix;
};


module.exports = Cmd;

}());
