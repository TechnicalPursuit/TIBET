/**
 * @overview The 'tibet clone' command. This command copies project 'dna' into
 *     a TIBET project directory, creating the directory if necessary. Files in
 *     the DNA containing handlebars templates are processed with an object
 *     containing the appname and any other argument values for the command.
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
 * The command execution context. Clone can only be done outside of a project.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.OUTSIDE;


/**
 * The default template to use from the DNA_ROOT location.
 * @type {string}
 */
Cmd.prototype.DNA_DEFAULT = 'default';


/**
 * Where are the dna templates we should clone from? This value will be joined
 * with the current file's load path to create the absolute root path.
 * @type {string}
 */
Cmd.prototype.DNA_ROOT = '../../../../dna/';


/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Clones a TIBET application template from a supplied \'dna\' directory.\n\n' +

'<dirname> is required and must be a valid directory name to clone to.\n' +
'By default the dirname will be the appname unless otherwise specified.\n'+
'You can use \'.\' to clone to the current directory. Existing files are\n'+
'ignored in such cases and you may need to merge/copy manually as needed.\n\n' +

'The optional --name parameter lets you rename from the directory name\n' +
'to an alternative name. This lets the directory and appname vary. This\n' +
'is common when cloning to existing directories or poorly named ones.\n\n' +

'The optional --dna parameter lets you clone any valid template in\n' +
'TIBET\'s `dna` directory or a directory of your choosing. This latter\n' +
'option lets you create your own reusable custom application templates.\n';

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet clone <dirname> [--name <appname>] [--dna <template>]';


//  ---
//  Instance Methods
//  ---

/**
 * Runs the specific command in question.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var fs;         // The file system module.
    var hb;         // The handlebars module. Used to inject data in dna files.
    var find;       // The findit module. Used to traverse and process files.
    var path;       // The path utilities module.
    var sh;         // The shelljs module. Used for cloning dna etc.

    var dirname;    // The directory we're cloning the template into.
    var appname;    // The application name we're creating via clone.
    var options;    // The hash of options after parsing.
    var code;       // Result code. Set if an error occurs in nested callbacks.
    var dna;        // The dna template we're using.
    var err;        // Error string returned by shelljs.error() test function.
    var ignore;     // List of extensions we'll ignore when templating.
    var finder;     // The find event emitter we'll handle find events on.
    var target;     // The target directory name (based on appname).
    var params;     // Parameter data for template processing.

    var cmd = this; // Closure'd var for getting back to this command object.

    ignore = ['.png', '.gif', '.jpg', '.ico', 'jpeg'];

    options = this.options;
    dirname = options._[1];    // Command is at 0, dirname should be [1].

    // Have to get at least one non-option argument (the target dirname).
    if (!dirname) {
        this.info('Usage: ' + this.USAGE);
        return 1;
    }

    path = require('path');
    sh = require('shelljs');

    //  ---
    //  Confirm the DNA
    //  ---

    if (options.dna) {

        // Try to resolve as an absolute reference.
        dna = options.dna;
        if (!sh.test('-e', dna)) {

            // Try to resolve as a relative reference.
            dna = path.join(process.cwd(), options.dna);
            if (!sh.test('-e', dna)) {

                // Try to resolve as pre-built library dna.
                dna = path.join(module.filename, this.DNA_ROOT, options.dna);
                if (!sh.test('-e', dna)) {
                    this.error('Unable to locate dna: ' + options.dna);
                    return 1;
                }
            }
        }
    } else {
        dna = path.join(module.filename, this.DNA_ROOT, this.DNA_DEFAULT);
        if (!sh.test('-e', dna)) {
            this.error('Default project dna not found: ' + dna);
            return 1;
        }
    }

    //  ---
    //  Verify the target.directory and application name.
    //  ---

    if (dirname === '.') {
        // Target will be our current directory, and we'll end up adjusting our
        // dirname to be whatever the current directory name is.
        target = process.cwd();
        appname = options.name || target.slice(target.lastIndexOf('/') + 1);
    } else {
        target = process.cwd() + '/' + dirname;
        this.verbose('Checking for pre-existing target: ' + target);

        if (sh.test('-e', target)) {
            this.error('Target already exists: ' + target);
            return 1;
        }
        appname = options.name || dirname;
    }

    //  ---
    //  Clone to the target directory.
    //  ---

    if (target !== process.cwd()) {
        // ShellJS doesn't quite follow UNIX convention here. We need to mkdir first
        // and then copy the contents of dna into that target directory to clone.
        sh.mkdir(target);
        err = sh.error();
        if (err) {
            this.error('Error creating target directory: ' + err);
            return 1;
        }
    }

    sh.cp('-R', dna + '/', target + '/');
    err = sh.error();
    if (err) {
        this.error('Error cloning dna directory: ' + err);
        return 1;
    }

    params = CLI.blend({appname: appname, dna: dna}, options);

    //  ---
    //  Process templated content to inject appname.
    //  ---

    find = require('findit');
    fs = require('fs');
    hb = require('handlebars');

    finder = find(target);
    code = 0;

    // Ignore hidden directories and the node_modules directory.
    finder.on('directory', function(dir, stat, stop) {
        var base = path.basename(dir);
        if ((base.charAt(0) === '.') || (base === 'node_modules')) {
            stop();
        }
    });

    // Ignore links. (There shouldn't be any...but just in case.).
    finder.on('link', function(link) {
        cmd.warn('Warning: ignoring link: ' + link);
    });

    finder.on('file', function(file) {

        var content;  // File content after template injection.
        var data;     // File data.
        var template; // The compiled template content.

        if (ignore.indexOf(path.extname(file)) === -1) {

            cmd.verbose('Processing file: ' + file);
            try {
                data = fs.readFileSync(file, {encoding: 'utf8'});
                if (!data) {
                    throw new Error('NoData');
                }
            } catch (e) {
                cmd.error('Error reading file data: ' + e.message);
                code = 1;
                return;
            }

            try {
                template = hb.compile(data);
                if (!template) {
                    throw new Error('InvalidTemplate');
                }
            } catch (e) {
                cmd.error('Error compiling template ' + file + ': ' +
                    e.message);
                code = 1;
                return;
            }

            try {
                content = template(params);
                if (!content) {
                    throw new Error('InvalidContent');
                }
            } catch (e) {
                cmd.error('Error injecting template data in ' + file +
                    ': ' + e.message);
                code = 1;
                return;
            }

            if (data === content) {
                cmd.verbose('Ignoring static file: ' + file);
            } else {
                cmd.verbose('Updating file: ' + file);
                try {
                    fs.writeFileSync(file, content);
                } catch (e) {
                    cmd.error('Error writing file ' + file + ': ' + e.message);
                    code = 1;
                    return;
                }
            }
        }

        // Rename the file if it also has a name which matches our
        // appname that's templated.
        try {
            if (/__appname__/.test(file)) {
                sh.mv(file, file.replace(/__appname__/g, appname));
            }
        } catch (e) {
            cmd.error('Error renaming template ' + file + ': ' + e.message);
            code = 1;
            return;
        }
    });

    finder.on('end', function() {
        if (code === 0) {
            cmd.info('TIBET dna \'' + path.basename(dna) + '\' cloned to ' +
                dirname + ' as app \'' + appname + '\'.');
        }
    });
};

module.exports = Cmd;

}());
