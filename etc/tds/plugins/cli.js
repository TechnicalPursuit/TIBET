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
     * options can be executed in this fashion, not general commands. Further,
     * you can only execute this from the local machine in development mode.
     *
     * You can test whether it works by using URLs of the form:
     *
     * url = TP.uc('~/_tds/cli?cmd=echo&arg0=fluff&testing=123');
     *
     * Run the command by forcing a call to the server for the URL:
     *
     * url.httpPost().then(function(result) { TP.info(result) });
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
            TDS;

        app = options.app;
        TDS = app.TDS;

        localDev = options.localDev;
        logger = options.logger;

        //  Ensure we have default option slotting for this plugin.
        options.tds_cli = options.tds_cli || {};

        //  ---
        //  Middleware
        //  ---

        TDS.cli = function(req, res, next) {

            var cli,    // Spawned child process for the server.
                cmd,    // The command being requested.
                params, // Named argument collector.
                child,  // child process module.
                datastr,
                errstr;

            cmd = req.query.cmd;
            if (!cmd) {
                cmd = 'help';
            }

            logger.debug('Received: ' + req.url);

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

            logger.debug('Running: ' + params);

            child = require('child_process');
            cli = child.spawn('tibet', params);

            cli.stdout.on('data', function(data) {
                var msg;

                if (TDS.isValid(data)) {
                    datastr = (datastr || '') + data;
                }
            });

            cli.stderr.on('data', function(data) {

                if (TDS.notValid(data)) {
                    msg = 'Unspecified error occurred.';
                } else {
                    // Copy and remove newline.
                    msg = data.slice(0, -1).toString('utf-8');
                }

                // Some leveraged module likes to write error output with empty
                // lines. Remove those so we can control the output form better.
                if (msg && typeof msg.trim === 'function' &&
                        msg.trim().length === 0) {
                    return;
                }

                errstr = (errstr || '') + msg;
            });

            cli.on('close', function(code) {

                if (code !== 0) {
                    msg = 'Execution stopped with status: ' + code;
                    logger.error(msg);
                    res.status(500).send(msg);
                } else {
                    res.status(200).send(datastr);
                }

                res.end();
            });

            return;
        };

        //  ---
        //  Routes
        //  ---

        app.post(TDS.cfg('tds.cli.uri'), localDev,
            options.parsers.json, TDS.cli);
    };

}(this));

