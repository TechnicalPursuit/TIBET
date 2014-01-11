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

//  ---------------------------------------------------------------------------

var Cmd = {};

Cmd.USAGE = 'Usage: tibet lint';

/**
 * Runs the specific command in question.
 * @param {Array.<string>} args The argument array from the command line.
 */
Cmd.run = function(args) {

  var argv;     // The hash of options after parsing.
  var code = 0; // Result code. Set if an error occurs in nested callbacks.
  var find;     // The finder module used to traverse and process files.
  var finder;   // The find event emitter we'll handle find events on.
  var fs;       // File system access handle.
  var hint;     // The handlebars engine used to inject data into dna files.
  var path;     // Path utilities from nodejs.

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
    console.log('Warning: ignoring link: ' + link);
  });

  finder.on('file', function(file, stat) {

    var content;  // File content after template injection.
    var data;     // File data.
    var template; // The compiled template content.

    if (argv.verbose) {
      console.log('Processing file: ' + file);
    }
    try {
      data = fs.readFileSync(file, {encoding: 'utf8'});
    } catch (e) {
      console.log('Error reading file data: ' + e.message);
      code = 1;
      return;
    }

    template = hb.compile(data);
    if (!template) {
      console.log('Error compiling template: ' + file);
      code = 1;
      return;
    }

    content = template({appname: appname});
    if (!content) {
      console.log('Error injecting template data.');
      code = 1;
      return;
    }

    if (data === content) {
      if (argv.verbose) {
        console.log('Ignoring static file: ' + file);
      }
    } else {
      if (argv.verbose) {
        console.log('Updating file: ' + file);
      }
      try {
        fs.writeFileSync(file, content);
      } catch (e) {
        console.log('Error writing file data: ' + e.message);
        code = 1;
        return;
      }
    }
  });

  finder.on('end', function() {
    //  ---
    //  Clean up our mess if we error'd out.
    //  ---
    if (code !== 0) {
      console.log('Cleaning up incomplete clone: ' + target);
      sh.rm('-rf', target);
    }

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
