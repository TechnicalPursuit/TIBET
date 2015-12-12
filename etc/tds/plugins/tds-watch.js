/**
 * @overview Connect/Express middleware supporting the various aspects of TDS
 *     (TIBET Data Server) functionality. Primary goals of the TDS are to
 *     provide focused REST data access and support TIBET development.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

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
            interval,
            loggedIn,
            logger,
            path,
            pattern,
            root,
            startSSE,
            TDS,
            watcher;

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
        logger.debug('Activating TDS FileWatch plugin.');

        //  ---
        //  Requires
        //  ---

        path = require('path');
        chokidar = require('chokidar');

        //  ---
        //  Helpers
        //  ---

        //  Helper function to start an SSE connection.
        startSSE = function(channel) {
            logger.info('Opening SSE channel for file watcher.');

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

                //  Respond to notifications that we're closed on the client
                //  side by shutting down the connection on our end
                channel.on('close', function() {
                    logger.info('Closing SSE channel for file watcher.');
                    clearInterval(interval);

                    //  If we have multiple consumers of the watcher don't close
                    //  it, just decrement that count.
                    if (typeof watcher.consumers === 'number') {
                        watcher.consumers -= 1;
                        if (watcher.consumers === 0) {
                            watcher.close();
                        }
                    } else {
                        watcher.close();
                    }
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

                //  TODO:   something else?
                return function() {};
            }
        };

        //  Configure a watcher for our root, including any ignore patterns etc.
        if (options.watcher) {
            watcher = options.watcher;
            watcher.consumers += 1;

            logger.debug('TDS FileWatch plugin sharing file watcher.');

        } else {

            logger.debug('TDS FileWatch plugin creating file watcher.');

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
            root = path.resolve(TDS.expandPath(
                TDS.getcfg('tds.watch.root')));

            logger.debug('TDS FileWatch plugin observing: ' + root);

            watcher = chokidar.watch(root, {
                ignored: pattern,
                cwd: root,
                ignoreInitial: true,
                ignorePermissionErrors: true,
                persistent: true
            });
            watcher.consumers = 1;
            options.watcher = watcher;
        }

        //  TODO: let URI parameters override the event name to send.
        eventName = TDS.getcfg('tds.watch.event');

        watcher.on('change', function(file) {
            if (watcher.sendSSE) {
                watcher.sendSSE(eventName, {
                    path: file,
                    event: 'change',
                    details: {}
                });
            }
        });


        //  ---
        //  Middleware
        //  ---

        //  The actual middleware. This is our entry point to activating the SSE
        //  connection in response to an inbound request on our watcher url.
        TDS.watch = function(req, res, next) {

            //  Confirm this is an SSE request. Otherwise pass it through.
            if (!req.headers.accept ||
                    req.headers.accept !== 'text/event-stream') {
                return next();
            }

            req.socket.setTimeout(Infinity);

            //  Write out the headers and hold on to the event writer
            //  returned by that method. We'll invoke that function from
            //  within our watch handler on file changes.
            watcher.sendSSE = startSSE(res);

            //  Set up a simple SSE pulse to keep proxy servers happy. If
            //  not set otherwise we'll use ten seconds.
            interval = setInterval(function() {
                watcher.sendSSE('sse-heartbeat', {});
            }, TDS.getcfg('tds.watch.heartbeat') || 10000);
        };

        //  ---
        //  Routes
        //  ---

        //  TODO:   really don't want to activate with every invocation of this
        //  route...want to set it up once and stop there.
        app.get(TDS.cfg('tds.watch.uri'), loggedIn, TDS.watch);
    };

}());

