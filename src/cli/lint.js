/**
 * @overview The command logic for the 'tibet lint' command.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

//  ---
//  Create command type.
//  ---

var parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new parent();

//  ---
//  Instance Attributes
//  ---


/**
 * The command usage string.
 * @type {string}
 */
Cmd.USAGE = 'tibet lint';


/**
 * Runs the specific command in question.
 */
Cmd.process = function() {

    var find;   // The findit module. Used to traverse and process files.
    var fs;     // The file access module.
    var hint;   // The jshint module.
    var path;   // The path utilities module.

    var argv;   // The hash of options after parsing.
    var code;   // Result code. Set if an error occurs in nested callbacks.
    var finder; // The find event emitter we'll handle find events on.

    var cmd = this; // Closure'd var for getting back to this command object.

    //  ---
    //  Parse command-specific arguments.
    //  ---

    argv = require('optimist').parse(args);

    //  ---
    //  ---

    find = require('findit');
    fs = require('fs');

    // TODO: minimatch for jshintignore processing

    // TODO: file ancestor traversal for jshintrc search

    // TODO: load config data if provided

    // TODO: support full descent and various termination options
    //    such as max errors, first error, etc.

    finder = find(target);

    // Ignore hidden directories and the node_modules directory.
    finder.on('directory', function(dir, stat, stop) {
        var base = path.basename(dir);
        if ((base.charAt(0) === '.') || (base === 'node_modules')) {
            stop();
        }
    });

    // Ignore links. (There shouldn't be any...but just in case.).
    finder.on('link', function(link, stat) {
        cmd.warn('Warning: ignoring link: ' + link);
    });

    finder.on('file', function(file, stat) {

        var content;  // File content after template injection.
        var data;     // File data.
        var template; // The compiled template content.

        cmd.verbose('Processing file: ' + file);
        try {
            data = fs.readFileSync(file, {encoding: 'utf8'});
        } catch (e) {
            cmd.error('Error reading file data: ' + e.message);
            code = 1;
            return;
        }

        //  ---
        //  Perform the lint process.
        //  ---

        //  ---
        //  Save as needed.
        //  ---

        if (data === content) {
            cmd.verbose('Ignoring static file: ' + file);
        } else {
            cmd.verbose('Updating file: ' + file);
            try {
                fs.writeFileSync(file, content);
            } catch (e) {
                cmd.error('Error writing file data: ' + e.message);
                code = 1;
                return;
            }
        }
    });

    finder.on('end', function() {
        process.exit(code);
    });

};

//  ---------------------------------------------------------------------------

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Cmd;
    }
    exports.Cmd = Cmd;
} else {
    root.Cmd = Cmd;
}

}(this));
