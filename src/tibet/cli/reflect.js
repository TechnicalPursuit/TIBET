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
 * The command help string.
 * @type {String}
 */
Cmd.prototype.HELP =
'Runs the TSH :reflect command to show object or system reflection data.\n\n' +

'The [target] parameter can be any object reference TIBET can resolve.\n' +
'Output from this command depends on the nature of that object. For example,\n' +
'namespace objects default to listing their types while Types default to a\n' +
'list of their type and instance methods.\n\n' +

'You can list all of TIBET\'s types via `tibet reflect --types` or list all\n' +
'methods via `tibet reflect --methods`. If you specify a method name and use\n' +
'--owners you\'ll see a list of all implementers of methods of that name.\n\n' +

'Depending on the nature of the output you can associate a filter using the\n' +
'--filter option. The filter is typically used in one of two ways. First,\n' +
'it is checked against the list of valid TP.interface filter strings. If the\n' +
'filter is of this form it is used to restrict the keys returned from the\n' +
'target object. Second, it can be used as the body of a regular expression.\n' +
'When used in this latter form the list of output is checked and only those\n' +
'values which match the filter will be returned. A good example is to use\n\n' +

'tibet reflect --methods --filter element\n\n' +

'The above command will list all methods which match the string \'element\'\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['owners', 'methods', 'types', 'column'],
        'string': ['filter', 'target'],
        'default': {}
    },
    Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE =
    'tibet reflect [target] [--filter <filter>] [--types] [--methods] [--owners]';

//  ---
//  Instance Methods
//  ---

/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @return {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {

    var target,
        prefix;

    //  Client command requires either a target, or --types or --methods to give
    //  us something to actually list. If we don't get one of those there's no
    //  point in calling on the client-side code.
    if (CLI.isEmpty(this.options.target) &&
            !this.options.types && !this.options.methods) {
        return;
    }

    if (CLI.notEmpty(this.options.target)) {
        target = this.options.target;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name (tsh in this case). [1] should be the "target" to run.
        target = this.options._[1];
    }

    prefix = ':reflect ';

    target = target || '';
    if (target.length > 0 && target.indexOf(prefix) !== 0) {
        //  Quote the target since it can contain separators etc.
        target = prefix + '\'' + target + '\'';
    } else {
        target = prefix;
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

    //  Add column flag since we need column output for cli. Otherwise we'll end
    //  up with a single block of text which PhantomJS 1.9.x has trouble with.
    target += ' --column';

    return target;
};


module.exports = Cmd;

}());
