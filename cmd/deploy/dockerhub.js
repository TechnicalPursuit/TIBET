/**
 * A 'tibet deploy' subcommand that encapsulates functionality to deploy a
 * Docker image of the application to the DockerHub repository.
 * This one is built to handle invocations of the TIBET CLI with a command line
 * of:
 * 'tibet deploy dockerhub <environment>'.
 *
 * This subcommand expects the following fields, shown here as a set of
 * configuration parameters in the project's 'tds.json' file:
 *
        "deploy": {
            "dockerhub": {
                "username": "bedney",
                "account": "technicalpursuit"
            }
        }
 *
 * and as an inline parameter to the command, which is not placed in the
 * 'tds.json' file for obvious reasons:
 *
 *      tibet deploy dockerhub '{"password":"passwordMyPassword"}'
 */

(function() {
    'use strict';

    var CLI,
        sh,

        DOCKER_COMMAND;

    CLI = require('../../src/tibet/cli/_cli');
    sh = require('shelljs');

    //  ---
    //  Instance Attributes
    //  ---

    /**
     * The name of the Docker executable we look for to confirm installation.
     * @type {string}
     */
    DOCKER_COMMAND = 'docker';

    module.exports = function(cmdType) {

        /**
         * Runs the dockerhub subcommand, checking for dockerhub-related
         * support.
         * @returns {Number} A return code.
         */
        cmdType.prototype.executeDockerhub = function() {
            var dockerpath;

            dockerpath = this.findDocker();
            if (!dockerpath) {
                return 0;
            }

            return this.runViaDocker(dockerpath);
        };

        /**
         * Locates a workable Docker binary if possible. This is checked by
         * looking for any globally accessible version (via 'which').
         * @returns {string} The path to the located Docker executable.
         */
        cmdType.prototype.findDocker = function() {
            var dockerpath;

            this.info('checking for docker support...');

            dockerpath = sh.which(DOCKER_COMMAND);
            if (dockerpath) {
                this.info('found Docker...');
                return dockerpath;
            }

            this.info('Docker not installed');
            return;
        };

        /**
         * Runs the deploy by activating the Docker executable, building the
         * Docker image and then deploying to the DockerHub container registry.
         * @param {string} dockerpath The full path to the Docker executable.
         * @returns {Number} A return code.
         */
        cmdType.prototype.runViaDocker = async function(dockerpath) {
            var cmd,
                argv,

                inlineparams,
                cfgparams,
                params,

                spawnArgs,
                tag;

            /* eslint-disable consistent-this */
            cmd = this;
            /* eslint-disable consistent-this */

            argv = this.getArglist();

            //  argv[0] is the main command name ('deploy')
            //  argv[1] is the subcommand name ('dockerhub')
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

            cfgparams = CLI.cfg('tds.deploy.dockerhub', null, true);
            if (!cfgparams) {
                cfgparams = {};
            } else {
                cfgparams = cfgparams.tds.deploy.dockerhub;
            }

            params = CLI.blend({}, inlineparams);
            params = CLI.blend(params, cfgparams);

            params.projectname = params.projectname ||
                                    CLI.cfg('project.name');
            params.projectversion = params.projectversion ||
                                    CLI.cfg('npm.version');

            if (CLI.notValid(params.username)) {
                cmd.warn('Missing parameter: username');
                return 1;
            }

            if (CLI.notValid(params.password)) {
                cmd.warn('Missing parameter: password');
                return 1;
            }

            if (CLI.notValid(params.account)) {
                cmd.warn('Missing parameter: account');
                return 1;
            }

            //  ---
            //  Log into DockerHub
            //  ---

            spawnArgs = [
                            'login',
                            '--username',
                            params.username,
                            '--password',
                            params.password,
                            'docker.io'
                        ];

            cmd.log('Logging into DockerHub');

            await CLI.spawnAsync(this, dockerpath, spawnArgs);

            //  ---
            //  Build and tag a Docker image
            //  ---

            tag = params.account +
                    '/' + params.projectname +
                    ':v.' + params.projectversion;

            spawnArgs = [
                            'build',
                            '-t',
                            tag,
                            '.'
                        ];

            cmd.log('Using Docker to build image & tag: ' + tag);

            await CLI.spawnAsync(this, dockerpath, spawnArgs);

            //  ---
            //  Push the Docker image to DockerHub
            //  ---

            spawnArgs = [
                            'push',
                            tag
                        ];

            cmd.log('Pushing Docker image tagged: ' + tag);

            await CLI.spawnAsync(this, dockerpath, spawnArgs);
        };
    };

}(this));
