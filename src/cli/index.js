/**
 * @overview TIBET command-line processor. Individual command files do the work
 *     specific to each command. The logic here is focused on initial command
 *     identification and command file loading/activation.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-Approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

//  ---------------------------------------------------------------------------

/**
 * The Command Line object. This object is fairly simply. It parses a command
 * line to determine if there's a viable command name present. If the command
 * name can be identified it tries to load a file with that name from the local
 * directory to process the command. If the command name or file cannot be found
 * then an appropriate error is reported.
 */
var CLI = {};

CLI.run = function() {

  /**
   * The hash of options after parsing.
   * @type Object
   */
  var argv;

  /**
   * The command being requested. This must ultimately match one of the known
   * command names.
   * @type string
   */
  var command;

  /**
   * The command handler, the module responsible for processing a command.
   * @type Object
   */
  var handler;

  /**
   * The node-optimist instance used for command-line argument parsing.
   * @type Object
   */
  var opt;

  /**
   * The command line arguments minus the original $0 data and command string.
   * @type Array
   */
  var rest;

  //  ---
  //  Process the command-line arguments to find the command name.
  //  ---

  opt = require('optimist');
  argv = opt.argv;
  command = argv._[0];

  // Note that we could inject a more REPL-based approach here in the future.
  if (!command) {
    console.log('Usage: tibet {command} [arguments]');
    process.exit(1);
  }

  // Trim off the $0 portion (node, bin/tibet) and the command name.
  rest = process.argv.slice(2).filter(function(item) {
    return item !== command;
  });

  //  ---
  //  Dispatch the command (if found).
  //  ---

  try {
    handler = require('./' + command);
  } catch (e) {
    console.log('Unrecognized command: ' + command);
    process.exit(1);
  }

  // Note we pass along the trimmed argument list. The command will parse that.
  handler.run(rest);
};

//  ---------------------------------------------------------------------------

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = CLI;
  }
  exports.CLI = CLI;
} else {
  root.CLI = CLI;
}

}(this));
