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
        "deploy": {
            "azurewebapps": {
                "username": "bedney@technicalpursuit.com",
                "resourcegroupname": "TIBETAzureTestResourceGroup",
                "resourcegrouplocation": "Central US",
                "containerregistryname": "TIBETAzureTestContainerRegistry",
                "containerregistrysku": "Basic",
                "appserviceplanname": "TIBETAzureTestPlan",
                "appservicesku": "B1",
                "appname": "TIBETAzureTest"
            }
        }
 *
 * and as an inline parameter to the command, which is not placed in the
 * 'tds.json' file for obvious reasons:
 *
 *      tibet deploy azurewebapps '{"password":"passwordMyPassword"}'
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
                return dockerpath;
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
                return azureclipath;
            }

            this.info('Azure CLI tools not installed. See: ' +
                'https://docs.microsoft.com/en-us/cli/azure/install-azure-cli');

            return;
        };

        /**
         * Runs the deploy by activating the Docker executable, building the
         * Docker image, deploying to the Azure Container Registry and then
         * provisioning and loading that Docker image into an Azure WebApp
         * @returns {Number} A return code.
         */
        cmdType.prototype.runViaAzurewebapps = async function(
                                                dockerpath, azuretoolspath) {
            var cmd,
                argv,

                inlineparams,
                cfgparams,
                params,

                spawnArgs,

                credentialsCapturer,
                credentialsStr,
                credentials,

                containerRegistryLocation,
                containerRegistryPassword,

                tag;

            /* eslint-disable consistent-this */
            cmd = this;
            /* eslint-disable consistent-this */

            argv = this.getArglist();

            //  argv[0] is the main command name ('deploy')
            //  argv[1] is the subcommand name ('azurewebapps')
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

            //  ---
            //  Log into Azure
            //  ---

            spawnArgs = [
                            'login',
                            '-u',
                            params.username,
                            '-p',
                            params.password
                        ];

            cmd.log('Logging into Azure');

            await CLI.spawnAsync(this, azuretoolspath, spawnArgs);

            //  ---
            //  Create a resource group on Azure
            //  ---

            spawnArgs = [
                            'group',
                            'create',
                            '--name',
                            params.resourcegroupname,
                            '--location',
                            params.resourcegrouplocation
                        ];

            cmd.log('Creating a resource group on Azure');

            await CLI.spawnAsync(this, azuretoolspath, spawnArgs);

            //  ---
            //  Create a container registry on Azure
            //  ---

            spawnArgs = [
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

            await CLI.spawnAsync(this, azuretoolspath, spawnArgs);

            //  ---
            //  Compute a container registry location
            //  ---

            containerRegistryLocation = params.containerregistryname +
                                        '.azurecr.io';

            //  ---
            //  Obtain the credentials for the container registry
            //  ---

            spawnArgs = [
                            'acr',
                            'credential',
                            'show',
                            '--name',
                            params.containerregistryname
                        ];

            cmd.log('Obtaining the credentials for the container registry' +
                    ' on Azure');

            credentialsCapturer = function(output) {
                credentialsStr = output;
            };

            await CLI.spawnAsync(this, azuretoolspath, spawnArgs,
                                    credentialsCapturer);

            try {
                credentials = JSON.parse(credentialsStr);
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

            spawnArgs = [
                            'login',
                            '--username',
                            params.containerregistryname,
                            '--password',
                            containerRegistryPassword,
                            containerRegistryLocation
                        ];

            cmd.log('Logging into Azure Container Registry');

            await CLI.spawnAsync(this, dockerpath, spawnArgs);

            //  ---
            //  Build and tag a Docker image
            //  ---

            tag = containerRegistryLocation +
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
            //  Push the Docker image to the Azure Container Registry
            //  ---

            spawnArgs = [
                            'push',
                            tag
                        ];

            cmd.log('Pushing Docker image tagged: ' + tag);

            await CLI.spawnAsync(this, dockerpath, spawnArgs);

            //  ---
            //  Create an app service plan
            //  ---

            spawnArgs = [
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

            await CLI.spawnAsync(this, azuretoolspath, spawnArgs);

            //  ---
            //  Create a webapp
            //  ---

            spawnArgs = [
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

            await CLI.spawnAsync(this, azuretoolspath, spawnArgs);

            //  ---
            //  Configure registry credentials in web app
            //  ---

            spawnArgs = [
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

            cmd.log('Configuring the webapp with registry credentials on Azure');

            await CLI.spawnAsync(this, azuretoolspath, spawnArgs);

            //  ---
            //  Configure environment variables in web app
            //  ---

            spawnArgs = [
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

            cmd.log('Configuring the webapp with environment variables on Azure');

            await CLI.spawnAsync(this, azuretoolspath, spawnArgs);
        };
    };

}(this));
