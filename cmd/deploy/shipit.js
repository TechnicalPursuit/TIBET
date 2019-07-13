/**
 * A 'tibet deploy' subcommand that encapsulates functionality for the popular
 * JavaScript-based 'Shipit!' tool. This one is built to handle invocations of
 * the TIBET CLI with a command line of:
 * 'tibet deploy shipit <shipit_environment>'.
 */

(function() {
    'use strict';

    var CLI,
        path,
        sh,

        SHIPIT_COMMAND,
        SHIPIT_FILE,
        SHIPIT_ROOT;

    CLI = require('../../src/tibet/cli/_cli');
    path = require('path');
    sh = require('shelljs');

    //  ---
    //  Instance Attributes
    //  ---

    /**
     * The name of the Shipit executable we look for to confirm installation.
     * @type {string}
     */
    SHIPIT_COMMAND = 'shipit';

    /**
     * The name of the Shipit configuration file used to confirm that Shipit has
     * been enabled for the current project.
     * @type {string}
     */
    SHIPIT_FILE = 'shipitfile.js';

    /**
     * For locally installed versions where should we look? A typical 'which'
     * command won't find locally installed binaries and we want to scan first.
     * @type {string}
     */
    SHIPIT_ROOT = 'node_modules/shipit-cli/bin';

    module.exports = function(cmdType) {

        /**
         * Runs the shipit subcommand, checking for shipit-related support.
         * @returns {Number} A return code.
         */
        cmdType.prototype.executeShipit = function() {
            var shipitpath;

            shipitpath = this.findShipit();
            if (!shipitpath) {
                return 0;
            }

            return this.runViaShipit(shipitpath);
        };

        /**
         * Locates a workable shipit binary if possible. The project is checked
         * first, followed by any globally accessible (via 'which') version.
         * @returns {string} The path to the located shipit executable.
         */
        cmdType.prototype.findShipit = function() {
            var shipitpath;

            this.info('checking for shipit support...');

            shipitpath = path.join(CLI.getAppHead(),
                                    SHIPIT_ROOT,
                                    SHIPIT_COMMAND);
            if (sh.test('-e', shipitpath)) {
                this.info('found project-specific shipit...');
                return shipitpath;
            }

            shipitpath = sh.which(SHIPIT_COMMAND);
            if (shipitpath) {
                this.info('found shipit...');
                return shipitpath;
            }

            this.info('shipit not installed');
            return;
        };

        /**
         * Runs the deploy by activating the Shipit executable.
         * @returns {Number} A return code.
         */
        cmdType.prototype.runViaShipit = function(shipitpath) {
            var cmd,
                proc,
                child,
                argv,
                params,
                envname;

            cmd = this;
            argv = this.getArgv();

            //  NOTE argv[0] is the command name ('tibet'), argv[1] is the main
            //  command name ('deploy') and argv[2] is the subcommand name
            //  ('shipit')
            envname = argv[2];

            proc = require('child_process');

            params = [];

            params[0] = envname;
            params[1] = argv.indexOf('--rollback') === -1 ?
                        'deploy' :
                        'rollback';

            if (envname) {
                this.warn('Delegating to \'shipit ' + envname + ' ' +
                            params[1] + '\'');
            } else {
                this.error('No shipit environment specified.');
                return 1;
            }

            child = proc.spawn(shipitpath, params);

            child.stdout.on('data', function(data) {
                var msg;

                if (CLI.isValid(data)) {
                    // Copy and remove newline.
                    msg = data.slice(0, -1).toString('utf-8');

                    cmd.log(msg);
                }
            });

            child.stderr.on('data', function(data) {
                var msg;

                if (CLI.notValid(data)) {
                    msg = 'Unspecified error occurred.';
                } else {
                    // Copy and remove newline.
                    msg = data.slice(0, -1).toString('utf-8');
                }

                //  Some leveraged module likes to write error output with empty
                //  lines. Remove those so we can control the output form
                //  better.
                if (msg &&
                    typeof msg.trim === 'function' &&
                    msg.trim().length === 0) {
                    return;
                }

                //  A lot of errors will include what appears to be a common
                //  'header' output message from events.js:72 etc. which
                //  provides no useful data but clogs up the output. Filter
                //  those messages.
                if (/throw er;/.test(msg)) {
                    return;
                }

                cmd.error(msg);
            });

            child.on('exit', function(code) {
                var msg;

                if (code !== 0) {
                    msg = 'Execution stopped with status: ' + code;
                    if (!cmd.options.debug || !cmd.options.verbose) {
                        msg += ' Retry with --debug --verbose for more' +
                                ' information.';
                    }
                    cmd.error(msg);
                }

                /* eslint-disable no-process-exit */
                process.exit(code);
                /* eslint-enable no-process-exit */
            });
        };

    };

}(this));
