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
            include,
            exclude,
            localDev,
            logger,
            path,
            pattern,
            startSSE,
            TDS,
            meta,
            watcher,
            watchRoot;

        app = options.app;
        TDS = app.TDS;

        localDev = options.localDev;
        logger = options.logger;

        meta = {
            comp: 'TDS',
            type: 'watch'
        };

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
            var retry;

            logger.info('Opening SSE notification channel to ' + channel.ip);

            retry = TDS.getcfg('tds.watch.retry') ||
                TDS.getcfg('sse.retry') ||
                3000;

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
                        channel.write('retry: ' + retry + '\n');
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
                return function() {
                    //  empty
                };
            }
        };

        //  ---
        //  Watcher
        //  ---

        //  Configure a watcher for our root, including any include/exclude etc.
        if (options.watcher) {
            watcher = options.watcher;
            watcher.consumers += 1;
            watcher.channels = [];

            logger.info('TDS FileWatch interface sharing file watcher.');

            watchRoot = watcher.options.cwd;

            TDS.ifDebug() ?
                logger.debug('TDS FileWatch interface rooted at: ' +
                    watchRoot) : 0;

        } else {

            logger.info('TDS FileWatch interface creating file watcher.');

            //  Expand out the path we'll be watching. This should almost always
            //  be the application root.
            watchRoot = path.resolve(TDS.expandPath(
                TDS.getcfg('tds.watch.root') || '~app'));

            TDS.ifDebug() ? logger.debug('TDS FileWatch interface rooted at: ' +
                watchRoot) : 0;

            //  Helper function for escaping regex metacharacters. NOTE
            //  that we need to take "ignore format" things like path/*
            //  and make it path/.* or the regex will fail. Also note we special
            //  case ~ to allow virtual path matches.
            escaper = function(str) {
                return str.replace(
                    /\*/g, '.*').replace(
                    /\./g, '\\.').replace(
                    /\~/g, '\\~').replace(
                    /\//g, '\\/');
            };

            include = TDS.getcfg('tds.watch.include');

            if (typeof include === 'string') {
                try {
                    include = JSON.parse(include);
                } catch (e) {
                    logger.error('Invalid tds.watch.include value: ' +
                        e.message);
                }
            }

            if (TDS.notEmpty(include)) {
                //  Build list of 'files', 'directories', etc. But keep in mind
                //  this is a file-based system so don't retain virtual paths.
                include = include.map(function(item) {
                    //  item will often be a virtual path or file ref. we want
                    //  to use the full path, or whatever value is given.
                    return path.resolve(TDS.expandPath(item));
                });
            } else {
                //  Watch everything under the watch root
                include = watchRoot;
            }

            //  Build a pattern we can use to test against ignore files.
            exclude = TDS.getcfg('tds.watch.exclude');

            if (typeof exclude === 'string') {
                try {
                    exclude = JSON.parse(exclude);
                } catch (e) {
                    logger.error('Invalid tds.watch.exclude value: ' +
                        e.message);
                }
            }

            if (exclude) {
                pattern = exclude.reduce(function(str, item) {
                    var fullpath;

                    fullpath = TDS.expandPath(item);
                    return str ?
                        str + '|' + escaper(fullpath) :
                        escaper(fullpath);
                }, '');

                pattern += '|\\.git|\\.svn|node_modules';

                try {
                    pattern = new RegExp(pattern);
                } catch (e) {
                    return logger.error('Error creating RegExp: ' +
                        e.message);
                }
            } else {
                pattern = /\.git|\.svn|node_modules/;
            }

            watcher = chokidar.watch(include, {
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

        eventName = TDS.getcfg('tds.watch.event');

        //  The primary change handler function.
        watcher.on('change', function(file) {
            var ignoreChangedFiles,
                ignoreIndex,
                fullpath,
                tibetpath,
                extname,
                procs,
                shouldSignal,
                i,
                len,
                result;

            ignoreChangedFiles = TDS.getcfg('tds.watch.ignore_changed_files');

            if (ignoreChangedFiles) {
                ignoreIndex = ignoreChangedFiles.indexOf(file);

                if (ignoreIndex !== -1) {
                    ignoreChangedFiles.splice(ignoreIndex, 1);

                    return;
                }
            }

            fullpath = path.join(watchRoot, file);
            tibetpath = TDS.getVirtualPath(fullpath);
            extname = path.extname(fullpath);
            extname = extname.charAt(0) === '.' ? extname.slice(1) : extname;

            TDS.ifDebug() ? logger.debug('Processing file change to ' +
                tibetpath) : 0;

            //  Perform any extension-specific processing for the file.
            procs = TDS.watch.lookupProcessors(extname);
            if (procs) {

                TDS.ifDebug() ? logger.debug('Running processors for ' +
                    extname) : 0;

                //  Proc can preventDefault by returning non-true. If any
                //  processor prevents default then we don't signal.
                len = procs.length;
                for (i = 0; i < len; i++) {
                    try {
                        result = procs[i](fullpath);
                    } catch (e) {
                        logger.error('Error running processor: ' +
                            e.message);
                    }

                    if (result === false) {
                        shouldSignal = false;
                    }
                }
            }

            //  If any processor prevented signaling log it and bail early.
            if (shouldSignal === false) {
                TDS.ifDebug() ? logger.debug('SSE prevented for ' +
                    extname) : 0;
                return;
            }

            //  Signal if not prevented by a processor...
            watcher.channels.forEach(function(sse) {
                sse(eventName, {
                    path: tibetpath,
                    event: eventName,
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
            res.ip = req.ip;

            //  Construct the function which we'll invoke to send data down the
            //  connection to the original channel.
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
        //  Processor Management
        //  ---

        /**
         * Loads any processor modules found in the project's processors
         * directory. Each processor is expected to invoke registerProcessor
         * so it can be invoked during file change handling.
         */
        TDS.watch.loadProcessors = function() {
            var procdir,
                files;

            procdir = TDS.expandPath('~tds_processors');

            if (TDS.shell.test('-d', procdir)) {
                files = TDS.shell.ls(procdir);
                files = files.map(
                        function(file) {
                            return file.toString();
                        });

                files.sort().forEach(function(filename) {
                    var procMeta,
                        name;

                    //  Ignore directories
                    if (TDS.shell.test('-d', path.join(procdir, filename))) {
                        return;
                    }

                    //  Ignore files that aren't js source
                    if (!/\./.test(filename)) {
                        return;
                    }

                    name = filename.slice(0, filename.lastIndexOf('.'));

                    //  Ignore hidden or 'sample/helper' files.
                    if (name.match(/^(\.|_)/) ||
                        name.match(/~$/) ||            //  tilde files for vi etc.
                        name.match(/\.sw(.{1})$/) ||   //  swap files for vi etc.
                        TDS.shell.test('-d', filename)) {
                        return;
                    }

                    procMeta = {
                        comp: 'TDS',
                        type: 'proc',
                        name: name
                    };

                    logger.system('loading file processor', procMeta);

                    options.logger = logger.getContextualLogger(procMeta);

                    try {
                        //  NOTE the processors themselves should register
                        //  such that they can be invoked when a file with
                        //  a matching extension changes.
                        require(path.join(procdir, filename))(options);
                    } catch (e) {
                        logger.error('Error loading processor: ' + name);
                        logger.error(e.message);
                        logger.debug(e.stack);
                        return;
                    }
                });
            }
        };

        /**
         * Looks up any registered file processors by extension.
         * @param {String} extension The file extension to use as a lookup key.
         * @return {Array.<Function>} An array of processor functions.
         */
        TDS.watch.lookupProcessors = function(extension) {
            var dict;

            dict = TDS.watch.processors || {};
            return dict[extension];
        };

        /**
         * Register a file processor by extension. There can be more than one.
         * @param {String} extension The extension to register the processor
         *     under. For example 'sass', 'js', etc.
         * @param {Function} processor The function to invoke. It should take a
         *     single parameter, the full file path to process.
         * @param {Object} metadata Logger metadata for the processor.
         * @returns {Array.<Function>} The updated array of processors.
         */
        TDS.watch.registerProcessor = function(extension, processor, metadata) {
            var dict,
                procs;

            logger.info('registering ' + extension + ' processor',
                metadata || meta);

            TDS.watch.processors = TDS.watch.processors || {};
            dict = TDS.watch.processors;

            procs = dict[extension];
            if (!procs) {
                procs = [];
                dict[extension] = procs;
            }
            procs.push(processor);

            return procs;
        };


        //  ---
        //  Routes
        //  ---

        TDS.watch.loadProcessors(options);

        app.get(TDS.cfg('tds.watch.uri'), localDev, TDS.watch);
    };

}(this));

