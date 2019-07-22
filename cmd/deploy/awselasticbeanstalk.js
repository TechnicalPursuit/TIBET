/**
 * A 'tibet deploy' subcommand that encapsulates functionality to deploy a
 * Docker image of the application to the AWS Docker repository and to create
 * an AWS Elastic Beanstalk app running that Docker image.
 * This one is built to handle invocations of the TIBET CLI with a command line
 * of:
 * 'tibet deploy awselasticbeanstalk <environment>'.
 *
 * This subcommand expects the following fields, shown here as a set of
 * configuration parameters in the project's 'tds.json' file:
 *
        "deploy": {
            "awselasticbeanstalk": {
                "profile": "development",
                "region": "us-east-1",
                "appname": "TIBETAWSEBSTest"
            }
        }
 *
 * and as an inline parameter to the command, which is not placed in the
 * 'tds.json' file for obvious reasons:
 *
 *      tibet deploy awselasticbeanstalk '{"password":"passwordMyPassword"}'
 */

(function() {
    'use strict';

    var os,
        path,
        hb,

        CLI,
        sh,

        DOCKER_COMMAND,

        ZIP_COMMAND,

        AWS_COMMAND,
        AWS_CONFIG_PATH,
        AWS_CONFIG_FILE,

        DNA_ROOT;

    os = require('os');
    path = require('path');
    hb = require('handlebars');

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
     * The name of the zip executable we look for to confirm installation.
     * @type {string}
     */
    ZIP_COMMAND = 'zip';

    /**
     * The name of the Azure CLI executable we look for to confirm installation.
     * @type {string}
     */
    AWS_COMMAND = 'aws';

    /**
     * The
     * @type {string}
     */
    AWS_CONFIG_PATH = '.aws';
    AWS_CONFIG_FILE = 'credentials';

    /**
     * Where are the dna templates we should clone from? This value will be joined
     * with the current file's load path to create the absolute root path.
     * @type {string}
     */
    DNA_ROOT = 'src/tibet/cli/dna/deploy';

    module.exports = function(cmdType) {

        /**
         * Runs the awselasticbeanstalk subcommand, checking for
         * awselasticbeanstalk-related support.
         * @returns {Number} A return code.
         */
        cmdType.prototype.executeAwselasticbeanstalk = function() {
            var dockerpath,
                awstoolspath,
                awscfgpath,
                zippath;

            dockerpath = this.findDocker();
            if (!dockerpath) {
                return 0;
            }

            zippath = this.findZip();
            if (!zippath) {
                return 0;
            }

            awstoolspath = this.findAWSCLITools();
            if (!awstoolspath) {
                return 0;
            }

            //  We get the path to test it to make sure its available, but don't
            //  use it.
            awscfgpath = this.findAWSConfiguration();
            if (!awscfgpath) {
                return 0;
            }

            return this.runViaAwselasticbeanstalk(
                            dockerpath, awstoolspath, zippath);
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
         * Locates a workable zip binary if possible. This is checked by
         * looking for any globally accessible version (via 'which').
         * @returns {string} The path to the located zip executable.
         */
        cmdType.prototype.findZip = function() {
            var zippath;

            this.info('checking for zip support...');

            zippath = sh.which(ZIP_COMMAND);
            if (zippath) {
                this.info('found zip...');
                return zippath;
            }

            this.info('zip not installed');
            return;
        };

        /**
         * Locates a workable AWS CLI tools binary if possible.
         * @returns {string} The path to the located AWS CLI tools executable.
         */
        cmdType.prototype.findAWSCLITools = function() {
            var awsclipath;

            this.info('checking for Azure CLI tools support...');

            awsclipath = sh.which(AWS_COMMAND);
            if (awsclipath) {
                this.info('found Azure CLI tools...');
                return awsclipath;
            }

            this.info('AWS CLI tools not installed. See: ' +
                'https://docs.aws.amazon.com/cli/latest/userguide/' +
                'cli-chap-install.html');

            return;
        };

        /**
         * Locates an AWS configuration if possible. This is checked by looking
         * for a 'credentials' file in '~/.aws/' (via 'which').
         * @returns {string} The path to the credentials file.
         */
        cmdType.prototype.findAWSConfiguration = function() {
            var homedir,
                configpath;

            this.info('checking for an AWS configuration...');

            homedir = os.homedir();

            configpath = path.join(homedir, AWS_CONFIG_PATH, AWS_CONFIG_FILE);
            configpath = sh.which(configpath);

            if (configpath) {
                this.info('found AWS configuration file...');
                return configpath;
            }

            this.info('Cannot find AWS configuration file. See: ' +
                'https://docs.aws.amazon.com/cli/latest/userguide/' +
                'cli-chap-configure.html');

            return;
        };

        /**
         * Generates an AWS Elastic Beanstalk Dockerrun.aws.json file with the
         * information necessary to run our Dockerized application on Elastic
         * Beanstalk.
         * @param {object} paramdata A hash of parameter data to mix into the
         *     templates in the file.
         * @param {string} destpath The full path to the directory we want to
         *     place the file into.
         * @returns {string} The path to the credentials file.
         */
        cmdType.prototype.generateDockerrunFile = function(paramdata, destpath) {
            var file,
                data,
                template,
                fullpath,
                content;

            this.info('Generating Dockerrun in ' + destpath);

            file = path.join(CLI.getLibRoot(),
                                DNA_ROOT,
                                'Dockerrun.aws.json.hb');

            data = CLI.sh.cat(file);
            try {
                template = hb.compile(data);
                if (!template) {
                    throw new Error('InvalidTemplate');
                }
            } catch (e) {
                this.error('Error compiling template ' + file + ': ' +
                    e.message);
                return 1;
            }

            fullpath = path.join(destpath, 'Dockerrun.aws.json');

            try {
                content = template(paramdata);

                if (!content) {
                    throw new Error('InvalidContent');
                }
            } catch (e) {
                this.error('Error injecting template data in ' + fullpath +
                    ': ' + e.message);
                return 1;
            }

            content.to(fullpath);

            return fullpath;
        };

        /**
         * Runs the deploy by activating the Docker executable, building the
         * Docker image, deploying to the Azure Container Registry and then
         * provisioning and loading that Docker image into an Azure WebApp
         * @param {string} dockerpath The full path to the Docker executable.
         * @param {string} awstoolspath The full path to the AWS tools
         *     executable.
         * @param {string} zippath The full path to the 'zip' command
         *     executable.
         * @returns {Number} A return code.
         */
        cmdType.prototype.runViaAwselasticbeanstalk = async function(
                                            dockerpath, awstoolspath, zippath) {
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

                credentialsBuffer,
                credentialsData,

                containerRegistryUsername,
                containerRegistryPassword,

                containerRegistryInfoMatcher,
                containerRegistryInfo,

                tag,

                currentDir,
                infoFilePath,
                zippedInfoFile,

                infoBucketName;

            /* eslint-disable consistent-this */
            cmd = this;
            /* eslint-disable consistent-this */

            argv = this.getArglist();

            //  argv[0] is the main command name ('deploy')
            //  argv[1] is the subcommand name ('awselasticbeanstalk')
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

            cfgparams = CLI.cfg('tds.deploy.awselasticbeanstalk', null, true);
            if (!cfgparams) {
                cfgparams = {};
            } else {
                cfgparams = cfgparams.tds.deploy.awselasticbeanstalk;
            }

            params = CLI.blend({}, inlineparams);
            params = CLI.blend(params, cfgparams);

            params.projectname = params.projectname ||
                                    CLI.cfg('project.name');
            params.projectversion = params.projectversion ||
                                    CLI.cfg('npm.version');

            params.profile = params.profile || 'default';

            if (CLI.notValid(params.region)) {
                cmd.warn('Missing parameter: region');
                return 1;
            }

            if (CLI.notValid(params.appname)) {
                cmd.warn('Missing parameter: appname');
                return 1;
            }

            if (CLI.notValid(params.solutionstack)) {
                cmd.warn('Missing parameter: solutionstack');
                return 1;
            }

            //  ---
            //  Set the deployment region in the current AWS profile
            //  ---

            spawnArgs = [
                            'configure',
                            'set',
                            'default.region',
                            params.region
                        ];

            cmd.log('Setting region for profile: ' + params.profile);

            await CLI.spawnAsync(this, awstoolspath, spawnArgs);

            //  ---
            //  Grab the AWS Elastic Container Registry location, username and
            //  password
            //  ---

            spawnArgs = [
                            'ecr',
                            'get-authorization-token'
                        ];

            cmd.log('Getting AWS ECR credentials for profile: ' +
                    params.profile);

            credentialsCapturer = function(output) {
                credentialsStr = output;
            };

            await CLI.spawnAsync(this, awstoolspath, spawnArgs,
                                    credentialsCapturer);

            try {
                credentials = JSON.parse(credentialsStr);
            } catch (e) {
                cmd.error('Invalid container registry credentials JSON: ' +
                                                                e.message);
                return 1;
            }

            containerRegistryLocation =
                credentials.authorizationData[0].proxyEndpoint;

            //  Grab the returned token into a Buffer and base64 decode that.
            credentialsBuffer = new Buffer(
                    credentials.authorizationData[0].authorizationToken,
                    'base64');
            credentialsData = credentialsBuffer.toString('ascii');

            //  The AWS Elastic Container Registry username and password are
            //  colon (':') separated.
            credentialsData = credentialsData.split(':');
            containerRegistryUsername = credentialsData[0];
            containerRegistryPassword = credentialsData[1];

            //  ---
            //  Create an container image repository in the AWS Elastic
            //  Container Registry
            //  ---

            spawnArgs = [
                            'ecr',
                            'create-repository',
                            '--repository-name',
                            params.projectname
                        ];

            cmd.log('Creating ECR repository: ' + params.projectname);

            await CLI.spawnAsync(this, awstoolspath, spawnArgs);

            //  ---
            //  Compute Docker image tag
            //  ---

            containerRegistryInfoMatcher = /https:\/\/((\d+).+)/;

            //  Grab the container registry name and account ID by exec'ing a
            //  RegExp against the container registry location value.
            containerRegistryInfo = containerRegistryInfoMatcher.exec(
                                                    containerRegistryLocation);

            //  The registry name is matched as the first (outer) group.
            tag = containerRegistryInfo[1] +
                    '/' + params.projectname +
                    ':v.' + params.projectversion;

            //  ---
            //  Build and tag a Docker image
            //  ---

            spawnArgs = [
                            'build',
                            '-t',
                            tag,
                            '.'
                        ];

            cmd.log('Using Docker to build image & tag: ' + tag);

            await CLI.spawnAsync(this, dockerpath, spawnArgs);

            //  ---
            //  Log into AWS Elastic Container Registry
            //  ---

            spawnArgs = [
                            'login',
                            '-u',
                            containerRegistryUsername,
                            '-p',
                            containerRegistryPassword,
                            containerRegistryLocation
                        ];

            cmd.log('Logging into AWS Container Registry');

            await CLI.spawnAsync(this, dockerpath, spawnArgs);

            //  ---
            //  Push the Docker image to the AWS Elastic Container Registry
            //  ---

            spawnArgs = [
                            'push',
                            tag
                        ];

            cmd.log('Pushing Docker image tagged: ' + tag);

            await CLI.spawnAsync(this, dockerpath, spawnArgs);

            //  ---
            //  Construct a 'Dockerrun.aws.json' file with the proper
            //  parameters.
            //  ---

            cmd.log('Generating Dockerrun.aws.json file.');

            currentDir = sh.pwd();

            infoFilePath =
                this.generateDockerrunFile({
                    accountid: containerRegistryInfo[2],
                    region: params.region,
                    name: params.projectname,
                    version: params.projectversion
                }, currentDir);

            //  ---
            //  Create a zip with that file and the Dockerfile.
            //  ---

            zippedInfoFile = 'info.zip';

            spawnArgs = [
                            zippedInfoFile,
                            infoFilePath,
                            '-jq'           //  NB: For some reason, for the
                                            //  'zip' command, these have to be
                                            //  at the end of the command...
                        ];

            cmd.log('Zipping Elastic Beanstalk deployment files.');

            await CLI.spawnAsync(this, zippath, spawnArgs);

            //  ---
            //  Compute bucket name
            //  ---

            infoBucketName = 'docker-' +
                            params.projectname + '-' + params.projectversion;

            //  ---
            //  Create that bucket
            //  ---

            spawnArgs = [
                            's3api',
                            'create-bucket',
                            '--bucket',
                            infoBucketName,
                            '--region',
                            params.region
                        ];

            cmd.log('Creating S3 bucket: ' + infoBucketName);

            await CLI.spawnAsync(this, awstoolspath, spawnArgs);

            //  ---
            //  Upload that file to a specially named S3 bucket
            //  ---

            spawnArgs = [
                            's3',
                            'cp',
                            zippedInfoFile,
                            's3://' + infoBucketName + '/' +
                                params.projectversion + '.zip'
                        ];

            cmd.log('Uploading Dockerrun.aws.json.zip file to S3 bucket: ' +
                    infoBucketName);

            await CLI.spawnAsync(this, awstoolspath, spawnArgs);

            //  ---
            //  Create a new Elastic Beanstalk application
            //  ---

            spawnArgs = [
                            'elasticbeanstalk',
                            'create-application',
                            '--application-name',
                            params.appname
                        ];

            cmd.log('Creating a new application: ' + params.appname);

            await CLI.spawnAsync(this, awstoolspath, spawnArgs);

            //  ---
            //  Create a new Elastic Beanstalk application version
            //  ---

            spawnArgs = [
                            'elasticbeanstalk',
                            'create-application-version',
                            '--application-name',
                            params.appname,
                            '--version-label',
                            params.projectversion,
                            '--source-bundle',
                            'S3Bucket=' + infoBucketName + ',' +
                            'S3Key=' + params.projectversion + '.zip'
                        ];

            cmd.log('Creating a new application version');

            await CLI.spawnAsync(this, awstoolspath, spawnArgs);

            //  ---
            //  Create a new Elastic Beanstalk environment
            //  ---

            spawnArgs = [
                            'elasticbeanstalk',
                            'create-environment',
                            '--environment-name',
                            params.projectname,
                            '--application-name',
                            params.appname,
                            // '--cname-prefix',
                            // params.projectname,
                            '--version-label',
                            params.projectversion,
                            '--solution-stack-name',
                            params.solutionstack,
                            '--option-settings',
                            'Namespace=aws:autoscaling:launchconfiguration,' +
                            'OptionName=IamInstanceProfile,' +
                            'Value=aws-elasticbeanstalk-ec2-role'
                        ];

            cmd.log('Creating a new application environment: ' +
                    params.projectname);

            await CLI.spawnAsync(this, awstoolspath, spawnArgs);

            return;
        };
    };

}(this));
