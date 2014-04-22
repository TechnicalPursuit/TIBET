/**
 * @overview The 'tibet make' command. Inspired by shelljs/make but adapted to
 *     the needs of the TIBET CLI and reworked to leverage Promises.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

'use strict';

var CLI = require('./_cli');
var sh = require('shelljs');
var Promise = require('when/es6-shim/Promise');


//  ---
//  Type Construction
//  ---

var Parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new Parent();


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Runs a target function in a TIBET project \'make\' file as a Promise.\n\n' +
'Inspired by shelljs/make but adjusted to meet the requirements of TIBET\'s\n' +
'command line interface.\n' +
'The purpose here is to support lightweight custom commands in the form of\n' +
'functions. There\'s no dependency checking or true \'make\' functionality\n' +
'per se but the TIBET make file does leverage ES6 Promises to help manage\n' +
'tasks and their interactions, particularly when calling tasks from within\n' +
'tasks and when dealing with asynchronous tasks.';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet make [<target>] [--list]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 */
Cmd.prototype.execute = function() {

    var targets;
    var command;
    var cmd;

    // The CLI loads our makefile to check for targets. We can just leverage
    // that here to execute.
    targets = CLI.getMakeTargets();
    if (CLI.notValid(targets)) {
        // Errors are reported by the getMakeTargets call, just exit.
        return 1;
    }

    // Two cases here. When 'tibet make' is invoked directly the value at
    // argv[0] is 'make'. When make is invoked indirectly via the CLI fallback
    // mechanism argv[0] is the make target.
    command = this.argv._[1] || this.argv._[0];

    // Might be 'tibet make --list' etc.
    if (command === 'make' && this.argv._.length === 1) {
        if (this.argv.list === true) {
            return this.executeList(targets);
        }

        this.error('No make target provided.');
        return 1;
    }

    if (typeof targets[command] !== 'function') {
        this.error('TIBET make target not found: ' + command);
        return 1;
    }

    // Make sure the targets have been pre-processed for better control.
    this.prepTargets(targets);

    try {
        cmd = this;

        // NOTE the use of then() here since our task prep makes each task into
        // Promise. We rely on this for more control over async tasks etc.
        targets[command](this).then(
            function() {
                cmd.log('task success');
            },
            function() {
                cmd.log('task failure');
            });
    } catch (e) {
        this.error(e.message);
        return 1;
    }
};


/**
 * Lists available make targets. Ensures only valid function targets are listed
 * and outputs the list in sorted order.
 * @param {Object} targets The object export from the TIBET make file used.
 */
Cmd.prototype.executeList = function(targets) {
    var list;

    list = [];
    Object.keys(targets).forEach(function(key) {
        if (typeof targets[key] === 'function') {
            // Also ignore our internal property if found.
            if (key !== '$$wrapped') {
                list.push(key);
            }
        }
    });
    list.sort();

    this.info('Available targets:\n');
    CLI.logItems(list);

    return 0;
};


/**
 * Wraps individual target functions in functions returning ES6 Promise
 * instances. The resulting task functions can be chained via then(). The
 * function wrappers also have a resolve() and reject() wrapper placed on them
 * so they can easily invoke the appropriate call on completion of their task.
 * @param {Object} targets An object whose functions serve as make targets.
 */
Cmd.prototype.prepTargets = function(targets) {
    var cmd;

    // For control purposes we want to wrap individual make target functions if
    // they're not already wrapped.
    if (targets.$$wrapped) {
        return;
    }

    // Binding reference.
    cmd = this;

    Object.keys(targets).forEach(function(key) {

        if (typeof targets[key] === 'function') {

            (function(name, func) {

                // Replace original with a function returning a Promise.
                targets[name] = function() {
                    var promise;
                    promise = new Promise(function(resolve, reject) {

                        // Patch on a wrapper for resolve() calls. This ensures
                        // that our outer task-runner level resolve hook runs.
                        targets[name].resolve = function(reason) {
                            cmd.debug('resolving...' + (reason || ''));
                            resolve.apply(resolve, arguments);
                        };

                        // Patch on a wrapper for reject() calls. This ensures
                        // that our outer task-runner level reject hook runs.
                        targets[name].reject = function(reason) {
                            cmd.debug('rejecting...' + (reason + ''));
                            reject.apply(reject, arguments);
                        };

                        cmd.log('running ' + name);
                        try {
                            func.call(func, cmd);
                        } catch (e) {
                            reject(e);
                        }

                    });

                    return promise;
                };
            }(key, targets[key]));

            return;
        }
    });

    targets.$$wrapped = true;
};


module.exports = Cmd;

}());
