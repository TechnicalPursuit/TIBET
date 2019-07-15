/**
 * @overview Functionality specific to integrating the TDS with the TIBET CLI.
 *     This is normally disabled but when enabled it allows a local developer
 *     running the Sherpa to access commands in the TIBET CLI to create new tags
 *     and perform other development tasks.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Processes command execution requests by passing the argument list to the
     * `tibet` command. This plugin is disabled by default and must be
     * specifically activated. Even with activation the socket listener will
     * only be active after initial access from a local (same host) developer.
     * Also note that only valid `tibet` command line options can be executed in
     * this fashion, not general commands.
     *
     * From a locally launched Sherpa command line you can test this via:
     *
     * :cli echo fluffy --testing=123
     *
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            localDev,
            logger,
            meta,
            TDS,
            commands,
            clean,
            ip,
            WebSocket,
            evaluate;

        app = options.app;
        TDS = app.TDS;

        localDev = options.localDev;
        logger = options.logger;

        //  Ensure we have default option slotting for this plugin.
        options.tds_cli = options.tds_cli || {};

        //  WebSocket and SSE foundation. This one doesn't crash the server when
        //  it encounters errors...it actually logs them :)
        WebSocket = require('faye-websocket');
        ip = require('ip');

        meta = {
            comp: 'TDS',
            type: 'plugin',
            name: 'cli'
        };

        //  Even when loaded we need explicit configuration to activate the TWS.
        if (!TDS.cfg('tds.use_cli')) {
            logger.warn('tds cli plugin disabled', meta);
            return;
        }

        commands = TDS.cfg('tds.cli.commands');
        if (!Array.isArray(commands)) {
            //  TODO:   convert string to array?
        }

        logger = logger.getContextualLogger(meta);

        //  ---
        //  Helpers
        //  ---

        /**
         * Simple input cleansing function. Should help ensure nothing truly
         * strange/dangerous makes it into the command line. Note however that
         * there are 3 layers of guard around the entire route: the plugin has
         * to be loaded, the plugin has to be enabled, and localDev must be
         * true (so only the local machine IP can access the route).
         */
        clean = function(input) {
            var str,
                output,
                regex,
                invalid;

            if (input === undefined || input === null || input === '') {
                logger.warn('Invalid input for clean processing.', meta);
                return;
            }

            str = '' + input;

            //  No relative path syntax allowed on the command line.
            if (/\.\//.test(str)) {
                logger.warn('Invalid input for CLI. No relative paths.', meta);
                return;
            }

            //  check for control characters etc.
            output = str.split('');
            regex = /[^@-_:.,/~?%&="'a-zA-Z0-9{}[]]/;

            invalid = output.some(function(c) {

                //  a bit nasty, but seems to work even with &nbsp;
                if (c <= ' ' || c.charCodeAt(0) === 160) {
                    //  control characters are largely stripped when found but
                    //  we do handle certain forms of whitespace to preserve
                    //  semantics.

                    if (c === ' ' || c.charCodeAt(0) === 160) {
                        //  space
                        return false;
                    } else if (c === '\t') {
                        //  tab
                        return false;
                    } else if (c === '\n') {
                        //  newline
                        return false;
                    } else if (c === '\r') {
                        //  the _other_ newline
                        return false;
                    }

                    //  control character...not valid.
                    return true;
                }

                return regex.test(c);
            });

            if (invalid) {
                return;
            }

            return input;
        };


        /**
         * Helper function to perform the actual processing. This routine is
         * built to work effectively with either an HTTP or socket-based call.
         * @param {String} query A JSON-parsed object structure containing the
         *     parameters to be used to build a TIBET CLI command line.
         * @param {Response|WebSocket} channel The socket or response object to
         *     'send' response data to. When query.nosocket is true this should
         *     be a valid Express Response object, otherwise a WebSocket.
         */
        evaluate = function(query, channel) {

            var cli,        // Spawned child process for the server.
                params,     // Command line parameter array.
                errors,     // Flag tracking whether there were errors in
                            // execution.
                results,    // Array of results when in non-socket mode.
                cmd,        // Filtered input string for safer processing.
                spawnOpts,  // Options for spawning the child process.
                message,    // Output result message structure.
                reason,     // Message text for assembled response.
                child;      // child process module.

            errors = 0;
            results = [];

            params = [];

            cmd = clean(query.cmd);

            if (commands.indexOf(cmd) === -1) {
                //  NOTE we output uncleansed value here to show original.
                reason = 'unauthorized cli command `' + query.cmd + '`';
                logger.error(reason, meta);
                message = {
                    ok: false,
                    error: 'error',
                    level: 'error',
                    reason: reason,
                    status: 1
                };

                //  When not a socket we are dealing with an Express response
                //  and need to close properly.
                if (query.nosocket) {
                    results.push(message);
                    channel.status(500).json(results).end();
                } else {    //  socket
                    channel.send(JSON.stringify(message));
                    channel.close();
                }
                return;
            }

            params.push(cmd);

            spawnOpts = {};

            Object.keys(query).forEach(
                    function(k) {
                        var key,
                            value;

                        //  Cleanse the input query string key/value.
                        key = clean(k);
                        value = clean(query[key]);

                        //  Skip cmd value, we push it first outside the loop.
                        if (key === 'cmd') {
                            return;
                        }

                        //  Ignore signal that this is a URL vs. socket channel.
                        if (key === 'nosocket') {
                            return;
                        }

                        if (key === 'detached') {
                            spawnOpts.detached = true;
                            return;
                        }

                        if (key === 'shell') {
                            if (value) {
                                spawnOpts.shell = value;
                            } else {
                                spawnOpts.shell = true;
                            }
                            return;
                        }

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

            //  Force cli to process as a non-terminal invocation.
            params.push('--tds-cli');

            //  turn off color escape codes sent to the browser.
            params.push('--no-color');

            //  Iterate over the parameters and, if they're JSON, quote them
            //  with a single quote ("'").
            params = params.map(
                        function(aParam) {
                            var paramStr;

                            paramStr = aParam.trim();
                            if (paramStr[0] === '{') {
                                try {
                                    if (JSON.parse(paramStr)) {
                                        return '\'' + paramStr + '\'';
                                    }
                                } catch (e) {
                                    //  No catch here
                                }
                            }

                            return aParam;
                        });

            logger.info('evaluating `tibet ' + params.join(' ') + '`', meta);

            child = require('child_process');
            cli = child.spawn('tibet', params, spawnOpts);

            cli.stdout.on('data', function(data) {
                var str,
                    obj,
                    chunks;

                str = '' + data;
                try {
                    obj = JSON.parse(str);
                    if (obj.ok === undefined) {
                        obj.ok = true;
                    }

                    //  Not all command output comes as 'error' output. Some
                    //  requires us to check the ok state from command output.
                    if (!obj.ok) {
                        errors += 1;
                    }
                } catch (e) {

                    //  If parse fails it's typically because there are multiple
                    //  blocks of data.
                    chunks = str.split('}\n{');
                    if (chunks.length > 1) {

                        chunks = chunks.map(function(item) {
                            var text;

                            text = item;
                            if (text.charAt(text.length - 1) === '\n') {
                                text = text.slice(0, -1);
                            }

                            if (text.charAt(0) === '{') {
                                return text + '}';
                            } else if (text.charAt(text.length - 1) === '}') {
                                return '{' + text;
                            } else {
                                return '{' + text + '}';
                            }
                        });

                        chunks.forEach(function(chunk) {
                            var objC;

                            //  Ignore empty chunks
                            if (!chunk) {
                                return;
                            }

                            try {
                                objC = JSON.parse(chunk);
                            } catch (e2) {
                                objC = {
                                    ok: true,
                                    data: chunk
                                };
                            }

                            if (query.nosocket) {
                                results.push(objC);
                            } else {
                                channel.send(JSON.stringify(objC));
                            }
                        });

                        return;
                    } else if (str.trim().length === 0) {
                        //  Pure whitespace? Just send it along...
                        obj = {
                            ok: true,
                            data: str
                        };
                    } else {
                        errors += 1;
                        obj = {
                            ok: false,
                            error: 'error',
                            reason: str,
                            level: 'error'
                        };
                    }
                }

                if (query.nosocket) {
                    results.push(obj);
                } else {
                    channel.send(JSON.stringify(obj));
                }
            });

            cli.stderr.on('data', function(data) {
                var msg,
                    str;

                errors += 1;
                str = '' + data;

                msg = {ok: false};

                if (TDS.notValid(data)) {
                    msg.error = 'error';
                } else {
                    // Copy and remove newline from data object.
                    msg.error = str.slice(0, -1).toString('utf-8');
                }

                // Some dependent module likes to write error output with empty
                // lines. Remove those so we can control the output form better.
                if (str && typeof str.trim === 'function' &&
                        str.trim().length === 0) {
                    return;
                }

                if (query.nosocket) {
                    results.push(msg);
                } else {
                    channel.send(JSON.stringify(msg));
                }
            });

            cli.on('exit', function(code) {
                var msg;

                if (code !== 0) {
                    msg = {ok: false};
                    msg.status = code;
                    logger.error('stopped with status ' + code, meta);
                } else if (errors > 0) {
                    msg = {ok: false, status: errors};
                } else {
                    msg = {ok: true, status: 0};
                }

                //  When not a socket we are dealing with an Express response
                //  and need to close properly.
                if (query.nosocket !== undefined) {
                    results.push(msg);

                    if (msg.ok) {
                        channel.status(200).json(results).end();
                    } else {
                        //  TODO:   should this be a 500 instead?
                        channel.status(200).json(results).end();
                    }
                } else {
                    channel.send(JSON.stringify(msg));
                    channel.close();
                }
            });

            return;
        };

        //  ---
        //  Middleware
        //  ---

        /**
         * Primary route for activating the 'tibet-cli' socket request handler.
         * This route adds 'onupgrade' logic which will let a subsequent
         * connection request
         */
        TDS.cli = function(req, res, next) {

            //  ---
            //  URI version
            //  ---

            if (req.query.nosocket !== undefined) {
                //  NOTE this is protected by the localDev filter for the route.
                evaluate(req.query, res);
                return;
            }

            //  ---
            //  Socket version
            //  ---

            if (TDS.cli.hasRun) {
                res.status(200).end();
                return;
            }

            TDS.cli.hasRun = true;

            //  NOTE since the cli route is protected by localDev filter we
            //  don't even configure the server to accept a socket request
            //  without having first authenticated as a local developer.
            TDS.httpServer.on('upgrade', function(request, socket, body) {
                var cliSocket,
                    nodeIPs,
                    len,
                    found,
                    reqIP,
                    i;

                if (WebSocket.isWebSocket(request)) {

                    //  verify security context here. Even though it takes a
                    //  local developer to activate this hook once it's active
                    //  we want to ensure no other connections can be made by
                    //  external hosts.
                    nodeIPs = TDS.getNodeIPs();
                    len = nodeIPs.length;
                    reqIP = req.ip;

                    for (i = 0; i < len; i++) {
                        if (ip.isEqual(nodeIPs[i], reqIP)) {
                            found = true;
                        }
                    }

                    if (found !== true) {
                        logger.error('unauthorized socket request from ' +
                            req.ip, meta);
                        //  TODO:   send something? or stay quiet to avoid
                        //  providing more data to the incoming connection?
                        return;
                    }

                    cliSocket = new WebSocket(request, socket, body,
                        ['tibet-cli']);

                    cliSocket.on('open', function() {
                        logger.info(cliSocket.protocol + ' socket created',
                            meta);
                        cliSocket.send(JSON.stringify({ok: true}));
                    });

                    cliSocket.on('message', function(event) {
                        var query,
                            safer,
                            parts;

                        TDS.ifDebug() ?
                            logger.debug('received ' + event.data, meta) : 0;

                        safer = clean(event.data);
                        TDS.ifDebug() ?
                            logger.debug('cleansed to `' + safer + '`',
                                meta) : 0;

                        if (!safer) {
                            TDS.ifDebug() ?
                                logger.debug('ignoring empty event.data',
                                meta) : 0;
                            cliSocket.send(JSON.stringify({
                                    ok: false,
                                    error: 'empty_command',
                                    reason: 'unsafe event data',
                                    level: 'error'
                                }));
                            return;
                        }

                        //  Convert URL formatted query string to query object
                        //  so we match the req.query format of a URL request.
                        query = {};
                        parts = safer.split('&');
                        parts.forEach(function(part) {
                            var chunks;

                            chunks = part.split('=');
                            if (chunks.length === 1) {
                                query[decodeURIComponent(chunks[0])] = true;
                            } else {
                                query[
                                    decodeURIComponent(chunks[0])] =
                                        TDS.unquote(
                                        decodeURIComponent(chunks[1]));
                            }
                        });

                        evaluate(query, cliSocket);
                    });

                    cliSocket.on('error', function(err) {
                        logger.error(cliSocket.protocol + ' socket error:', err,
                            meta);
                        cliSocket.send(JSON.stringify({
                            ok: false,
                            error: 'socket_error',
                            reason: err,
                            level: 'error'
                        }));
                    });

                    cliSocket.on('close', function(event) {
                        logger.info(cliSocket.protocol + ' socket closed',
                            meta);
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

