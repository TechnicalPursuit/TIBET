//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet help' command. Displays the usage and/or help text for a
 *     command, or for the entire TIBET CLI if no command name is given. Note
 *     that if `tibet help` is invoked within a project any custom commands or
 *     tibet make targets for that application are also listed.
 */
//  ========================================================================

/* eslint indent:0, consistent-this: 0 */

(function() {

'use strict';

var CLI,
    opener,
    path,
    sh,
    Cmd;

CLI = require('./_cli');
opener = require('opener');
path = require('path');
sh = require('shelljs');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Instance Attributes
//  ---

/**
 * The command execution context. Help can be run in any context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;


/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'help';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet help [command] [--missing]';

//  TODO    add way to list topics in man page section (which can include
//  concepts etc. etc.)

//  ---
//  Instance Methods
//  ---

/**
 * Processes requests of the form 'tibet --usage', 'tibet help --usage', and
 * potentially 'tibet --usage <command>'. The last one is a bit tricky since
 * minimist will parse that and make <command> the value of the usage flag.
 * @returns {Number} A return code.
 */
Cmd.prototype.usage = function() {

    // The 'tibet --usage' command can end up here. It's not really a request
    // for usage on the help command.
    if (this.options._[0] !== 'help') {
        return this.execute();
    }

    this.info('\nUsage: ' + this.USAGE + '\n');

    return 0;
};


/**
 * Runs the help command, outputting a list of usage strings for any commands
 * found.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {
    var command,
        subcmd;

    /*
    // If specific command was given delegate to the command type.
    command = this.options._ && this.options._[1];

    if (command) {
        return this.executeForCommand(command);
    } else if (this.options._ && this.options._[0]) {
        //  When using 'tibet {cmd} --help' we rewrite such that
        //  you don't see two items in the command line, just the
        //  command to get help on.
        command = this.options._ && this.options._[0];
        if (command !== 'help' && command !== 'tibet') {
            return this.executeForCommand(command);
        }
    }
    */

    this.verbose(CLI.beautify(this.options));

    if (this.options._) {

        command = this.options._[0];
        subcmd = this.options._[1];

        switch (this.options._.length) {
            case 0:
                //  'tibet --help' will fall in this camp...
                return this.executeIntro();
            case 1:
                //  Common cases here: 'tibet', 'help', or a command name.
                switch (command) {
                    case 'tibet':
                        return this.executeIntro();
                    case 'help':
                        //  Interesting question here is is the help flag on
                        //  too? If so it's a request for help on help.
                        if (this.options.help) {
                            return this.executeForCommand('help');
                        } else if (this.options.missing) {
                            return this.executeMissingCheck();
                        } else {
                            this.executeHelp();
                            return 0;
                        }
                    default:
                        return this.executeForCommand(command);
                }
            case 2:
                if (command === 'help') {
                    return this.executeForCommand(subcmd);
                } else if (subcmd === 'help') {
                    return this.executeForCommand(command);
                } else {
                    return this.executeForCommand(command + '-' + subcmd);
                }
            default:
                return this.executeForCommand('help');
        }
    }

    this.executeTopics();
    return 0;
};


/**
 * Processes help for a specific command. This method forwards to the command
 * and invokes its help() method.
 * @param {string} command The command name we're running.
 * @returns {Number} A return code.
 */
Cmd.prototype.executeForCommand = function(command) {
    var child,
        config,
        env,
        htmldir,
        htmlpath,
        list,
        manpath,
        pattern,
        topics,
        topic,
        prefix,
        subjects,
        proc,
        viewer;

    //  Default to browser if we can't find 'man', regardless of setting.

    viewer = CLI.cfg('cli.help.viewer');
    switch (viewer) {
        case 'man':
            if (!sh.which('man')) {
                viewer = 'browser';
            }
            break;
        case 'browser':
            break;
        default:
            if (sh.which('man')) {
                viewer = 'man';
            } else {
                viewer = 'browser';
            }
            break;
    }

    if (viewer === 'browser') {
        //  All html files live in the same directory, but we need to identify a
        //  specific section for the topic/page.
        htmldir = CLI.joinPaths(CLI.expandPath('~lib'), 'doc', 'html');
        list = sh.ls(htmldir);
        pattern = new RegExp('^' + command + '\\.' + '(\\d)\\.html');
        list.some(function(file) {
            var filename;

            filename = file.toString();

            if (pattern.test(filename)) {
                htmlpath = filename;
                return true;
            }
            return false;
        });

        if (htmlpath) {
            opener(CLI.joinPaths(htmldir, htmlpath));
        } else {
            CLI.warn('Help not found for ' + command);
        }
        return 0;
    }

    //  Capture the environment so we can adjust MANPATH or the man command
    //  won't be searching where we think it should :)
    env = {};
    Object.keys(process.env).forEach(function(key) {
        env[key] = process.env[key];
    });

    //  Set up the man path. The trick here is that if someone overrides a
    //  command in their project we want to show that first, so ensure we add
    //  project to the front if we add it.
    manpath = CLI.joinPaths(CLI.expandPath('~lib'), 'doc', 'man');
    env.MANPATH = manpath;

    if (CLI.inProject()) {
        manpath = CLI.joinPaths(CLI.expandPath('~'), 'doc', 'man');
        //  NOTE the addition on the front of the path here so project docs are
        //  first in the lookup order.
        env.MANPATH = manpath + ':' + env.MANPATH;
    }

    config = {
        env: env,
        stdio: 'inherit'
    };

    subjects = [];
    topics = this.executeTopics(true);

    if (CLI.inProject()) {
        prefix = CLI.getTIBETProjectName().toLowerCase() + '-';
        topic = command.indexOf(prefix) === 0 ? command : prefix + command;
        if (topics.indexOf(topic) !== -1) {
            subjects.push(topic);
        }
    }

    //  If nothing from project then attempt to find TIBET subject.
    if (subjects.length === 0) {
        prefix = 'tibet-';
        topic = command.indexOf(prefix) === 0 ? command : prefix + command;
        if (topics.indexOf(topic) !== -1) {
            subjects.push(topic);
        }
    }

    if (subjects.length === 0) {
        this.log('No manual page found for \'' + command + '\'.');
        return 0;
    }

    proc = require('child_process');
    child = proc.spawn('man', subjects, config);
    child.on('exit', function(code) {
        return code;
    });

    return 0;
};


/**
 *
 */
Cmd.prototype.executeHelp = function() {
    var intro;

    intro =
        '\nThe tibet command can invoke TIBET built-ins, custom commands,\n' +
        'tibet make targets, grunt targets, or gulp targets based on your\n' +
        'project configuration and your specific customizations.\n\n' +
        'For a list of available commands use `tibet` or `tibet --help`.\n\n' +
        '`tibet help` lets you view documentation found in both your\n' +
        'project and in the TIBET library on any available subjects.';

    this.info(intro);

    this.executeTopics();

    try {
        this.info(CLI.getcfg('npm.name') + '@' +
            CLI.getcfg('npm.version').split('+')[0] +
            ' ' + sh.which('tibet'));
    } catch (e) {
        //  empty
    }

    return 0;
};


/**
 *
 */
Cmd.prototype.executeIntro = function() {
    var intro,
        cmds;

    this.info('\nUsage: tibet <command> <options>', 'bold');

    // ---
    // Introduction
    // ---

    intro =
        '\nThe tibet command can invoke TIBET built-ins, custom commands,\n' +
        'tibet make targets, grunt targets, or gulp targets based on your\n' +
        'project configuration and your specific customizations.\n\n' +
        'Use `tibet help <command>` or `tibet <command> --help` for details.';

    this.info(intro);

    // ---
    // Built-ins
    // ---

    cmds = this.getCommands(__dirname);
    this.info('\n<command> built-ins include:\n', 'bold');
    this.logCommands(cmds);

    // ---
    // Add-ons
    // ---

    if (CLI.inProject(Cmd) || CLI.inLibrary()) {
        cmds = this.getCommands(CLI.expandPath('~app_cmd'));
        if (cmds.length > 0) {
            this.info('\nProject <commands> include:\n', 'bold');
            this.logCommands(cmds);
        }
    }

    if (CLI.isInitialized() || CLI.inLibrary()) {
        cmds = CLI.getMakeTargets();

        if (cmds.length > 0) {
            this.info('\nProject `make` targets include:\n', 'bold');
            this.logCommands(cmds);
        }
    }

    // ---
    // Summary
    // ---

    this.info('\n<options> always include:\n', 'bold');

    this.info('\t--help         display command help text');
    this.info('\t--usage        display command usage summary');
    this.info('\t--color        colorize the log output [true]');
    this.info('\t--verbose      work with verbose output [false]');
    this.info('\t--debug        turn on debugging output [false]');
    this.info('\t--stack        display stack with error [false]');

    this.info('\nUse \'tibet config\' to configure TIBET for your project.',
        'bold');

    try {
        this.info('\n' + CLI.getcfg('npm.name') + '@' +
            CLI.getcfg('npm.version').split('+')[0] +
            ' ' + sh.which('tibet'), 'dim');
    } catch (e) {
        //  empty
    }

    return 0;
};


/**
 * Checks the command list against the markdown directory and produces a list of
 * commands which don't appear to have help defined.
 */
Cmd.prototype.executeMissingCheck = function() {
    var thisref,
        cmds,
        mans,
        missing;

    thisref = this;

    //  ---
    //  Built-ins
    //  ---

    mans = sh.ls(CLI.joinPaths(CLI.expandPath('~lib'), 'doc', 'markdown')).map(
        function(name) {
            return name.toString().slice(6, -5);
        });

    cmds = sh.ls(__dirname).filter(
        function(name) {
            var filename;

            filename = name.toString();

            return filename.charAt(0) !== '_' && filename.slice(-3) === '.js';
        }).map(function(name) {
            return name.slice(0, -3);
        });

    missing = cmds.filter(
        function(name) {
            return mans.indexOf(name) === -1;
        });

    missing.forEach(
        function(name) {
            thisref.info(name + ' (built-in command)');
        });

    //  ---
    //  Custom commands
    //  ---

    mans = sh.ls(CLI.joinPaths(CLI.expandPath('~'), 'doc', 'markdown')).map(
            function(name) {
                return name.toString().slice(6, -5);
            });

    cmds = this.getCommands(CLI.expandPath('~app_cmd')).filter(
            function(name) {
                return name.charAt(0) !== '_';
            });

    missing = cmds.filter(
            function(name) {
                return mans.indexOf(name) === -1;
            });

    missing.forEach(
            function(name) {
                thisref.info(name + ' (project command)');
            });

    //  ---
    //  Makefile targets
    //  ---

    cmds = CLI.getMakeTargets().filter(function(name) {
        return name.charAt(0) !== '_';
    });

    missing = cmds.filter(function(name) {
        return mans.indexOf(name) === -1;
    });

    missing.forEach(function(name) {
        thisref.info(name + ' (make target)');
    });

    return 0;
};


/**
 */
Cmd.prototype.executeTopics = function(silent) {
    var paths,
        fullpath,
        topics,
        results,
        cmd;

    results = [];
    topics = [];
    paths = [];

    cmd = this;

    if (CLI.inProject()) {
        fullpath = CLI.joinPaths(CLI.expandPath('~'), 'doc', 'man');
        if (sh.test('-d', fullpath)) {
            paths.push(fullpath);
        }
    }
    fullpath = CLI.joinPaths(CLI.expandPath('~lib'), 'doc', 'man');
    if (sh.test('-d', fullpath)) {
        paths.push(fullpath);
    }

    paths.forEach(function(root, index) {

        sh.ls('-R', root).forEach(function(file) {
            var filename,
                filepath,
                name,
                parts;

            filename = file.toString();

            filepath = CLI.joinPaths(root, filename);
            if (sh.test('-d', filepath)) {
                return;
            }

            //  By convention man pages look like {project}-{topic}.{section}
            //  and they will lay out into different section subdirectories. We
            //  want to trim all that off and just list the topic.
            name = path.basename(filename).replace(path.extname(filename), '');
            parts = name.split('-');
            if (parts.length > 1) {
                name = parts.slice(1).join('-');
            }

            topics.push(name);
        });

        if (paths.length > 1 && index === 0) {
            if (topics.length > 0) {
                if (!silent) {
                    cmd.info('\nProject help topics include:\n');
                    cmd.logCommands(topics);
                }
                topics.forEach(function(topic) {
                    results.push(cmd.getcfg('npm.name') + '-' + topic);
                });
            }
        } else {
            if (!silent) {
                cmd.info('\nLibrary help topics include:\n');
                cmd.logCommands(topics);
                cmd.log('');
            }
            topics.forEach(function(topic) {
                results.push('tibet-' + topic);
            });
        }
    });

    return results;
};


/**
 * Returns a list of command files found in the path provided.
 * @param {string} aPath The path to search.
 * @returns {Array.<string>} The list of commands.
 */
Cmd.prototype.getCommands = function(aPath) {
    var files,
        cmds;

    cmds = [];

    // Depending on where the command is run the path built might not actually
    // exist, so check that first.
    if (sh.test('-d', aPath)) {
        files = sh.ls(aPath);
        files = files.map(function(file) {
            return file.toString();
        });

        files.sort().forEach(function(filename) {
            if (filename.indexOf(CLI.MAKE_FILE) !== -1) {
                return;
            }

            if (filename.charAt(0) !== '_' && /\.js$/.test(filename)) {
                cmds.push(filename.replace(/\.js$/, ''));
            }
        });
    }

    return cmds;
};


/**
 * Outputs a command list, formatting it so it wraps properly and stays indented
 * to keep it looking crisp.
 * @param {Array.<string>} aList The list of command names to output.
 */
Cmd.prototype.logCommands = function(aList) {
    CLI.logItems(aList);
};


module.exports = Cmd;

}());
