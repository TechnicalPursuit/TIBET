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

/*eshint no-process-exit:0*/
(function() {

'use strict';

var CLI = require('./_cli');
var Promise = require('when/es6-shim/Promise');


//  ---
//  Type Construction
//  ---

var Parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new Parent();


/**
 * Millisecond count for how long an individual task can run before it times out
 * and is rejected automatically. You can set a timeout value using --timeout on
 * the command line.
 * @type {Number}
 */
Cmd.TIMEOUT = 15000;


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
Cmd.prototype.USAGE = 'tibet make [<target>] [--list] [--timeout <ms>]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var targets;
    var command;
    var cmd;
    var start;

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

        start = new Date();

        // NOTE the use of then() here since our task prep makes each task into
        // Promise. We rely on this for more control over async tasks etc.
        targets[command](this).then(
            function(obj) {
                var msg;

                if (CLI.isValid(obj)) {
                    if (typeof obj === 'string') {
                        cmd.info(obj);
                    } else if ('' + obj === '[object Object]') {
                        cmd.info(JSON.stringify(obj));
                    } else {
                        cmd.info('' + obj);
                    }
                }

                msg = 'task success ' +
                    ((new Date()).getTime() - start) + 'ms.';
                cmd.log(msg);
            },
            function(err) {
                var msg;

                if (CLI.isValid(err)) {
                    if (err instanceof Error) {
                        cmd.error(err.message);
                    } else {
                        cmd.error(JSON.stringify(err));
                    }
                }

                msg = 'task failure ' +
                    ((new Date()).getTime() - start) + 'ms.';
                cmd.log(msg);
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
 * @return {Number} A return code. Non-zero indicates an error.
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
 * A timeout option is also injected such that long-running tasks (likely due to
 * forgetting to reject or resolve) can be rejected automatically.
 * @param {Object} targets An object whose functions serve as make targets.
 */
Cmd.prototype.prepTargets = function(targets) {
    var cmd;
    var timeout;

    // For control purposes we want to wrap individual make target functions if
    // they're not already wrapped.
    if (targets.$$wrapped) {
        return;
    }

    if (CLI.notEmpty(this.argv.timeout)) {
        timeout = parseInt(this.argv.timeout, 10);
        if (isNaN(timeout)) {
            throw new Error('Invalid timeout: ' + this.argv.timeout);
        }
    } else {
        timeout = Cmd.TIMEOUT;
    }

    // Binding reference.
    cmd = this;

    Object.keys(targets).forEach(function(key) {

        if (typeof targets[key] === 'function') {

            (function(name, func) {

                // Replace original with a function returning a Promise.
                targets[name] = function() {
                    var promise;

                    if (targets[name].$$active) {
                        cmd.error(
                            'Error: Circular invocation of `' + name + '`');
                        // No easy way to clean up all the potential promises,
                        // timers, etc. so just exit directly.
                        process.exit(1);
                    } else {
                        targets[name].$$active = true;
                        cmd.log('making ' + name);
                    }

                    promise = new Promise(function(resolver, rejector) {
                        var timer;

                        timer = setTimeout(function() {
                            cmd.error(name + ' timed out.');
                            rejector('timeout');
                        }, timeout);

                        // Hold on to timer to make it easier to clear.
                        targets[name].timer = timer;

                        // Patch on a wrapper for resolve() calls. This ensures
                        // that our outer task-runner level resolve hook runs.
                        targets[name].resolve = function(obj) {
                            cmd.debug('resolving ' + name + '...');
                            clearTimeout(timer);
                            func.$$active = false;
                            resolver(obj);
                        };

                        // Patch on a wrapper for reject() calls. This ensures
                        // that our outer task-runner level reject hook runs.
                        targets[name].reject = function(err) {
                            cmd.debug('rejecting ' + name + '...');
                            clearTimeout(timer);
                            func.$$active = false;
                            rejector(err);
                        };

                        try {
                            func.call(func, cmd);           // run it :)
                        } catch (e) {
                            cmd.error('Error running task `' + name +
                                '`: ' + e.message);
                            targets[name].reject(e);
                        }
                    });

                    return promise;
                };

                targets[name].displayName = name;
                targets[name].$$original = func;

            }(key, targets[key]));

            return;
        }
    });

    targets.$$wrapped = true;
};


module.exports = Cmd;

}());
