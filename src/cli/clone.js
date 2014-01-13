/**
 * @overview The command logic for the 'tibet clone' command.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */


/*
 * TODO:  Add search for {{libroot}} (node_modules) etc. etc. and inject that
 * as part of templating. We need to have certain locations (css paths,
 * index.html paths to boot code) know where the root of the TIBET lib is.
 *
 * TODO: Take any/all additional parameters and make them part of the injected
 * data object. Basically allow arbitrary params to be matched to custom
 * templates.
 *
 * TODO: Add colors.js support.
 *
 * TODO: Silent except when --verbose is on.
 *
 * TODO: Debugging output based on --debug being set.
 */


;(function(root) {

//  ---------------------------------------------------------------------------

var Cmd = {};

Cmd.DNA_ROOT = '../../../dna/';
Cmd.USAGE = 'tibet clone {appname} [--dna {template}]';

/**
 * Runs the specific command in question.
 * @param {Array.<string>} args The argument array from the command line.
 */
Cmd.run = function(args) {

  var appname;  // The application name we're creating via clone.
  var argv;     // The hash of options after parsing.
  var code = 0; // Result code. Set if an error occurs in nested callbacks.
  var dna = this.DNA_ROOT + 'default'; // The dna template we're using.
  var err;      // Error string returned by shelljs.error() test function.
  var find;     // The finder module used to traverse and process files.
  var finder;   // The find event emitter we'll handle find events on.
  var fs;       // File system access handle.
  var hb;       // The handlebars engine used to inject data into dna files.
  var path;     // Path utilities from nodejs.
  var sh;       // The shelljs instance we'll use for cloning dna.
  var target;   // The target directory name (based on appname).

  //  ---
  //  Parse command-specific arguments.
  //  ---

  argv = require('optimist').parse(args);
  appname = argv._[0];

  // Have to get at least one non-option argument (the new appname).
  if (!appname) {
    console.log('Usage: ' + this.USAGE);
    process.exit(1);
  }

  path = require('path');
  sh = require('shelljs');

  //  ---
  //  Confirm the DNA selection.
  //  ---

  if (argv.dna) {
    dna = this.DNA_ROOT + argv.dna;
  }

  // Adjust for current module load path.
  dna = path.join(module.filename, dna);

  if (argv.verbose) {
    console.log('Checking for dna existence: ' + dna);
  }

  if (!sh.test('-e', dna)) {
    console.log('DNA selection not found: ' + dna);
    process.exit(1);
  }

  //  ---
  //  Verify the target.
  //  ---

  target = process.cwd() + '/' + appname;
  if (argv.verbose) {
    console.log('Checking for pre-existing target: ' + target);
  }

  if (sh.test('-e', target)) {
    console.log('Target already exists: ' + target);
    process.exit(1);
  }

  //  ---
  //  Clone to the target directory.
  //  ---

  // ShellJS doesn't quite follow UNIX convention here. We need to mkdir first
  // and then copy the contents of our dna into that target directory to clone.
  sh.mkdir(target);
  if (err = sh.error()) {
    console.log('Error creating target directory: ' + err);
    process.exit(1);
  }

  sh.cp('-R', dna + '/', target + '/');
  if (err = sh.error()) {
    console.log('Error cloning dna directory: ' + err);
    process.exit(1);
  }

  //  ---
  //  Process templated content to inject appname.
  //  ---

  find = require('findit');
  fs = require('fs');
  hb = require('handlebars');

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

    // Rename the file if it also has a name which matches our
    // appname that's templated.
    if (/__appname__/.test(file)) {
      sh.mv(file, file.replace(/__appname__/g, appname));
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
