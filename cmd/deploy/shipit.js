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
        fs,

        SHIPIT_COMMAND,
        SHIPIT_FILE,
        SHIPIT_ROOT;

    CLI = require('../../src/tibet/cli/_cli');
    path = require('path');
    sh = require('shelljs');
    fs = require('fs');

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
            var foundexe,
                foundfile,

                shipitpath,
                shipitfilepath;

            foundexe = false;
            foundfile = false;

            this.info('checking for shipit support...');

            shipitpath = path.join(CLI.getAppHead(),
                                    SHIPIT_ROOT,
                                    SHIPIT_COMMAND);
            if (sh.test('-e', shipitpath)) {
                this.info('found project-specific shipit...');
                foundexe = true;
            } else {
                shipitpath = sh.which(SHIPIT_COMMAND);
                if (shipitpath) {
                    this.info('found shipit...');
                    foundexe = true;
                }
            }

            shipitfilepath = path.join(CLI.getAppHead(),
                                        SHIPIT_FILE);

            if (!fs.existsSync(shipitfilepath)) {
                this.info('no shipitfile.js found in project...');
            } else {
                foundfile = true;
                this.info('found shipitfile.js in project...');
            }

            if (!foundexe || !foundfile) {
                this.info('shipit not ready');
                return null;
            }

            return shipitpath;
        };

        /**
         * Runs the deploy by activating the Shipit executable.
         * @returns {Number} A return code.
         */
        cmdType.prototype.runViaShipit = async function(shipitpath) {
            var cmd,
                argv,

                inlineparams,
                cfgparams,
                params,

                spawnArgs;

            /* eslint-disable consistent-this */
            cmd = this;
            /* eslint-disable consistent-this */

            argv = this.getArglist();

            //  argv[0] is the main command name ('deploy')
            //  argv[1] is the subcommand name ('shipit')
            //  argv[2] is an optional inline parameter JSON string with values
            //  specific to the command

            //  ---
            //  Compute parameters from mixing inline params and cfg-based
            //  params
            //  ---

            inlineparams = argv[2];

            //  NB: The getArglist call above will also hand us '--flag'-type
            //  arguments (they will be last). If the inline JSON wasn't
            //  specified, we don't want to process any of those.
            if (CLI.notValid(inlineparams) || inlineparams.startsWith('--')) {
                inlineparams = {};
            } else {
                try {
                    inlineparams = JSON.parse(inlineparams);
                } catch (e) {
                    cmd.error('Invalid inline param JSON: ' + e.message);
                    return 1;
                }
            }

            cfgparams = CLI.cfg('tds.deploy.shipit', null, true);
            if (!cfgparams) {
                cfgparams = {};
            } else {
                cfgparams = cfgparams.tds.deploy.shipit;
            }

            params = CLI.blend({}, inlineparams);
            params = CLI.blend(params, cfgparams);

            params.environment = params.environment || CLI.getEnv();
            params.rollback = params.rollback || false;

            spawnArgs = [];

            spawnArgs[0] = params.environment;
            spawnArgs[1] = CLI.isTrue(params.rollback) ? 'rollback' : 'deploy';

            if (spawnArgs[0]) {
                cmd.warn('Delegating to \'shipit ' + spawnArgs[0] + ' ' +
                            spawnArgs[1] + '\'');
            } else {
                cmd.error('No shipit environment specified.');
                return 1;
            }

            //  ---
            //  Run ShipIt command
            //  ---

            await CLI.spawnAsync(this, shipitpath, spawnArgs);
        };
    };

}(this));
