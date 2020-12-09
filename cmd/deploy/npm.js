/**
 * A 'tibet deploy' subcommand that encapsulates functionality to deploy a
 * package of the application to the npm repository via the 'npm publish'
 * command.
 * This one is built to handle invocations of the TIBET CLI with a command line
 * of:
 * 'tibet deploy npm <environment>'.
 *
 * This subcommand expects the following fields, shown here as a set of
 * configuration parameters in the project's 'tds.json' file:
 *
 *      "deploy": {
 *          "npm": {
 *              "folder": "folderformyapp" (defaults to './'),
 *              "tarball": "tarballtopush" (defaults to null),
                "tag": "mytag" (defaults to null),
                "otp": "fde45de" (defaults to null)
 *          }
 *      }
 *
 * and/or as an inline parameter to the command, which here shows a parameter
 * that is not placed in the 'tds.json' file for obvious reasons:
 *
 *      tibet deploy npm '{"password":"passwordMyPassword"}'
 *
 * These parameter sets are combined to form the full parameter set.
 */

(function() {
    'use strict';

    var CLI,
        sh,

        NPM_COMMAND;

    CLI = require('../../src/tibet/cli/_cli');
    sh = require('shelljs');

    //  ---
    //  Instance Attributes
    //  ---

    /**
     * The name of the npm executable we look for to confirm installation.
     * @type {string}
     */
    NPM_COMMAND = 'npm';

    module.exports = function(cmdType) {

        /**
         * Runs the npm subcommand, checking for npm-related support.
         * @returns {Number} A return code.
         */
        cmdType.prototype.executeNpm = function() {
            var npmpath;

            npmpath = this.findNpm();
            if (!npmpath) {
                return 0;
            }

            return this.runViaNpm(npmpath);
        };

        /**
         * Locates a workable npm binary if possible. This is checked by
         * looking for any globally accessible version (via 'which').
         * @returns {string} The path to the located npm executable.
         */
        cmdType.prototype.findNpm = function() {
            var npmpath;

            this.info('checking for npm support...');

            npmpath = sh.which(NPM_COMMAND);
            if (npmpath) {
                this.info('found npm...');
                return npmpath.toString();
            }

            this.info('npm not installed');
            return;
        };

        /**
         * Runs the deploy by activating the npm executable, deploying to the
         *     npm public package registry.
         * @param {string} npmpath The full path to the npm executable.
         * @returns {Number} A return code.
         */
        cmdType.prototype.runViaNpm = async function(npmpath) {
            var cmd,

                inlineparams,
                cfgparams,
                params,

                branchCmd,
                branchResult,
                targetBranch,
                targetRegex,
                currentBranch,
                result,

                execArgs;

            /* eslint-disable consistent-this */
            cmd = this;
            /* eslint-disable consistent-this */

            //  Reparse to parse out the non-qualified and option parameters.
            cmd.reparse({
                boolean: ['dry-run'],
                default: {
                    'dry-run': false
                }
            });

            //  The cmd.options._ object holds non-qualified parameters.
            //  [0] is the main command name ('deploy')
            //  [1] is the subcommand name ('npm')
            //  [2] is an optional inline parameter JSON string with values

            inlineparams = cmd.options._[2];

            //  ---
            //  Compute parameters from mixing inline params and cfg-based
            //  params
            //  ---

            if (CLI.notValid(inlineparams)) {
                inlineparams = {};
            } else {
                try {
                    inlineparams = JSON.parse(inlineparams);
                } catch (e) {
                    cmd.error('Invalid inline param JSON: ' + e.message);
                    return 1;
                }
            }

            cfgparams = CLI.cfg('tds.deploy.npm', null, true);
            if (!cfgparams) {
                cfgparams = {};
            } else {
                cfgparams = cfgparams.tds.deploy.npm;
            }

            params = CLI.blend({}, inlineparams);
            params = CLI.blend(params, cfgparams);

            //  ---
            //  Make sure that, if the current branch isn't the same as the
            //  release target branch, that the user is ok with deploying the
            //  current branch.
            //  ---

            // Get current branch name...if detached this will be a commit hash.
            branchCmd = 'git rev-parse --abbrev-ref HEAD';
            branchResult = this.shexec(branchCmd);

            targetBranch = this.getcfg('cli.release.target', 'master');
            targetRegex = new RegExp('^\s*' + targetBranch + '\s*$');
            currentBranch = branchResult.stdout.trim();

            if (targetRegex.test(currentBranch) !== true && !this.options.force) {
                result = CLI.prompt.question(
                    'Current branch ' + currentBranch +
                    ' is not the same as the release target branch: ' +
                    targetBranch +
                    ' Release the current branch anyway?' +
                    ' Enter \'yes\': ');

                if (!/^y/i.test(result)) {
                    this.log('npm publish cancelled. Use --force to override');
                    return;
                }
            }

            //  ---
            //  Run 'npm publish' to publish
            //  ---

            params.folder = params.folder || './';

            execArgs = [
                            'publish',
                            params.folder
                        ];

            if (params.tarball) {
                //  The caller wanted the tarball, not the folder, so pop that
                //  argument.
                execArgs.pop();
                execArgs.push(params.tarball);
            }

            if (params.tag) {
                execArgs.push('--tag', params.tag);
            }

            if (params.opt) {
                execArgs.push('--opt', params.opt);
            }

            cmd.log('Publishing to npm');

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + npmpath + ' ' + execArgs.join(' '));
            } else {
                await CLI.execAsync(this, npmpath, execArgs);
            }
        };
    };

}(this));
