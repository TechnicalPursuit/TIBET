//  ========================================================================
/**
 * @overview The 'tibet make' command. Inspired by shelljs/make but adapted to
 *     the needs of the TIBET CLI and reworked to leverage Promises.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */

/*eslint no-process-exit:0, no-unused-vars:0*/
(function() {

'use strict';

var CLI = require('./_cli');
var Q = require('q');


//  ---
//  Type Construction
//  ---

var Parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new Parent();


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


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
'Runs a target function in a TIBET \'makefile.js\' file via a JS Promise.\n\n' +

'This command supports lightweight commands in the form of functions, much\n' +
'like Grunt or Gulp. There\'s no dependency checking or true \'make\'-like \n' +
'functionality but the makefile.js code does leverage Q-style Promises to\n' +
'coordinate tasks and their interactions, particularly when calling tasks\n' +
'within tasks and when dealing with asynchronous tasks. This makes it a bit\n' +
'more predictable and consistent than some other task management options.\n\n' +

'--list can be used to list the available makefile.js targets you can run.\n\n' +

'--timeout <ms> gives you a way to provide a millisecond timeout value in\n' +
'which each task must complete successfully. The default is 15 seconds.\n';


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

    if (CLI.inProject() && !CLI.isInitialized()) {
        CLI.notInitialized();
    }

    // The CLI loads our makefile to check for targets. We can just leverage
    // that here to execute.
    targets = CLI.getMakeTargets();
    if (CLI.notValid(targets)) {
        // Errors are reported by the getMakeTargets call, just exit.
        process.exit(1);
    }

    // Two cases here. When 'tibet make' is invoked directly the value at
    // options[0] is 'make'. When make is invoked indirectly via the CLI
    // fallback mechanism options[0] is the make target.
    command = this.options._[1] || this.options._[0];

    // Might be 'tibet make --list' etc. NOTE the ._. portion is correct here,
    // the '_' object is from the options parser.
    if (command === 'make' && this.options._.length === 1) {
        if (this.options.list === true) {
            return this.executeList(targets);
        }

        this.error('No make target provided.');
        process.exit(1);
    }

    if (typeof targets[command] !== 'function') {
        this.error('TIBET make target not found: ' + command);
        process.exit(1);
    }

    // Make sure the targets have been pre-processed for better control.
    this.prepTargets(targets);

    try {
        cmd = this;

        start = new Date();

        // NOTE the use of then() here since our task prep makes each task into
        // a function returning a new Promise. We rely on this for more control
        // over async tasks etc.
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

                msg = 'Task success: ' +
                    ((new Date()).getTime() - start) + 'ms.';
                cmd.system(msg);

                process.exit(0);
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

                msg = 'Task failure: ' +
                    ((new Date()).getTime() - start) + 'ms.';
                cmd.error(msg);

                process.exit(1);
            });

    } catch (e) {
        this.error(e.message);
        process.exit(1);
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

    return;
};


/**
 * Returns the name of the current project as defined in the Package.NPM_FILE.
 * @return {String} The project name.
 */
Cmd.prototype.getProjectName = function() {
    return CLI.getProjectName();
};


/**
 * Wraps individual target functions in functions returning Q-style Promise
 * instances. The resulting task function invocations can be chained via then().
 * The function wrappers also have a resolve() and reject() wrapper placed on
 * them so they can easily invoke the appropriate call on completion of their
 * task. A timeout option is also injected such that long-running tasks (likely
 * due to forgetting to reject or resolve) can be rejected automatically.
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

    if (CLI.notEmpty(this.options.timeout)) {
        timeout = parseInt(this.options.timeout, 10);
        if (isNaN(timeout)) {
            throw new Error('Invalid timeout: ' + this.options.timeout);
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
                targets[name] = function(make) {
                    var promise;

                    if (targets[name].$$active) {
                        cmd.error(
                            'Error: Circular invocation of `' + name + '`');
                        // No easy way to clean up all the potential promises,
                        // timers, etc. so just exit directly.
                        process.exit(1);
                    } else {
                        targets[name].$$active = true;
                    }

                    promise = Q.Promise(function(resolver, rejector) {
                        var timer;

                        // TODO: replace with Promise-based timeout() call.
                        timer = setTimeout(function() {
                            cmd.error('Task ' + name + ' timed out.');
                            rejector('timeout');
                        }, timeout);

                        // Hold on to timer to make it easier to clear.
                        targets[name].timer = timer;

                        // Patch on a wrapper for resolve() calls. This ensures
                        // that our outer task-runner level resolve hook runs.
                        targets[name].resolve = function(obj) {
                            clearTimeout(timer);
                            cmd.debug('resolving ' + name + '...');
                            func.$$active = false;
                            resolver(obj);
                        };

                        // Patch on a wrapper for reject() calls. This ensures
                        // that our outer task-runner level reject hook runs.
                        targets[name].reject = function(err) {
                            clearTimeout(timer);
                            cmd.debug('rejecting ' + name + '...');
                            cmd.error(err);
                            func.$$active = false;
                            rejector(err);
                        };

                        // Make sure all targets start from the makefile.js
                        // location.
                        process.chdir(CLI.getAppHead());

                        try {
                            func.call(func, cmd);           // run it :)
                        } catch (e) {
                            cmd.error('Error running task `' + name +
                                '`: ' + e.message);
                            targets[name].reject(e);
                        }
                    });

                    return promise;
                }.bind(targets, cmd);   // ensure 'this' and 'make' exist.

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
