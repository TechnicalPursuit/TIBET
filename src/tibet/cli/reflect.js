//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet reflect' command. Runs phantomjs via TIBET's phantomtsh
 *     script runner. The script run is ':reflect' with optional arguments.
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

// NOTE this is a subtype of the 'tsh' command focused on running :reflect.
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
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['owners', 'methods', 'slots', 'types'],
        'string': ['filter', 'interface', 'target'],
        'default': {}
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE =
    'tibet reflect [<target>] [--filter <filter>] ' +
        '[--types] [--methods] [--owners] [--slots] [--interface <interface>]';

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

    var target,
        prefix;

    if (CLI.notEmpty(this.options.target)) {
        target = this.options.target;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name (tsh in this case). [1] should be the "target" to run.
        target = this.options._[1];
    }

    //  Client command requires either a target, --types, --methods, or --slots
    //  to give us something to list. If we don't get one of those there's no
    //  point in calling on the client-side code.
    if (CLI.isEmpty(target) && !this.options.types &&
            !this.options.methods && !this.options.slots) {
        return;
    }

    prefix = ':reflect ';

    target = target || '';
    if (target.length > 0 && target.indexOf(prefix) !== 0) {
        //  Quote the target since it can contain separators etc.
        target = prefix + '\'' + target + '\'';
    } else {
        target = prefix;
    }

    if (this.options.interface) {
        //  Quote the interface since it may contain spaces etc.
        target += ' --interface=\'' + this.options.interface + '\'';
    }

    if (this.options.filter) {
        //  Quote the filter since it may contain spaces etc.
        target += ' --filter=\'' + this.options.filter + '\'';
    }

    if (this.options.types) {
        target += ' --types';
    }

    if (this.options.methods) {
        target += ' --methods';
    }

    if (this.options.owners) {
        target += ' --owners';
    }

    if (this.options.slots) {
        target += ' --slots';
    }

    return target;
};


module.exports = Cmd;

}());
