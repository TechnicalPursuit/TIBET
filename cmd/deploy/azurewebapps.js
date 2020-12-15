/**
 * A 'tibet deploy' subcommand that encapsulates functionality to deploy a
 * Docker image of the application to the Azure Docker repository and to create
 * an Azure WebApp running that Docker image.
 * This one is built to handle invocations of the TIBET CLI with a command line
 * of:
 * 'tibet deploy azurewebapps <environment>'.
 *
 * This subcommand expects the following fields, shown here as a set of
 * configuration parameters in the project's 'tds.json' file:
 *
 *      "deploy": {
 *          "azurewebapps": {
 *              "projectname": "myproject" (defaults to project.name),
 *              "projectversion": "0.1.0" (defaults to project.version),
 *              "resourcegroupname": "TIBETAzureTestResourceGroup",
 *              "resourcegrouplocation": "Central US",
 *              "containerregistryname": "TIBETAzureTestContainerRegistry",
 *              "containerregistrysku": "Basic",
 *              "appserviceplanname": "TIBETAzureTestPlan",
 *              "appservicesku": "B1",
 *              "appname": "TIBETAzureTest",
 *              "nodockercache": "true" (defaults to false),
 *              "dockerfile": "Dockerfile_SPECIAL" (defaults to 'Dockerfile')
 *          }
 *      }
 *
 * and/or as an inline parameter to the command, which here shows a parameter
 * that is not placed in the 'tds.json' file:
 *
 *      tibet deploy azurewebapps '{"nodockercache": true}'
 *
 * These parameter sets are combined to form the full parameter set.
 */

(function() {
    'use strict';

    var CLI,
        sh,

        DOCKER_COMMAND,

        AZURE_COMMAND;

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

    /**
     * The name of the Azure CLI executable we look for to confirm installation.
     * @type {string}
     */
    AZURE_COMMAND = 'az';

    module.exports = function(cmdType) {

        /**
         * Runs the azurewebapps command, checking for azurewebapps-related
         * support.
         * @returns {Number} A return code.
         */
        cmdType.prototype.executeAzurewebapps = function() {
            var dockerpath,
                azuretoolspath;

            dockerpath = this.findDocker();
            if (!dockerpath) {
                return 0;
            }

            azuretoolspath = this.findAzureCLITools();
            if (!azuretoolspath) {
                return 0;
            }

            return this.runViaAzurewebapps(dockerpath, azuretoolspath);
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
         * Locates a workable Azure CLI tools binary if possible.
         * @returns {string} The path to the located Azure CLI tools executable.
         */
        cmdType.prototype.findAzureCLITools = function() {
            var azureclipath;

            this.info('checking for Azure CLI tools support...');

            azureclipath = sh.which(AZURE_COMMAND);
            if (azureclipath) {
                this.info('found Azure CLI tools...');
                return azureclipath.toString();
            }

            this.info('Azure CLI tools not installed. See: ' +
                'https://docs.microsoft.com/en-us/cli/azure/install-azure-cli');

            return;
        };

        /**
         * Runs the deploy by activating the Docker executable, building the
         * Docker image, deploying to the Azure Container Registry and then
         * provisioning and loading that Docker image into an Azure WebApp
         * @param {string} dockerpath The full path to the Docker executable.
         * @param {string} azuretoolspath The full path to the Azure tools
         *     executable.
         * @returns {Number} A return code.
         */
        cmdType.prototype.runViaAzurewebapps = async function(
                                                dockerpath, azuretoolspath) {
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

                azureInfoUserName,

                execArgs,

                stdoutCapturer,
                stdoutStr,
                stderrCapturer,
                stderrStr,

                isGitProject,

                credentials,

                containerRegistryLocation,
                containerRegistryPassword,

                tag;

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
            //  [1] is the subcommand name ('azurewebapps')
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

            cfgparams = CLI.cfg('tds.deploy.azurewebapps', null, true);
            if (!cfgparams) {
                cfgparams = {};
            } else {
                cfgparams = cfgparams.tds.deploy.azurewebapps;
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

            if (CLI.notValid(params.resourcegroupname)) {
                cmd.warn('Missing parameter: resourcegroupname');
                return 1;
            }

            if (CLI.notValid(params.resourcegrouplocation)) {
                cmd.warn('Missing parameter: resourcegrouplocation');
                return 1;
            }

            if (CLI.notValid(params.containerregistryname)) {
                cmd.warn('Missing parameter: containerregistryname');
                return 1;
            }

            if (CLI.notValid(params.containerregistrysku)) {
                cmd.warn('Missing parameter: containerregistrysku');
                return 1;
            }

            if (CLI.notValid(params.appserviceplanname)) {
                cmd.warn('Missing parameter: appserviceplanname');
                return 1;
            }

            if (CLI.notValid(params.appservicesku)) {
                cmd.warn('Missing parameter: appservicesku');
                return 1;
            }

            if (CLI.notValid(params.appname)) {
                cmd.warn('Missing parameter: appname');
                return 1;
            }

            stdoutCapturer = function(output) {
                stdoutStr = output;
            };

            stderrCapturer = function(output) {
                stderrStr = output;
            };

            //  ---
            //  Make sure that, if the current branch isn't the same as the
            //  release target branch, that the user is ok with deploying the
            //  current branch.
            //  ---

            isGitProject = true;

            // Get current branch name...if detached this will be a commit hash.
            branchCmd = 'git rev-parse --abbrev-ref HEAD';
            try {
                branchResult = this.shexec(branchCmd);
            } catch (e) {
                if (/fatal: not a git repository/.test(e.message)) {
                    isGitProject = false;
                } else {
                    cmd.error(e.message);
                    return 1;
                }
            }

            if (isGitProject) {
                targetBranch = this.getcfg('cli.release.target', 'master');
                targetRegex = new RegExp('^\s*' + targetBranch + '\s*$');
                currentBranch = branchResult.stdout.trim();

                if (targetRegex.test(currentBranch) !== true &&
                    !this.options.force) {
                    result = CLI.prompt.question(
                        'Current branch ' + currentBranch +
                        ' is not the same as the release target branch: ' +
                        targetBranch +
                        ' Release the current branch anyway?' +
                        ' Enter \'yes\': ');

                    if (!/^y/i.test(result)) {
                        this.log(
                            'npm publish cancelled. Use --force to override');
                        return;
                    }
                }
            }

            //  ---
            //  Make sure we're logged into Azure
            //  ---

            execArgs = [
                            'account',
                            'list',
                            '--refresh'
                        ];

            cmd.log('Ensuring we\'re logged into Azure');

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + azuretoolspath + ' ' + execArgs.join(' '));
                stdoutStr = '[{"user": {"name": "bedney@technicalpursuit.com", "type": "user"}}]';
            } else {
                await CLI.execAsync(this, azuretoolspath, execArgs, false,
                                    stdoutCapturer, stderrCapturer);
            }

            if (/Please run "az login"/.test(stderrStr)) {
                cmd.warn('Not logged into Azure' +
                            ' - please run "az login"' +
                            ' - aborting');
                return;
            }

            try {
                azureInfoUserName = JSON.parse(stdoutStr)[0].user.name;
            } catch (e) {
                cmd.error('Invalid user info JSON: ' + e.message);
                return 1;
            }

            if (azureInfoUserName !== params.username) {
                cmd.warn('supplied username: "' + params.username +
                            '" does not match Azure username: "' +
                            azureInfoUserName +
                            '" - aborting');
            }

            //  ---
            //  Create a resource group on Azure
            //  ---

            execArgs = [
                            'group',
                            'create',
                            '--name',
                            params.resourcegroupname,
                            '--location',
                            params.resourcegrouplocation
                        ];

            cmd.log('Creating a resource group on Azure');

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + azuretoolspath + ' ' + execArgs.join(' '));
            } else {
                await CLI.execAsync(this, azuretoolspath, execArgs);
            }

            //  ---
            //  Create a container registry on Azure
            //  ---

            execArgs = [
                            'acr',
                            'create',
                            '--name',
                            params.containerregistryname,
                            '--resource-group',
                            params.resourcegroupname,
                            '--sku',
                            params.containerregistrysku,
                            '--admin-enabled',
                            'true'
                        ];

            cmd.log('Creating a container registry on Azure');

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + azuretoolspath + ' ' + execArgs.join(' '));
            } else {
                await CLI.execAsync(this, azuretoolspath, execArgs);
            }

            //  ---
            //  Compute a container registry location
            //  ---

            containerRegistryLocation = params.containerregistryname +
                                        '.azurecr.io';

            //  ---
            //  Obtain the credentials for the container registry
            //  ---

            execArgs = [
                            'acr',
                            'credential',
                            'show',
                            '--name',
                            params.containerregistryname
                        ];

            cmd.log('Obtaining the credentials for the container registry' +
                    ' on Azure');

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + azuretoolspath + ' ' + execArgs.join(' '));
                stdoutStr = '{"passwords": [{"name": "password","value": "J0h3TsVwIXuNv3TMvNE=UI+7P1h7qd=i"},{"name": "password2","value": "ofiFwlkn4P9bjaKKy8dfRJttU=nMmA/f"}], "username": "TIBETAzureTestContainerRegistry"}';
            } else {
                await CLI.execAsync(this, azuretoolspath, execArgs, false,
                                    stdoutCapturer);
            }

            try {
                credentials = JSON.parse(stdoutStr);
            } catch (e) {
                cmd.error('Invalid container registry credentials JSON: ' +
                                                                e.message);
                return 1;
            }

            //  ---
            //  Compute a container registry password
            //  ---

            containerRegistryPassword = credentials.passwords[0].value;

            //  ---
            //  Log into Azure Container Registry.
            //  ---

            execArgs = [
                            'login',
                            '--username',
                            params.containerregistryname,
                            '--password',
                            containerRegistryPassword,
                            containerRegistryLocation
                        ];

            cmd.log('Logging into Azure Container Registry');

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + dockerpath + ' ' + execArgs.join(' '));
            } else {
                await CLI.execAsync(this, dockerpath, execArgs);
            }

            //  ---
            //  Build and tag a Docker image
            //  ---

            tag = containerRegistryLocation +
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
            //  Push the Docker image to the Azure Container Registry
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
            //  Create an app service plan
            //  ---

            execArgs = [
                            'appservice',
                            'plan',
                            'create',
                            '--name',
                            params.appserviceplanname,
                            '--resource-group',
                            params.resourcegroupname,
                            '--sku',
                            params.appservicesku,
                            '--is-linux'
                        ];

            cmd.log('Creating an app service plan on Azure');

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + azuretoolspath + ' ' + execArgs.join(' '));
            } else {
                await CLI.execAsync(this, azuretoolspath, execArgs);
            }

            //  ---
            //  Create a webapp
            //  ---

            execArgs = [
                            'webapp',
                            'create',
                            '--resource-group',
                            params.resourcegroupname,
                            '--plan',
                            params.appserviceplanname,
                            '--name',
                            params.appname,
                            '--deployment-container-image-name',
                            tag
                        ];

            cmd.log('Creating a webapp on Azure');

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + azuretoolspath + ' ' + execArgs.join(' '));
            } else {
                await CLI.execAsync(this, azuretoolspath, execArgs);
            }

            //  ---
            //  Configure registry credentials in web app
            //  ---

            execArgs = [
                            'webapp',
                            'config',
                            'container',
                            'set',
                            '--name',
                            params.appname,
                            '--resource-group',
                            params.resourcegroupname,
                            '--docker-custom-image-name',
                            tag,
                            '--docker-registry-server-url',
                            'https://' + containerRegistryLocation,
                            '--docker-registry-server-user',
                            params.containerregistryname,
                            '--docker-registry-server-password',
                            containerRegistryPassword
                        ];

            cmd.log('Configuring the webapp with registry credentials on' +
                    ' Azure');

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + azuretoolspath + ' ' + execArgs.join(' '));
            } else {
                await CLI.execAsync(this, azuretoolspath, execArgs);
            }

            //  ---
            //  Configure environment variables in web app
            //  ---

            execArgs = [
                            'webapp',
                            'config',
                            'appsettings',
                            'set',
                            '--name',
                            params.appname,
                            '--resource-group',
                            params.resourcegroupname,
                            '--settings',
                            'WEBSITES_PORT=1407'
                        ];

            cmd.log('Configuring the webapp with environment variables on' +
                    ' Azure');

            if (cmd.options['dry-run']) {
                cmd.log('DRY RUN: ' + azuretoolspath + ' ' + execArgs.join(' '));
            } else {
                await CLI.execAsync(this, azuretoolspath, execArgs);
            }

        };
    };

}(this));
