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
            TDS,
            WebSocket,
            evaluate;

        app = options.app;
        TDS = app.TDS;

        localDev = options.localDev;
        logger = options.logger;

        //  Ensure we have default option slotting for this plugin.
        options.tds_cli = options.tds_cli || {};

        //  Create and configure a socket that waits for the first call to
        //  connect and configure its listeners.
        WebSocket = require('faye-websocket');


        //  ---
        //  Middleware
        //  ---

        evaluate = function(cmd, socket) {

            var cli,    // Spawned child process for the server.
                parts,  // Split arguments from the command.
                query,  // Hash of arguments from the command.
                params, // Named argument collector.
                child;  // child process module.

            //  TODO: sanity check for non-alphanumeric 'command line'. no
            //  escape codes, no '..' in paths, etc.

            logger.debug('Received: ' + cmd);

            query = {};

            parts = cmd.split('&');
            params = [];
            parts.forEach(function(part) {
                var chunks;

                chunks = part.split('=');
                if (chunks[0] === 'cmd') {
                    params.push(chunks[1]);
                } else {
                    query[chunks[0]] = TDS.unquote(chunks[1]);
                }
            });

            Object.keys(query).forEach(
                    function(key) {
                        var value;

                        value = query[key];

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
                    });

            //  notify the CLI that we're coming in from a remote developer
            //  connection, not the standard terminal interface.
            params.push('--remotedev');

            //  force no-color - we don't need color escape codes sent to the
            //  browser.
            params.push('--no-color');

            socket.send('evaluating: ' + params);

            child = require('child_process');
            cli = child.spawn('tibet', params);

            cli.stdout.on('data', function(data) {
                socket.send('' + data);
            });

            cli.stderr.on('data', function(data) {
                var msg;

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

                socket.send(msg);
            });

            cli.on('close', function(code) {
                var msg;

                if (code !== 0) {
                    msg = 'Execution stopped with status: ' + code;
                    logger.error(msg);
                    socket.send(msg);
                }
            });

            return;
        };


        TDS.cli = function(req, res, next) {

            if (TDS.cli.hasRun) {
                res.status(200).end();
                return;
            }

            TDS.cli.hasRun = true;

            //  NOTE since the cli route is protected by localDev filter we
            //  don't even configure the server to accept a socket request
            //  without having first authenticated as a local developer.
            TDS.httpServer.on('upgrade', function(request, socket, body) {
                var cliSocket;

                if (WebSocket.isWebSocket(request)) {

                    cliSocket = new WebSocket(request, socket, body,
                        ['tibet-cli']);

                    cliSocket.on('open', function() {
                        logger.info(cliSocket.protocol + ' socket created');
                        cliSocket.send(
                            cliSocket.protocol + ' connection accepted');
                    });

                    cliSocket.on('message', function(event) {
                        evaluate(event.data, cliSocket);
                    });

                    cliSocket.on('error', function(err) {
                        logger.info('socket error:', err);
                    });

                    cliSocket.on('close', function(event) {
                        logger.info('socket close: ', event.code, event.reason);
                    });
                }
            });

            res.status(200).end();
        };


        //  ---
        //  Routes
        //  ---

        app.post(TDS.cfg('tds.cli.uri'), localDev,
            options.parsers.json, TDS.cli);
    };

}(this));

