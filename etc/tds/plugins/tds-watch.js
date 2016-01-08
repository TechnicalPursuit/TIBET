/**
 * @overview Functionality specific to supporting live-sourcing of changes
 *     on the file system with active TIBET clients. TIBET clients which access
 *     the TDS watcher can receive server-sent events (SSEs) when a file in the
 *     watched directory structure is altered.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    //  ---
    //  File Watch Middleware
    //  ---

    /**
     * Watches for file change activity and passes notifications of changes to
     * the TIBET client. Activation is based on the client accessing the current
     * tds.watch.uri endpoint which is configured in the routes in this plugin.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            chokidar,
            escaper,
            eventName,
            ignore,
            loggedIn,
            logger,
            path,
            pattern,
            startSSE,
            TDS,
            watcher,
            watchRoot;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        loggedIn = options.loggedIn;
        logger = options.logger;
        TDS = app.TDS;

        //  Activate the file watcher? Used to drive live-syncing functionality.
        //  Off by default for profiles other than 'development'.
        if (TDS.cfg('tds.use.watch') !== true) {
            return;
        }
        logger.debug('Integrating TDS FileWatch interface.');

        //  ---
        //  Requires
        //  ---

        path = require('path');
        chokidar = require('chokidar');

        //  Ensure we have default option slotting for this plugin.
        options.tds_watch = options.tds_watch || {};

        //  ---
        //  Helpers
        //  ---

        //  Helper function to start an SSE connection.
        startSSE = function(channel) {
            logger.info('Opening SSE notification channel to ' + channel.ip);

            try {
                //  Write the proper SSE headers to establish the connection.
                //  Note that the charset here is important...without it some
                //  versions of Chrome (and maybe other browsers) will throw
                //  errors re: chunked data formatting.
                channel.writeHead(200, {
                    'Content-Type': 'text/event-stream; charset=UTF-8',
                    'Cache-Control': 'no-cache',
                    'transfer-encoding': '',
                    Connection: 'keep-alive'
                });
                channel.write('\n');
                channel.flush();

                //  Respond to notifications that we're closed on the client
                //  side by shutting down the connection on our end
                channel.on('close', function() {
                    var index;

                    logger.info('Closing SSE notification channel to ' +
                        channel.ip);

                    //  Shut down the interval that sends a heartbeat signal.
                    clearInterval(channel.sse.interval);

                    //  Remove the transmission function from the list the
                    //  watcher maintains.
                    index = watcher.channels.indexOf(channel.sse);
                    watcher.channels.splice(index, 1);

                    logger.info('TDS FileWatch connection count updated to ' +
                        watcher.channels.length);
                });

                //  Return a function with a persistent handle to the original
                //  response. We can use this to send out events at any time.
                return function(name, data, id) {
                    var sseId;

                    sseId = id || (new Date()).getTime();

                    if (name !== 'sse-heartbeat') {
                        logger.info('Sending SSE data for ' + name + '#' +
                            sseId + ': ' + JSON.stringify(data));
                    }

                    try {
                        channel.write('id: ' + sseId + '\n');
                        channel.write('event: ' + name + '\n');
                        channel.write('data: ' + JSON.stringify(data) + '\n\n');

                        //  Be sure to flush or compression will cause things to
                        //  fail to be delivered properly.
                        channel.flush();
                    } catch (e) {
                        logger.error('Error writing SSE data: ' + e.message);
                    }
                };

            } catch (e) {
                logger.info('SSE channel error: ' + e.message);
                return function() {};
            }
        };

        //  ---
        //  Watcher
        //  ---

        //  Configure a watcher for our root, including any ignore patterns etc.
        if (options.watcher) {
            watcher = options.watcher;
            watcher.consumers += 1;
            watcher.channels = [];

            logger.debug('TDS FileWatch interface sharing file watcher.');

        } else {

            logger.debug('TDS FileWatch interface creating file watcher.');

            //  Helper function for escaping regex metacharacters. NOTE
            //  that we need to take "ignore format" things like path/*
            //  and make it path/.* or the regex will fail.
            escaper = function(str) {
                return str.replace(
                    /\*/g, '\.\*').replace(
                    /\./g, '\\.').replace(
                    /\//g, '\\/');
            };

            //  Build a pattern we can use to test against ignore files.
            ignore = TDS.getcfg('tds.watch.ignore');
            if (ignore) {
                pattern = ignore.reduce(function(str, item) {
                    return str ?
                        str + '|' + escaper(item) :
                        escaper(item);
                }, '');

                pattern += '|\\.git|\\.svn';

                try {
                    pattern = new RegExp(pattern);
                } catch (e) {
                    return logger.error('Error creating RegExp: ' +
                        e.message);
                }
            } else {
                pattern = /\.git|\.svn/;
            }

            //  TODO: let URI parameters override the watch root.
            //  Expand out the path we'll be watching.
            watchRoot = path.resolve(TDS.expandPath(
                TDS.getcfg('tds.watch.root')));

            logger.debug('TDS FileWatch interface observing: ' + watchRoot);

            watcher = chokidar.watch(watchRoot, {
                ignored: pattern,
                cwd: watchRoot,
                ignoreInitial: true,
                ignorePermissionErrors: true,
                persistent: true
            });
            watcher.consumers = 1;
            watcher.channels = [];
            options.watcher = watcher;
        }

        //  TODO: let URI parameters override the event name to send.
        eventName = TDS.getcfg('tds.watch.event');

        watcher.on('change', function(file) {
            watcher.channels.forEach(function(sse) {
                sse(eventName, {
                    path: file,
                    event: 'change',
                    details: {}
                });
            });
        });

        //  ---
        //  Middleware
        //  ---

        //  The actual middleware. This is our entry point to activating the SSE
        //  connection in response to an inbound request on our watcher url.
        TDS.watch = function(req, res, next) {
            var sse;

            logger.info('Processing file watch request from ' + req.ip);

            //  Confirm this is an SSE request. Otherwise pass it through.
            if (!req.headers.accept ||
                    req.headers.accept !== 'text/event-stream') {
                logger.error(
                    'Request does not accept text/event-stream. Ignoring.');
                return next();
            }

            //  Capture data from the request we want available for logging in
            //  the channel tranmission function.
            res.ip = req.ip

            //  Construct the function which we'll invoke to send data down the
            //  connection to the original response (and socket).
            sse = startSSE(res);

            //  Associate the transmission function with the response (what it
            //  thinks of as the 'channel' from our startSSE function).
            res.sse = sse;

            //  Add the new transmission function to our list of channels.
            watcher.channels.push(sse);

            logger.info('TDS FileWatch connection count updated to ' +
                watcher.channels.length);

            //  Set up a simple SSE pulse to keep proxy servers happy. If
            //  not set otherwise we'll use ten seconds.
            sse.interval = setInterval(function() {
                this('sse-heartbeat', {});
            }.bind(sse), TDS.getcfg('tds.watch.heartbeat') || 10000);
        };

        //  ---
        //  Routes
        //  ---

        app.get(TDS.cfg('tds.watch.uri'), loggedIn, TDS.watch);
    };

}(this));

