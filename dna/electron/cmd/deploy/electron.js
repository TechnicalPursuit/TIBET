/**
 * A 'tibet deploy' subcommand that encapsulates functionality to deploy a
 * an electron-builder built image of the application to an S3 bucket.
 * This one is built to handle invocations of the TIBET CLI with a command line
 * of:
 * 'tibet deploy electron <environment>'.
 *
 * This subcommand expects the following fields, shown here as a set of
 * configuration parameters in the project's 'tds.json' file:
 *
 *      "deploy": {
 *          "electron": {
 *              "projectname": "myproject" (defaults to project.name),
 *              "projectversion": "0.1.0" (defaults to project.version),
 *              "updateURL": "https://myUpdateURL" (not used here - bound into app image by build process),
 *              "distdir": "aDistDir", (defaults to 'dist')
 *              "channel": "beta", (defaults to 'latest')
 *              "provider": "s3",
 *              "s3": {
 *                  "bucket": "helloelectron",
 *                  "region": "us-east-1"
 *              }
 *          }
 *      }
 *
 * and/or as an inline parameter to the command, which here shows a parameter
 * that is not placed in the 'tds.json' file:
 *
 *      tibet deploy electron '{"foo":"bar"}'
 *
 * These parameter sets are combined to form the full parameter set.
 */

(function() {
    'use strict';

    var PublishManager,
        normalizeOptions,
        Packager,
        Notarizer;

    PublishManager =
        require('app-builder-lib/out/publish/PublishManager').PublishManager;
    normalizeOptions = require('electron-builder/out/builder').normalizeOptions;
    Packager = require('app-builder-lib/out/packager').Packager;
    Notarizer = require('electron-notarize');

    //  ---
    //  Instance Attributes
    //  ---

    module.exports = function(cmdType) {

        var CLI;

        CLI = cmdType.CLI;

        cmdType.prototype.executeElectron = async function() {

            var cmd,

                inlineparams,

                provider,

                providerparamsname,

                cfgparams,
                params,

                publisherInfo,
                options,

                providerparams,

                packager,
                publishManager,

                pathDir,
                distPath,
                projectName;

            /* eslint-disable consistent-this */
            cmd = this;
            /* eslint-disable consistent-this */

            //  Reparse to parse out the non-qualified and option parameters.
            cmd.reparse({
                boolean: ['dry-run', 'notarize'],
                default: {
                    'dry-run': false,
                    notarize: true
                }
            });

            //  The cmd.options._ object holds non-qualified parameters.
            //  [0] is the main command name ('deploy')
            //  [1] is the subcommand name ('electron')
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

            cfgparams = CLI.cfg('deploy.electron', null, true);

            if (!cfgparams) {
                cfgparams = {};
            } else {
                cfgparams = cfgparams.deploy.electron;
            }

            params = CLI.blend({}, inlineparams);
            params = CLI.blend(params, cfgparams);

            params.projectversion = params.projectversion ||
                                    CLI.cfg('npm.version');
            params.projectname = params.projectname ||
                                    CLI.cfg('project.name');

            params.distdir = params.distdir || './dist';
            params.channel = params.channel || 'latest';

            //  ---
            //  Determine provider
            //  ---

            cmd.log('Determining provider');

            provider = CLI.cfg('deploy.electron.provider', null, true);

            switch (provider) {
                case 's3':
                    providerparamsname = 's3';
                    break;
                default:
                    cmd.error('No provider defined');
                    return 1;
            }

            publisherInfo = {
                path: null,
                provider: provider,
                channel: params.channel
            };

            options = normalizeOptions({
                x64: true,
                windows: [],
                publish: 'always'
            });

            //  ---
            //  Parse provider parameters
            //  ---

            if (provider === 's3') {
                cmd.log('Provider is S3');

                providerparams = cfgparams[providerparamsname];

                if (!providerparams) {
                    providerparams = {};
                }

                if (CLI.notValid(providerparams.region)) {
                    cmd.warn('Missing parameter: region');
                    return 1;
                }

                if (CLI.notValid(providerparams.bucket)) {
                    cmd.warn('Missing parameter: bucket');
                    return 1;
                }

                publisherInfo.region = providerparams.region;
                publisherInfo.bucket = providerparams.bucket;
            }

            packager = new Packager(options);
            publishManager = new PublishManager(packager, options);

            pathDir = params.distdir;
            if (!pathDir.endsWith('/')) {
                pathDir = pathDir + '/';
            }

            distPath = CLI.joinPaths(CLI.getAppRoot(), pathDir);
            projectName = params.projectname;

            try {
                if (process.platform === 'darwin') {
                    cmd.log('Building for Mac image. Notarizing...');

                    if (cmd.options['dry-run']) {
                        cmd.log('DRY RUN: notarizing with' +
                                ' path: ' + distPath +
                                ' project name: ' + projectName);
                    } else {
                        if (cmd.options.notarize) {
                            await this.notarizeMac(distPath, projectName);
                        }
                    }
                }

                cmd.log('Uploading application images to provider...');
                if (cmd.options['dry-run']) {
                    cmd.log('DRY RUN: uploading with' +
                            ' path: ' + distPath +
                            ' project name: ' + projectName +
                            ' channel: ' + params.channel +
                            ' version: ' + params.projectversion);
                } else {
                await this.upload(publishManager, publisherInfo,
                            distPath, projectName,
                            params.channel, params.projectversion);
                }
            } catch (err) {
                packager.cancellationToken.cancel();
                publishManager.cancelTasks();
            }
        };

        cmdType.prototype.notarizeMac = function(distPath, projectName) {

            var msg,

                appleId,
                appleIdPassword,

                configPath,
                packConfig;

            appleId = process.env.APPLEID;
            if (CLI.isEmpty(appleId)) {
                msg = 'No Apple ID. $ export APPLEID="{appleid}"';
                throw new Error(msg);
            }

            appleIdPassword = process.env.APPLEIDPASS;
            if (CLI.isEmpty(appleIdPassword)) {
                msg = 'No Apple ID password. $ export APPLEIDPASS="{appleid}"';
                throw new Error(msg);
            }

            configPath = CLI.joinPaths(
                            CLI.expandPath('~app'),
                            'etc',
                            'electron-builder-config.json');

            packConfig = require(configPath);

            return Notarizer.notarize({
                appBundleId: packConfig.appId,
                appPath: CLI.joinPaths(distPath, 'mac', projectName) + '.app',
                appleId: appleId,
                appleIdPassword: appleIdPassword
            });
        };

        cmdType.prototype.upload = function(publishManager, publisherInfo,
                                                    distPath, projectName,
                                                    channel, version) {
            var distFiles,
                cfgFiles,

                artifacts,
                artifact;

            distFiles = CLI.sh.ls(distPath + projectName + '*');
            cfgFiles = CLI.sh.ls(distPath + channel + '*.yml');

            artifacts = distFiles.concat(cfgFiles);

            for (artifact of artifacts) {
                publishManager.scheduleUpload(
                    publisherInfo,
                    {
                        file: artifact,
                        arch: null
                    },
                    {
                        version: version,
                        buildNumber: undefined,
                        buildVersion: version
                    });
            }

            return publishManager.awaitTasks();
        };
    };

}(this));
