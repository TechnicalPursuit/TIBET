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
 *      "deploy": {
 *          "dockerhub": {
 *              "username": "bedney",
 *              "account": "technicalpursuit",
 *              "projectname": "myproject" (defaults to project.name),
 *              "projectversion": "0.1.0" (defaults to project.version),
 *              "nodockercache": "true" (defaults to false),
 *              "dockerfile": "Dockerfile_SPECIAL" (defaults to 'Dockerfile'),
 *              "extra_tag_entries": [["technicalpursuit/myproject:latest"],["technicalpursuit/myproject:footag"]] (defaults to []),
 *              "extra_push_entries": ["technicalpursuit/myproject:footag"] (defaults to [])
 *          }
 *      }
 *
 * and/or as an inline parameter to the command, which here shows a parameter
 * that is not placed in the 'tds.json' file:
 *
 *      tibet deploy dockerhub '{"foo":"bar"}'
 *
 * These parameter sets are combined to form the full parameter set.
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
                return dockerpath.toString();
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

                inlineparams,
                cfgparams,
                params,

                branchCmd,
                branchResult,
                targetBranch,
                targetRegex,
                currentBranch,
                result,

                execArgs,
                tag,

                sourceTag,
                targetTag,

                i,
                entry;

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
            //  [1] is the subcommand name ('dockerhub')
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

            if (CLI.notValid(params.account)) {
                cmd.warn('Missing parameter: account');
                return 1;
            }

            //  ---
            //  Make sure that we prompt the user to be logged into Dockerhub.
            //  ---

            result = CLI.prompt.question(
                'Make sure that you are logged into "Dockerhub" before' +
                ' proceeding. Proceed?' +
                ' Enter \'yes\': ');
            if (!/^y/i.test(result)) {
                this.log('Dockerhub deploy cancelled.');
                return;
            }

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
            //  Build and tag a Docker image
            //  ---

            tag = params.account +
                    '/' + params.projectname +
                    ':' + params.projectversion;

            execArgs = [
                            'build'
                        ];

            if (CLI.isTrue(params.nodockercache)) {
                execArgs.push('--no-cache');
            }

            if (CLI.notEmpty(params.dockerfile)) {
                execArgs.push('-f', params.dockerfile);
            }

            execArgs.push('-t', tag, '.');

            cmd.log('Using Docker to build image & tag: ' + tag);

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + dockerpath + ' ' + execArgs.join(' '));
            } else {
                await CLI.execAsync(this, dockerpath, execArgs);
            }

            //  ---
            //  Push the Docker image to DockerHub
            //  ---

            execArgs = [
                            'push',
                            tag
                        ];

            cmd.log('Pushing Docker image tagged: ' + tag);

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + dockerpath + ' ' + execArgs.join(' '));
            } else {
                await CLI.execAsync(this, dockerpath, execArgs);
            }

            //  ---
            //  Tag any 'extra tag entries'
            //  ---

            if (CLI.notEmpty(params.extra_tag_entries)) {
                for (i = 0; i < params.extra_tag_entries.length; i++) {
                    entry = params.extra_tag_entries[i];
                    sourceTag = entry[0];
                    targetTag = entry[1];

                    cmd.log('Tagging Docker image: ' + entry);

                    execArgs = [
                                    'tag',
                                    sourceTag,
                                    targetTag
                                ];

                    if (cmd.options['dry-run']) {
                        cmd.log('DRY RUN: ' + dockerpath + ' ' + execArgs.join(' '));
                    } else {
                        await CLI.execAsync(this, dockerpath, execArgs);
                    }
                }
            }

            if (CLI.notEmpty(params.extra_push_entries)) {
                for (i = 0; i < params.extra_push_entries.length; i++) {
                    entry = params.extra_push_entries[i];
                    cmd.log('Pushing Docker image: ' + entry);

                    execArgs = [
                                    'push',
                                    entry
                                ];

                    if (cmd.options['dry-run']) {
                        cmd.log('DRY RUN: ' + dockerpath + ' ' + execArgs.join(' '));
                    } else {
                        await CLI.execAsync(this, dockerpath, execArgs);
                    }
                }
            }
        };
    };

}(this));
