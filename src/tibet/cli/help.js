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
 *     makefile.js targets for that application are also listed.
 */
//  ========================================================================

/* eslint indent:0, object-curly-newline:0 */

(function() {

'use strict';

var CLI,
    opener,
    path,
    sh,
    hb,
    nodecli,
    Cmd;

CLI = require('./_cli');
opener = require('opener');
path = require('path');
sh = require('shelljs');
hb = require('handlebars');
nodecli = require('shelljs-nodecli');

//  ---
//  Type Construction
//  ---

Cmd = function() {
    //  empty
};
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
Cmd.prototype.USAGE = 'tibet help [command] [--generate] [--missing]';

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
 * @returns {Number} A return code.
 */
Cmd.prototype.execute = function() {

    var command,
        cmds,
        intro;

    // If specific command was given delegate to the command type.
    command = this.options._ && this.options._[1];
    if (command) {
        return this.executeForCommand(command);
    } else if (this.options._ && this.options._[0]) {
        //  When using 'tibet {cmd} --help' we rewrite such that
        //  you don't see two items in the command line, just the
        //  command to get help on.
        command = this.options._ && this.options._[0];
        if (command !== 'help') {
            return this.executeForCommand(command);
        }
    }

    //  If the missing flag is provided do a check for any commands which don't
    //  appear to have matching markdown help files.
    if (this.options.missing) {
        return this.executeMissingCheck();
    }

    //  Optionally we can be asked to generate documentation for the current
    //  context (lib or project).
    if (this.options.generate) {
        return this.executeGenerate();
    }


    this.info('\nUsage: tibet <command> <options>');

    // ---
    // Introduction
    // ---

    intro =
        '\nThe tibet command can invoke TIBET built-ins, custom commands,\n' +
        'tibet makefile.js targets, grunt targets, or gulp targets based\n' +
        'on your project configuration and your specific customizations.';

    this.info(intro);

    // ---
    // Built-ins
    // ---

    cmds = this.getCommands(__dirname);
    this.info('\n<command> built-ins include:\n');
    this.logCommands(cmds);

    // ---
    // Add-ons
    // ---

    if (CLI.inProject(Cmd) || CLI.inLibrary()) {
        cmds = this.getCommands(CLI.expandPath('~app_cmd'));
        if (cmds.length > 0) {
            this.info('\nProject <commands> include:\n');
            this.logCommands(cmds);
        }
    }

    if (CLI.isInitialized() || CLI.inLibrary()) {
        cmds = this.getMakeTargets();

        // Filter to remove any "private" targets the project doesn't want
        // shown via help.
        cmds = cmds.filter(function(name) {
            return name.indexOf('_') !== 0 && name.indexOf('$') !== 0;
        });

        if (cmds.length > 0) {
            this.info('\nmakefile.js targets include:\n');
            this.logCommands(cmds);
        }
    }

    // ---
    // Summary
    // ---

    this.info('\n<options> always include:\n');

    this.info('\t--help         display command help text');
    this.info('\t--usage        display command usage summary');
    this.info('\t--color        colorize the log output [true]');
    this.info('\t--verbose      work with verbose output [false]');
    this.info('\t--debug        turn on debugging output [false]');
    this.info('\t--stack        display stack with error [false]');

    this.info('\nConfigure default parameters via \'tibet config\'.');

    try {
        this.info('\n' + CLI.getcfg('npm.name') + '@' +
            CLI.getcfg('npm.version').split('+')[0] +
            ' ' + sh.which('tibet'));
    } catch (e) {
        //  empty
    }
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
        proc,
        viewer;

    if (command.charAt(0) === '_') {
        this.error('Help not available for private commands.');
        return 1;
    }

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
        htmldir = path.join(CLI.expandPath('~lib'), 'doc', 'html');
        list = sh.ls(htmldir);
        pattern = new RegExp('^' + command + '\\.' + '(\\d)\\.html');
        list.some(function(file) {
            if (pattern.test(file)) {
                htmlpath = file;
                return true;
            }
            return false;
        });

        if (htmlpath) {
            opener(path.join(htmldir, htmlpath));
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
    manpath = path.join(CLI.expandPath('~lib'), 'doc', 'man');
    env.MANPATH = manpath;

    if (CLI.inProject()) {
        manpath = path.join(CLI.expandPath('~'), 'doc', 'man');
        //  NOTE the addition on the front of the path here so project docs are
        //  first in the lookup order.
        env.MANPATH = manpath + ':' + env.MANPATH;
    }

    config = {
        env: env,
        stdio: 'inherit',
        stderr: 'inherit'
    };

    proc = require('child_process');
    child = proc.spawn('man', [
        CLI.getProjectName().toLowerCase() + '-' + command, 'tibet-' + command],
        config);
    child.on('close', function() {
        return 0;
    });

    return 0;
};


/**
 */
Cmd.prototype.executeGenerate = function() {
    var thisref,
        content,
        footer,
        genHtml,
        genMan,
        header,
        htmlpath,
        index,
        indexbody,
        indexpath,
        list,
        roottopic,
        options,
        splitter,
        manpath,
        rootpath,
        srcpath,
        version,
        year;

    thisref = this;

    //  Need to be at project root for nodecli to work properly.
    process.chdir(CLI.expandPath('~'));

    //  TODO:   clean existing doc target dir?
    //          log a message about cleansing documentation...

    this.log('building documentation...');

    //  ---
    //  Verify Directories
    //  ---

    rootpath = path.join(CLI.expandPath('~'), 'doc');
    srcpath = path.join(rootpath, 'markdown');

    if (!sh.test('-d', srcpath)) {
        throw new Error('Unable to find doc source directory.');
    }

    htmlpath = path.join(rootpath, 'html');
    if (!sh.test('-d', htmlpath)) {
        sh.mkdir(htmlpath);
    }

    manpath = path.join(rootpath, 'man');
    if (!sh.test('-d', manpath)) {
        sh.mkdir(manpath);
    }

    //  HTML generation uses common header/footer since output from the
    //  conversion process doesn't include html/body, just "content".
    header = sh.cat(path.join(rootpath, 'template', 'header.html'));
    header = hb.compile(header);
    footer = sh.cat(path.join(rootpath, 'template', 'footer.html'));
    footer = hb.compile(footer);

    //  ---
    //  Helpers
    //  ---

    genHtml = function(file, params) {
        var html,
            destdir,
            destfile,
            result,
            srcfile;

        srcfile = path.join(srcpath, file + '.tmp');

        //  Compute the HTML target file path, removing .md extension.
        destfile = path.join(htmlpath, file);
        destfile = destfile.slice(0, destfile.lastIndexOf('.')) + '.html';

        //  Compute target directory value and make sure it exists.
        destdir = destfile.slice(0, destfile.lastIndexOf('/'));
        if (!sh.test('-d', destdir)) {
            sh.mkdir(destdir);
        }

        result = nodecli.exec('marked-man', '--breaks', '--format html',
            srcfile, {silent: true});

        if (result.code !== 0) {
            //  TODO:   oops
            return;
        }

        html = header(params) + result.output + footer(params);

        //  One last substitution is to look for variations on 'foo(n)'
        //  and convert them into links which point to the target page.
        html = html.replace(/([-_a-zA-Z]+)\((\d+)\)/g,
        function(match, topic, section) {
            if (topic === params.topic) {
                return match;
            }

            return '<a class="crossref" href="./' + topic + '.' +
                section + '.html">' + topic + '(' + section + ')' + '</a>';
        });

        html.to(destfile);
    };

    genMan = function(file, params) {
        var man,
            destdir,
            destfile,
            result,
            srcfile;

        srcfile = path.join(srcpath, file + '.tmp');

        //  Compute the manpage target file path, removing .md extension.
        destfile = path.join(manpath, 'man' + params.section, file);
        destfile = destfile.slice(0, destfile.lastIndexOf('.'));

        //  Compute target directory value and make sure it exists.
        destdir = path.join(manpath, 'man' + params.section);
        if (!sh.test('-d', destdir)) {
            sh.mkdir(destdir);
        }

        result = nodecli.exec('marked-man', '--breaks', '--roff',
            srcfile, {silent: true});

        if (result.code !== 0) {
            //  TODO:   oops
            return;
        }

        man = result.output;
        man.to(destfile);
    };

    //  ---
    //  Process Files
    //  ---

    //  File names in markdown directory should be of the form
    //  topic.section.md so we can extract and splice.
    splitter = /^(.*)\.(\d)\.md$/;

    //  We splice in year and version for copyright etc. so capture once.
    year = new Date().getFullYear();
    version = CLI.inProject() ? CLI.cfg('npm.version') : CLI.cfg('tibet.version');

    //  Create an array we can keep the list of content in.
    index = [];

    //  Markdown directory should be flat but just in case do a recursive
    //  listing. We'll filter out directories in the loop.
    list = sh.ls('-R', srcpath);

    //  Process each file, producing both a man page and HTML document.
    list.forEach(function(file) {
        var parts,
            section,
            srcfile,
            template,
            tempfile,
            topic;

        //  Skip directories, just process individual files.
        srcfile = path.join(srcpath, file);
        if (sh.test('-d', srcfile)) {
            return;
        }

        //  Pull file name apart. Should be topic.section.md.
        parts = splitter.exec(file);
        if (!parts) {
            thisref.warn('Filename ' + file + ' missing topic or section.');
            return;
        }
        topic = parts[1];
        section = parts[2];

        options = {
            topic: topic,
            section: section,
            version: version,
            year: year
        };

        try {
            tempfile = srcfile + '.tmp';
            content = sh.cat(srcfile);
            template = hb.compile(content);
            content = template(options);
            content.to(tempfile);

            //  NOTE this depends on first line being the # {{topic}} line.
            options.firstline = content.split('\n')[0];
            index.push(JSON.parse(JSON.stringify(options)));

            genMan(file, options);
            genHtml(file, options);
        } catch (e) {
            thisref.error('Error processing ' + file + ': ' + e.message);
        } finally {
            sh.rm('-f', tempfile);
        }
    });

    //  ---
    //  index.html
    //  ---

    indexpath = path.join(htmlpath, 'index.html');

    roottopic = CLI.inProject() ? CLI.getProjectName() : 'TIBET';
    options = {
        topic: roottopic,
        section: 1,
        version: version,
        year: year
    };

    //  Sort alphabetically within sections.
    index.sort(function(paramA, paramB) {
        if (paramA.section < paramB.section) {
            return -1;
        } else if (paramA.section > paramB.section) {
            return 1;
        } else {
            if (paramA.topic < paramB.topic) {
                return -1;
            } else if (paramA.topic > paramB.topic) {
                return 1;
            } else {
                return 0;
            }
        }
    });

    //  Convert param form into markup. We use a DL to wrap below so we want
    //  each item returned here to be a dt/dd pair with a link to topic.
    indexbody = index.map(function(params) {
        var parts,
            str;

        parts = params.firstline.split('--');
        str = '<dt><a class="toc" href="./' +
            params.topic + '.' + params.section + '.html">' +
            parts[0] + '</a></dt><dd>-- ' + parts[1] + '</dd>';

        return str;
    });

    //  Assemble the final index.html page content by using the same
    //  header/footer as all other pages and our indexbody for content.
    (header(options) +
     '<dl class="toc">\n' +
     indexbody.join('<br/>') +
     '</dl>\n' +
     footer(options)).to(
        indexpath);

    //  ---
    //  manpage index
    //  ---

    //  TODO

    return;
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

    mans = sh.ls(path.join(CLI.expandPath('~lib'), 'doc/markdown')).map(function(name) {
        return name.slice(6, -5);
    });

    cmds = sh.ls(__dirname).filter(function(name) {
        return name.charAt(0) !== '_' && name.slice(-3) === '.js';
    }).map(function(name) {
        return name.slice(0, -3);
    });

    missing = cmds.filter(function(name) {
        return mans.indexOf(name) === -1;
    });

    missing.forEach(function(name) {
        thisref.info(name + ' (built-in command)');
    });

    //  ---
    //  Custom commands
    //  ---

    mans = sh.ls(path.join(CLI.expandPath('~'), 'doc/markdown')).map(function(name) {
        return name.slice(6, -5);
    });

    cmds = this.getCommands(CLI.expandPath('~app_cmd')).filter(function(name) {
        return name.charAt(0) !== '_';
    });

    missing = cmds.filter(function(name) {
        return mans.indexOf(name) === -1;
    });

    missing.forEach(function(name) {
        thisref.info(name + ' (project command)');
    });

    //  ---
    //  Makefile targets
    //  ---

    cmds = this.getMakeTargets().filter(function(name) {
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
        files.sort().forEach(function(file) {
            if (file.indexOf(CLI.MAKE_FILE) !== -1) {
                return;
            }

            if (file.charAt(0) !== '_' && /\.js$/.test(file)) {
                cmds.push(file.replace(/\.js$/, ''));
            }
        });
    }

    return cmds;
};


/**
 * Returns a list of custom make targets found in any TIBET-style `makefile` for
 * the current project.
 * @returns {Array.<string>} The list of targets.
 */
Cmd.prototype.getMakeTargets = function() {
    var targets,
        cmds;

    cmds = [];

    // Note that despite the name this isn't a list of targets in the form we're
    // looking for here. We want target names, this is a handle to the wrapper
    // object whose 'methods' define the targets.
    targets = CLI.getMakeTargets();
    if (!targets) {
        return cmds;
    }

    Object.keys(targets).forEach(function(target) {
        if (typeof targets[target] === 'function') {
            cmds.push(target);
        }
    });
    cmds.sort();

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
