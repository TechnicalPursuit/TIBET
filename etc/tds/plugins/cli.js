/**
 * @overview Functionality specific to integrating the TDS with the TIBET CLI.
 *     This is normally disabled but when enabled it allows the Sherpa to access
 *     commands in the TIBET CLI to create new tags and perform other tasks.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    //  ---
    //  TIBET CLI Middleware
    //  ---

    /**
     * Processes command execution requests by passing the argument list to the
     * TIBET command. This option is disabled by default and must be
     * specifically activated. Also note that only valid `tibet` command line
     * options can be executed in this fashion, not general commands.
     *
     * You can test whether it works by using URLs of the form:
     *
     * url = TP.uc('~/_tds/cli?cmd=echo&arg0=fluff&testing=123');
     *
     * Run the command by forcing a call to the server for the URL:
     *
     * url.save();
     *
     * Or, if you are in the TSH, you can execute:
     *
     * :cli echo fluff --testing=123
     *
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            localDev,
            logger,
            meta,
            TDS;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        TDS = app.TDS;

        localDev = options.localDev;
        logger = options.logger;

        meta = {type: 'tds', name: 'cli'};
        logger.info('Loading plugin.', meta);

        //  Ensure we have default option slotting for this plugin.
        options.tds_cli = options.tds_cli || {};

        //  ---
        //  Middleware
        //  ---

        TDS.cli = function(req, res, next) {

            var cli,    // Spawned child process for the server.
                cmd,    // The command being requested.
                params, // Named argument collector.
                child;  // child process module.

            cmd = req.query.cmd;
            if (!cmd) {
                cmd = 'help';
            }

            logger.debug('Received: ' + req.url, meta);

            params = [cmd];

            Object.keys(req.query).forEach(
                    function(key) {
                        var value;

                        if (key === 'cmd') {
                            return;    // skip
                        } else {
                            value = req.query[key];

                            //  We don't add the key if its one of arg*
                            //  arguments. Its value will get added below.
                            if (!/arg/.test(key)) {
                                params.push('--' + key);
                            }

                            //  We don't add the value if it is null, undefined,
                            //  true, the empty string or if the key equals the
                            //  value (like a good XML shell, TSH will duplicate
                            //  the key name as the value for Boolean flags:
                            //  --no-color="no-color").
                            if (value !== null &&
                                value !== undefined &&
                                value !== true &&
                                value !== '' &&
                                value !== key) {

                                params.push(value);
                            }
                        }
                    });

            //  notify the CLI that we're coming in from a remote developer
            //  connection, not the standard terminal interface.
            params.push('--remotedev');

            //  force no-color - we don't need color escape codes sent to the
            //  browser.
            params.push('--no-color');

            logger.debug('Running: ' + params, meta);

            child = require('child_process');
            cli = child.spawn('tibet', params);

            cli.stdout.pipe(res);
            cli.stderr.pipe(res);

            return;
        };

        //  ---
        //  Routes
        //  ---

        app.post(TDS.cfg('tds.cli.uri'), localDev,
            options.parsers.json, TDS.cli);
    };

}(this));

