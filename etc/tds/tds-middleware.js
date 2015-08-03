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

/* eslint no-console:0 */

(function() {

    'use strict';

    var path,
        jsDAV,
        chokidar,
        TDS;

    TDS = require('./tds-base.js');

    path = require('path');

    jsDAV = require('jsDAV/lib/jsdav');
    chokidar = require('chokidar');

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
     * url =
     * TP.uc('~/tds/cli?cmd=echo&arg0=fluff&--testing=123&--no-color=no-color');
     *
     * Run the command by forcing a call to the server for the URL:
     *
     * url.save();
     *
     * Or, if you are in the TSH, you can execute:
     *
     * :tibet echo fluff --testing=123 --no-color
     *
     * @param {Object} options Configuration options. Currently ignored.
     * @returns {Function} A connect/express middleware function.
     */
    TDS.cli = function(options) {

        return function(req, res, next) {

            var cli,    // Spawned child process for the server.
                cmd,    // The command being requested.
                params, // Named argument collector.
                child;  // child process module.

            cmd = req.param('cmd');
            if (!cmd) {
                cmd = 'help';
            }

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

            child = require('child_process');
            cli = child.spawn('tibet', params);

            cli.stdout.pipe(res);
            cli.stderr.pipe(res);

            return;
        };
    };

    //  ---
    //  TIBET Patch Middleware
    //  ---

    /**
     * Processes requests to patch a source file with client-side changes.
     * Changes can be in the form of an entire file or a patch/diff formatted
     * patch file. The target path must reside under tds.patch_root for the
     * patch to be valid. The default is ~app_src which restricts patches to
     * application assets in the application's source directory.
     */
    TDS.patcher = function(options) {

        return function(req, res, next) {

            var body,
                data,
                type,
                target,
                text,
                content,
                root,
                url,
                diff,
                fs,
                err;

            err = function(code, message) {
                console.error(message);
                res.send(code, message);
                res.end();
                return;
            };

            console.log('Processing patch request.');

            fs = require('fs');

            body = req.body;
            if (body === null || body === undefined) {
                return err(400, 'No patch data provided.');
            }

            // TODO: parsing?
            data = body;

            // ---
            // verify type
            // ---

            type = data.type;
            if (!type) {
                return err(400, 'No patch type provided.');
            }

            if (type !== 'patch' && type !== 'file') {
                return err(400, 'Invalid patch type ' + type + '.');
            }

            // ---
            // verify target
            // ---

            target = data.target;
            if (!target) {
                return err(400, 'No patch target provided.');
            }

            url = TDS.expandPath(target);
            if (!url) {
                return err(400, 'Unable to resolve patch target url.');
            }

            root = path.resolve(TDS.expandPath(TDS.getcfg('tds.patch.root')));

            if (url.indexOf(root) !== 0) {
                return err(403, 'Patch target outside patch directory.');
            }

            // ---
            // verify content
            // ---

            content = data.content;
            if (!content) {
                return err(400, 'No patch content provided.');
            }

            // ---
            // process the patch
            // ---

            console.log('Processing patch for ' + url);

            // TODO: remove sync versions

            if (type === 'patch') {
                // Read the target and applyPatch using JsDiff to get content.

                try {
                    text = fs.readFileSync(url, {encoding: 'utf8'});
                    if (!text) {
                        throw new Error('NoData');
                    }
                } catch (e) {
                    return err('Error reading file data: ' + e.message);
                }

                diff = require('diff');

                text = diff.applyPatch(text, content);
            } else {
                // Supplied content is the new file text.
                text = content;
            }

            try {
                fs.writeFileSync(url, text);
            } catch (e) {
                return err('Error writing file ' + url + ': ' + e.message);
            }

            res.send('ack');
            res.end();
        };
    };

    //  ---
    //  File Watcher Middleware
    //  ---

    /**
     * Watches for file change activity and passes notifications of changes to
     * the client.
     * @param {Object} options Configuration options. Currently ignored.
     * @returns {Function} A connect/express middleware function.
     */
    TDS.watcher = function(options) {

        var startSSE,
            interval,
            watcher;

        //  Helper function to start an SSE connection.
        startSSE = function(channel) {
            console.log('Opening SSE channel for file watcher.');

            //  Write the proper SSE headers to establish the connection. Note
            //  that the charset here is important...without it some versions of
            //  Chrome (and maybe other browsers) will throw errors re: chunked
            //  data formatting.
            channel.writeHead(200, {
                'Content-Type': 'text/event-stream; charset=UTF-8',
                'Cache-Control': 'no-cache',
                'transfer-encoding': '',
                Connection: 'keep-alive'
            });
            channel.write('\n');

            //  Respond to notifications that we're closed on the client side by
            //  shutting down the connection on our end
            channel.on('close', function() {
                console.log('Closing SSE channel for file watcher.');
                clearInterval(interval);
                watcher.close();
            });

            //  Return a function with a persistent handle to the original
            //  response. We can use this to send out events at any time.
            return function(name, data, id) {
                var sseId;

                sseId = id || (new Date()).getTime();

                if (name !== 'sse-heartbeat') {
                    console.log('Sending SSE data for ' + name + '#' + sseId +
                        ': ' + JSON.stringify(data));
                }

                try {
                    channel.write('id: ' + sseId + '\n');
                    channel.write('event: ' + name + '\n');
                    channel.write('data: ' + JSON.stringify(data) + '\n\n');
                } catch (e) {
                    console.error('Error writing SSE data: ' + e.message);
                }
            };
        };

        //  The actual middleware. This is our entry point to activating the SSE
        //  connection in response to an inbound request on our watcher url.
        return function(req, res, next) {

            var root,
                escaper,
                ignore,
                pattern,
                eventName,
                sendSSE;

            //  Confirm this is an SSE request.
            if (req.headers.accept &&
                    req.headers.accept === 'text/event-stream') {

                req.socket.setTimeout(Infinity);

                //  TODO: let URI parameters override the watch root.
                //  Expand out the path we'll be watching.
                root = path.resolve(TDS.expandPath(
                    TDS.getcfg('tds.watch.root')));

                //  Helper function for escaping regex metacharacters for
                //  patterns. NOTE that we need to take "ignore format" things
                //  like path/* and make it path/.* or the regex will fail.
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
                        return str ? str + '|' + escaper(item) : escaper(item);
                    }, '');

                    try {
                        pattern = new RegExp(pattern);
                    } catch (e) {
                        return console.log('Error creating RegExp: ' +
                            e.message);
                    }
                }

                //  TODO: let URI parameters override the event name to send.
                eventName = TDS.getcfg('tds.watch.event');

                //  Write out the headers and hold on to the event writer
                //  returned by that method. We'll invoke that function from
                //  within our watch handler on file changes.
                sendSSE = startSSE(res);

                //  Configure a watcher for our root, including any ignore
                //  patterns etc.
                watcher = chokidar.watch(root, {
                    ignored: pattern,
                    cwd: root,
                    ignorePermissionErrors: true,
                    persistent: true
                });

                watcher.on('change', function(file) {
                    sendSSE(eventName, {
                        path: file,
                        event: 'change',
                        details: {}
                    });
                });

                //  Set up a simple SSE pulse to keep proxy servers happy. If
                //  not set otherwise we'll use ten seconds.
                interval = setInterval(function() {
                    sendSSE('sse-heartbeat', {});
                }, TDS.getcfg('tds.watch.heartbeat') || 10000);
            }
        };
    };

    //  ---
    //  WebDAV Middleware
    //  ---

    TDS.webdav = {};

    /**
     * Provides routing to the jsDAV module for WebDAV support. The primary
     * purpose of this middleware is to give TIBET a way to update the server
     * without relying on any non-standard APIs or server functionality.
     * @param {Object} options Configuration options. Currently ignored.
     * @returns {Function} A connect/express middleware function.
     */
    TDS.webdav = function(options) {
        var node,
            mount;

        node = path.resolve(TDS.expandPath(TDS.getcfg('tds.webdav.root')));

        //  NB: The mount is set to '/' because it is already relative to the
        //  route that got us here (when we got installed as middleware).
        mount = '/';

        return function(req, res, next) {
            jsDAV.mount({
                node: node,
                mount: mount,
                server: req.app,
                standalone: false,
                plugins: [TDS.webdav.jsDAV_CORS_Plugin]
            }).exec(req, res);
        };
    };

    // Ensure we leverage CORS headers in case the TDS isn't the boot server.
    TDS.webdav.jsDAV_CORS_Plugin = require('jsDAV/lib/DAV/plugins/cors');

    module.exports = TDS;

}());

