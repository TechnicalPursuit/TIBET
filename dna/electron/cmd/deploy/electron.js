/**
 * A 'tibet deploy' subcommand that encapsulates functionality to deploy a
 * an electron-builder built image of the application to an S3 bucket.
 * This one is built to handle invocations of the TIBET CLI with a command line
 * of:
 * 'tibet deploy electron <environment>'.
 *
 * This subcommand expects the following fields, shown here as a set of
 * configuration parameters in the project's 'tibet.json' file:
 *
 *      "deploy": {
 *          "electron": {
 *              "projectname": "myproject" (defaults to project.name),
 *              "projectversion": "0.1.0" (defaults to project.version),
 *              "updateURL": "https://myUpdateURL" (not used here - bound into app image by build process),
 *              "distdir": "aDistDir", (defaults to 'dist')
 *              "channel": "beta", (defaults to 'latest')
 *              "notarize": true, (defaults to true)
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

                msg,

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

            if (CLI.notValid(params.notarize)) {
                params.notarize = cmd.options.notarize;
            }

            //  ---
            //  Determine provider
            //  ---

            cmd.log('Determining provider');

            provider = CLI.cfg('deploy.electron.provider', null, true);

            switch (provider) {
                case 's3':
                    providerparamsname = 's3';
                    break;
                case 'github':
                    providerparamsname = 'github';
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

            switch (provider) {
                case 's3':
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

                    if (CLI.isEmpty(process.env.AWS_ACCESS_KEY_ID)) {
                        msg = 'No AWS key ID. $ export AWS_ACCESS_KEY_ID="{awsaccesskeyid}"';
                        throw new Error(msg);
                    }

                    if (CLI.isEmpty(process.env.AWS_SECRET_ACCESS_KEY)) {
                        msg = 'No AWS key ID. $ export AWS_SECRET_ACCESS_KEY="{awssecretaccesskey}"';
                        throw new Error(msg);
                    }

                    break;
                case 'github':
                    cmd.log('Provider is GitHub');

                    providerparams = cfgparams[providerparamsname];

                    if (!providerparams) {
                        providerparams = {};
                    }

                    if (CLI.notValid(providerparams.token)) {
                        cmd.warn('Missing parameter: token');
                        return 1;
                    }

                    publisherInfo.token = providerparams.token;

                    break;
                default:
                    cmd.error('No provider supplied');
                    return 1;
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
                if (process.platform === 'darwin' &&
                    params.notarize === true) {
                    cmd.log('Mac image. Notarizing...');

                    if (cmd.options['dry-run']) {
                        cmd.log('DRY RUN: notarizing with' +
                                ' path: ' + distPath +
                                ' project name: ' + projectName);
                    } else {
                            await this.notarizeMac(distPath, projectName);
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

                //  Throw this 'up' to report it.
                throw err;
            }
        };

        cmdType.prototype.notarizeMac = function(distPath, projectName) {

            var msg,

                appleId,
                appleIdPassword,

                configPath,
                packConfig,

                appPath,
                promise;

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

            promise = Promise.resolve();

            //  First, check to see if we have a Mac universal binary. If so,
            //  queue up a notarization.
            appPath =
                CLI.joinPaths(distPath, 'mac-universal', projectName) + '.app';
            if (CLI.sh.test('-e', appPath)) {
                promise = promise.then(function() {
                        return Notarizer.notarize({
                            appBundleId: packConfig.appId,
                            appPath: appPath,
                            appleId: appleId,
                            appleIdPassword: appleIdPassword
                        });
                });
            }

            //  Then do the same for a Mac ARM64 binary.
            appPath =
                CLI.joinPaths(distPath, 'mac-arm64', projectName) + '.app';
            if (CLI.sh.test('-e', appPath)) {
                promise = promise.then(function() {
                        return Notarizer.notarize({
                            appBundleId: packConfig.appId,
                            appPath: appPath,
                            appleId: appleId,
                            appleIdPassword: appleIdPassword
                        });
                });
            }

            //  Then do the same for a Mac x64 binary.
            appPath =
                CLI.joinPaths(distPath, 'mac', projectName) + '.app';
            if (CLI.sh.test('-e', appPath)) {
                promise = promise.then(function() {
                            return Notarizer.notarize({
                                appBundleId: packConfig.appId,
                                            appPath: appPath,
                                appleId: appleId,
                                appleIdPassword: appleIdPassword
                            });
                });
            }

            return promise;
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
