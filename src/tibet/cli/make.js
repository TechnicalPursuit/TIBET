//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet make' command. Inspired by shelljs/make but adapted to
 *     the needs of the TIBET CLI and reworked to leverage Promises.
 */
//  ========================================================================

/* eslint no-process-exit:0, no-unused-vars:0, indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Promise,
    path,
    fs,
    hb,
    sh,
    child,
    nodecli,
    minimist,
    helpers,
    Cmd;


CLI = require('./_cli');
Promise = require('bluebird');
path = require('path');
hb = require('handlebars');
sh = require('shelljs');
fs = require('fs');
child = require('child_process');
path = require('path');
minimist = require('minimist');
nodecli = require('shelljs-nodecli');
helpers = require('../../../etc/helpers/make_helpers');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();

/**
 * List of known make targets. This is built on the fly from the getTargets call
 * so it's null until that command runs.
 * @type {Array.<Object>};
 */
Cmd.$targets = null;


/**
 * Reference to the overall CLI for logging etc.
 * @type {Object}
 */
Cmd.CLI = CLI;

/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'make';

/**
 * Millisecond count for how long an individual task can run before it times out
 * and is rejected automatically. You can set a timeout value using --timeout on
 * the command line.
 * @type {Number}
 */
Cmd.TIMEOUT = 1000 * 30;

//  ---
//  Type Methods
//  ---

/**
 * Initialize the command, setting up anything that might be necessary or
 * helpful before there's actually an instance (or handle to one).
 */
Cmd.initialize = function() {
    var options;

    //  Parse options for compression-related tasks in helpers.
    options = {
        boolean: ['brotli', 'zip'],
        default: {
            brotli: false,
            zip: true
        }
    };
    Cmd.setcfg('make.compression.parse_options', options);

    //  Parse options for package-related tasks in helpers.
    options = {
        //  TODO: do we need 'profile' in this list?
        string: ['package', 'config']
    };
    Cmd.setcfg('make.package.parse_options', options);

    return;
};


/**
 * Defines a TIBET make task, the combination of a task name and a task
 * function. The function should accept three parameters: a handle to the make
 * command instance running the task, a promise resolver, and a promise
 * rejector. The resolver and rejector are bound to the current task.
 * @param {String} name The name that uniquely identifies this task.
 * @param {String|Function} [task] The task function to run, or a module name to
 *     load from the ~app_cmd/make directory. Defaults to the task name.
 * @param {Object} [options] Default configuration options such as 'timeout'.
 */
Cmd.defineTask = function(name, task, options) {
    var taskname,
        taskfunc,
        fullpath;

    //  Make sure we've got a target array ready to handle the definition.
    Cmd.$targets = Cmd.$targets || [];

    if (typeof name !== 'string') {
        CLI.error('Invalid task name: ' + name);
        return -1;
    }

    //  Task can default to task name as a module to require from the local
    //  location, or it can be a path string we expand, or an actual function.
    if (CLI.notValid(task)) {
        taskname = name;
    } else if (typeof task === 'string') {
        taskname = task;
    } else if (typeof task !== 'function') {
        CLI.error('Invalid task function: ' + task);
        return -1;
    }

    if (CLI.notEmpty(taskname)) {
        if (CLI.isAbsolutePath(taskname)) {
            fullpath = CLI.expandPath(taskname);
        } else {
            fullpath = CLI.expandPath(path.join('~app_cmd/make', taskname));
        }
        taskfunc = require(fullpath);
    } else {
        taskfunc = task;
    }

    if (this.hasTarget(name)) {
        CLI.warn('redefining makefile target: ' + name);
    }

    Cmd.$targets.push({name: name, task: taskfunc});

    Cmd.defineTaskOptions(name, options);

    return;
};


/**
 * Defines options for a specific task. If the task doesn't exist this method
 * will throw an exception.
 * @param {String} name The name that uniquely identifies this task.
 * @param {Object} options Default configuration options such as 'timeout'.
 * @returns {Object} An object with name, task, and options properties.
 */
Cmd.defineTaskOptions = function(name, options) {
    var target;

    if (!this.hasTarget(name)) {
        throw new Error('Undefined task ' + name);
    }

    target = this.getTarget(name);
    target.options = options;

    return target;
};


/**
 * Returns a configuration value or set of them based on the nature of the
 * property name provided. If the property represents a 'root' then all values
 * with that root are returned. If no property name is given the entire set of
 * all configuration data is returned.
 * @param {string} property A specific property value to check.
 * @param {Object} [aDefault] Optional value to default the lookup to.
 * @returns {Object} The property value, or a block of configuration data.
 */
Cmd.getcfg = function(property, aDefault) {
    return CLI.getcfg(property, aDefault);
};
Cmd.cfg = Cmd.getcfg;


/**
 * Returns the task definition object for the target command. The returned value
 * has name and task properties which return the task name and implementation.
 * @param {String} command The name of the makefile target to locate.
 * @returns {Object} An object with name, task, and options properties.
 */
Cmd.getTarget = function(command) {
    var targets;

    targets = this.getTargets();

    return targets.filter(function(target) {
        return target.name === command;
    })[0];
};


/**
 * Returns a list of known targets (task names) for the current project. Private
 * targets are filtered by default. A private target is any target beginning
 * with a '.', '_', or '$'.
 * @param {Boolean} [includePrivate=false] Whether private task names should
 *     also be included in the result.
 * @returns {Array.<String>} An array of task target names.
 */
Cmd.getTargetNames = function(includePrivate) {
    var targets,
        names,
        opts,
        options,
        priv;

    targets = this.getTargets();
    if (!targets) {
        return [];
    }

    names = targets.map(function(target) {
        return target.name;
    });

    opts = CLI.blend({boolean: ['private']}, CLI.PARSE_OPTIONS);
    options = minimist(CLI.getArgv(), opts);

    priv = CLI.isValid(includePrivate) ? includePrivate : options.private;
    if (priv === true) {
        return names;
    }

    // Filter to remove any "private" targets the project doesn't want
    // shown via help.
    names = names.filter(function(name) {
        return name.indexOf('_') !== 0 &&
            name.indexOf('.') !== 0 &&
            name.indexOf('$') !== 0;
    });

    return names;
};


/**
 * Returns the targets exported from any CLI.MAKE_FILE in the application. If
 * the file isn't loaded yet this call will attempt to load it. The default
 * value for CLI.MAKE_FILE is '~app_cmd/make/makefile.js'.
 * @returns {Array.<Object>} An array of objects with name/task properties.
 */
Cmd.getTargets = function() {
    var fullpath,
        prefix;

    if (this.$targets) {
        return this.$targets;
    }

    //  Prefix varies by whether we're in a project or not.
    if (CLI.inProject()) {
        prefix = '~app_cmd';
    } else if (CLI.inLibrary()) {
        prefix = '~lib_cmd';
    } else {
        //  Not an error so we can do command-completion even outside a project
        //  or the library.
        return [];
    }

    fullpath = CLI.expandPath(CLI.MAKE_FILE);
    if (!CLI.sh.test('-f', fullpath)) {
        CLI.error('Unable to find TIBET make file: ' + fullpath);
        return [];
    }

    try {
        require(fullpath)(this);
    } catch (e) {
        CLI.error('Unable to load TIBET make file: ' + e.message);
    }

    return this.$targets;
};


/**
 * Returns the task implementation (function) for the specified target.
 * @param {String} command The name of the makefile target to search.
 * @returns {Function} A task implementation function accepting a make instance,
 *     promise resolver, and promise rejector.
 */
Cmd.getTargetTask = function(command) {
    var targets,
        target;

    targets = this.getTargets();

    target = targets.filter(function(obj) {
        return obj.name === command;
    })[0];

    if (target) {
        return target.task;
    }
};


/**
 * Returns true if the current project makefile definitions include the named
 * target.
 * @param {String} command The name of the makefile target to search.
 * @returns {Boolean} True if the target exists.
 */
Cmd.hasTarget = function(command) {
    var targets;

    targets = this.getTargetNames(true);

    return targets.indexOf(command) !== -1;
};


/**
 * Loads all tasks found in the current context's _cmd/make directory. The
 * resulting tasks are registered via defineTask and can then be configured via
 * defineTaskOptions to assign unique task options such as timeout.
 */
Cmd.loadTasks = function() {
    var context,
        fullpath,
        list,
        cmd;

    context = CLI.inProject() ? 'app' : 'lib';

    fullpath = CLI.expandPath('~' + context + '_cmd/make');

    list = sh.ls(fullpath);

    list.forEach(function(file) {
        var name,
            task,
            filepath;

        if (/^makefile.*\.js$/.test(file)) {
            return;
        }

        filepath = path.join(fullpath, file);
        name = path.basename(file).replace(path.extname(file), '');

        try {
            task = require(filepath);
            Cmd.defineTask(name, task, task.options || {});
        } catch (e) {
            CLI.error('Error loading task ' + name + ': ' + e);
        }
    });
};


/**
 * Wraps individual target functions in functions returning JavaScript Promise
 * instances. The resulting task function invocations can be chained via then().
 * The function wrappers also have a resolve() and reject() wrapper placed on
 * them so they can easily invoke the appropriate call on completion of their
 * task. A timeout option is also injected such that long-running tasks (likely
 * due to forgetting to reject or resolve) can be rejected automatically.
 * @param {Object} targets An object whose functions serve as make targets.
 */
Cmd.$prepTargets = function(cmd) {
    var targets,
        timeout;

    //  Nothing to do if we haven't loaded targets yet.
    if (!this.$targets) {
        return;
    }

    //  Don't do this operation twice. That would be bad.
    if (this.$targets.$$wrapped === cmd) {
        return;
    }

    this.$targets.forEach(function(target) {
        var key,
            task;

        key = target.name;
        task = target.task;

        // If the user put one on the command line that wins, followed by
        // anything task-specific, followed by our default timeout value.
        if (CLI.notEmpty(cmd.options.timeout)) {
            timeout = parseInt(cmd.options.timeout, 10);
            if (isNaN(timeout)) {
                throw new Error('Invalid timeout: ' + cmd.options.timeout);
            }
        } else if (CLI.isValid(target.options) &&
                CLI.isValid(target.options.timeout)) {
            timeout = target.options.timeout;
        } else {
            timeout = Cmd.TIMEOUT;
        }

        (function(name, func, time) {

            // Replace original with a function returning a Promise.
            target.task = function(make) {
                var promise;

                if (task.$$active) {
                    cmd.error(
                        'Error: Circular invocation of `' + name + '`');
                    // No easy way to clean up all the potential promises,
                    // timers, etc. so just exit directly.
                    process.exit(1);
                } else {
                   task.$$active = true;
                }

                /* eslint-disable new-cap */
                promise = new Promise(function(resolver, rejector) {
                    var timer;

                    // TODO: replace with Promise-based timeout() call.
                    timer = setTimeout(function() {
                        cmd.error('Task ' + name + ' timed out.');
                        rejector('timeout');
                    }, time);

                    // Hold on to timer to make it easier to clear.
                    task.timer = timer;

                    //  Assign any options provided during definition to the
                    //  task instance for reference. The empty object avoids
                    //  make functions from having to test for this.options.
                    task.options = target.options || {};

                    // Patch on a wrapper for resolve() calls. This ensures
                    // that our outer task-runner level resolve hook runs.
                    task.resolve = function(obj) {
                        clearTimeout(timer);
                        cmd.debug('resolving ' + name + '...');
                        task.$$active = false;
                        resolver(obj);
                    };

                    // Patch on a wrapper for reject() calls. This ensures
                    // that our outer task-runner level reject hook runs.
                    task.reject = function(err) {
                        clearTimeout(timer);
                        cmd.debug('rejecting ' + name + '...');
                        /*
                        if (err !== void 0) {
                            cmd.error('' + err);
                        }
                        */
                        task.$$active = false;
                        rejector(err);
                    };

                    // Make sure all targets start from the application head or
                    // library head, essentially '~'.
                    process.chdir(CLI.getAppHead());

                    try {
                        // run it, passing make, a resolver, and a rejector.
                        func.call(func,
                            cmd,
                            task.resolve.bind(task),
                            task.reject.bind(task));
                    } catch (e) {
                        cmd.error('Error running task `' + name +
                            '`: ' + e.message);
                        if (cmd.options.stack) {
                            cmd.error(e.stack);
                        }
                        task.reject(e);
                    }
                });
                /* eslint-enable new-cap */

                return promise;

            }.bind(targets, cmd);   // ensure 'this' and 'make' exist.

            task.displayName = name;
            task.$$original = func;

        }(key, task, timeout));
    });

    this.$targets.$$wrapped = cmd;
};


/**
 * Sets a configuration value. In cases where the value is a block of data note
 * that it is stored 'as-is'. No flattening of value keys is performed. For
 * example, using Make.setcfg('foo', { bar: 123 }) does not allow you to then
 * query for Make.getcfg('foo.bar'). If 'foo.bar' is a key you need to access
 * then use Make.setcfg('foo.bar', 123) or Make.setcfg({foo: { bar: 123 }});
 * @param {String|Object} property A specific property name to be updated.
 * @param {Object} [value] A specific property value to set.
 */
Cmd.setcfg = function(property, value) {
    return CLI.setcfg(property, value);
};


//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet make [<target>] [--list] [--timeout <ms>]';

//  ---
//  Module Mappings
//  ---

Cmd.prototype.fs = fs;
Cmd.prototype.helpers = helpers;
Cmd.prototype.minimist = minimist;
Cmd.prototype.nodecli = nodecli;
Cmd.prototype.path = path;
Cmd.prototype.Promise = Promise;
Cmd.prototype.sh = sh;
Cmd.prototype.template = hb;

Cmd.prototype.template.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

//  ---
//  CLI Mappings
//  ---

Cmd.prototype.beautify = CLI.beautify.bind(CLI);
Cmd.prototype.blend = CLI.blend.bind(CLI);
Cmd.prototype.handleError = CLI.handleError.bind(CLI);

//  ---
//  Instance Methods
//  ---

/**
 * Runs a series of tasks, connecting each one via a standard then() operation.
 * @param {Array|String} targets An array of task names, or the first of a
 *     variable argument list of task names.
 * @returns {Function} The task implementation function.
 */
Cmd.prototype.chain = function(targets) {
    var list,
        target,
        task,
        promise;

    switch (arguments.length) {
        case 0:
            this.error('Invalid task list for chain.');
            return -1;
        case 1:
            if (Array.isArray(targets)) {
                list = targets;
            } else {
                list = [targets];
            }
            break;
        default:
            list = Array.prototype.slice.call(arguments, 0);
            break;
    }

    target = list.shift();
    task = typeof target === 'function' ? target : Cmd.getTargetTask(target);
    if (!task) {
        this.error('Unable to find task: ' + target);
        return -1;
    }

    //  First one needs to be invoked directly. From there on the return values
    //  should be promises we can chain.
    try {
        promise = task();
    } catch (e) {
        return CLI.handleError(e);
    }

    while (list.length) {
        target = list.shift();
        task = typeof target === 'function' ? target : Cmd.getTargetTask(target);

        if (!task) {
            this.error('Unable to find task: ' + target);
            return -1;
        }

        try {
            promise = promise.then(task);
        } catch (e) {
            CLI.handleError(e);
            break;
        }
    }

    return promise;
};


/**
 * Defines options for a specific task. If the task doesn't exist this method
 * will throw an exception.
 * @param {String} name The name that uniquely identifies this task.
 * @param {Object} options Default configuration options such as 'timeout'.
 * @returns {Object} An object with name, task, and options properties.
 */
Cmd.prototype.defineTaskOptions = function(name, options) {
    return Cmd.defineTaskOptions(name, options);
};


/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var targets,
        command,
        cmd,
        start;

    if (CLI.inProject() && !CLI.isInitialized()) {
        CLI.notInitialized();
    }

    targets = Cmd.getTargets();
    if (CLI.notValid(targets)) {
        // Errors are reported by the getTargets call, just exit.
        process.exit(1);
    }

    // When 'tibet make' is invoked directly the value at options[0] is 'make'.
    // When make is invoked indirectly via the CLI fallback mechanism options[0]
    // is the make target. All other items should be thought of as arguments.
    switch (this.options._.length) {
        case 0:
            return this.executeList(Cmd.getTargetNames(
                this.getArgument('private')));
        case 1:
            command = this.options._[0];
            break;
        default:
            if (this.options._[0] === 'make') {
                command = this.options._[1];
            } else {
                command = this.options._[0];
            }
            break;
    }

    // Might be 'tibet make --list' etc. NOTE the ._. portion is correct here,
    // the '_' object is from the options parser.
    if (command === 'make' && this.options._.length === 1) {
        return this.executeList(Cmd.getTargetNames(
            this.getArgument('private')));
    }

    if (!Cmd.hasTarget(command)) {
        this.error('TIBET make target not found: ' + command);
        process.exit(1);
    }

    //  Ensure targets are prepped so they're all promisified.
    Cmd.$prepTargets(this);

    try {
        cmd = this;

        // Associate a CLI instance for use by targets.
        this.CLI = CLI;

        start = new Date();

        //  Invoke the initial target. Note that this _should_ return a promise,
        //  but we don't assume that's the case. If we get anything else back we
        //  connect to the original promise for the target.
        Cmd.getTargetTask(command)(this).then(
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

                msg = 'Task complete: ' +
                    ((new Date()).getTime() - start) + 'ms.';
                cmd.system(msg);

                process.exit(0);
            },
            function(err) {
                var msg;

                if (CLI.isValid(err)) {
                    if (typeof err === 'string') {
                        cmd.error(err);
                    } else if (err instanceof Error) {
                        cmd.error(err.message);
                    } else {
                        cmd.error(JSON.stringify(err));
                    }
                }

                msg = 'Task failure: ' +
                    ((new Date()).getTime() - start) + 'ms.';
                cmd.error(msg);

                process.exit(1);

            }).catch(function(err) {
                var msg;

                msg = 'Task exception: ' + err + ' ' +
                    ((new Date()).getTime() - start) + 'ms.';
                cmd.error(msg);

                process.exit(1);
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
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeList = function(targets) {

    this.info('Available targets:\n');
    CLI.logItems(targets.sort());

    return;
};


/**
 * Returns the configuration values currently in force by accessing the make
 * command type's getcfg implementation.
 * @param {string} property A specific property value to check.
 * @param {Object} [aDefault] Optional value to default the lookup to.
 * @returns {Object} The property value, or the entire configuration object.
 */
Cmd.prototype.getcfg = function(property, aDefault) {
    //  NOTE we refer to the type method here, not CLI.
    return Cmd.getcfg(property, aDefault);
};
Cmd.prototype.cfg = Cmd.prototype.getcfg;


/**
 * Returns the name of the current project as defined in the Package.NPM_FILE.
 * @returns {String} The project name.
 */
Cmd.prototype.getProjectName = function() {
    return CLI.getProjectName();
};


/**
 * Reparses the command line using the options provided. Normally called by
 * individual tasks to check for command line flags.
 * @param {Object} options An object containing minimist-compliant parse
 *     options and their defaults.
 * @returns {Object} A minimist parse result object.
 */
Cmd.prototype.reparse = function(options) {
    var opts;

    if (this.hasOwnProperty('PARSE_OPTIONS')) {
        opts = CLI.blend(options || {}, this.PARSE_OPTIONS);
    } else {
        opts = options || {};
    }

    opts = CLI.blend(opts, CLI.PARSE_OPTIONS);

    return CLI.blend(minimist(this.getArgv(), opts), this.options);
};


/**
 * Spawns a sub-process whose stdio is attached to the main process and which
 * has the shell flag set to true so it can be used similarly to exec. NOTE that
 * there is no on.('close') or on('exit') defined, you are expected to add these
 * yourself to the process object returned from this call.
 * @param {String} cmd The command string to be executed.
 * @param {Array} [arglist] Optional argument list for the command.
 * @param {Object} [options] Optional option list for the command.
 * @return {Object} The Child Process object from Node.js.
 */
Cmd.prototype.spawn = function(cmd, arglist, options) {
        var proc,
            make,
            args,
            opts;

        make = this;

        args = arglist || [];
        opts = CLI.blend(options, {
            stdio: 'inherit',
            shell: true
        });

        proc = child.spawn(cmd, args, opts);

        proc.on('error', function(err) {
            make.error(err);
        });

        return proc;
};


/**
 * Searches the makefile target list and returns the function which implements
 * the named task. This function can be passed directly to a then() operation or
 * invoked directly via '()' to trigger task execution.
 * @param {String} name The name of the task to be retrieved.
 * @returns {Function} The task implementation function.
 */
Cmd.prototype.task = function(name) {
    return Cmd.getTargetTask(name);
};


/**
 *  @param {String} property The TIBET configuration property name to update.
 *  @param {Object} value The value to set for the configuration parameter.
 *  @returns {Object} The result value of setting the configuration parameter.
 */
Cmd.prototype.setcfg = function(property, value) {
    //  NOTE we refer to the type method here, not CLI.
    return Cmd.setcfg(property, value);
};


module.exports = Cmd;

}());
