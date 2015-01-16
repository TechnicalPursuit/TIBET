/**
 * @overview Connect/Express middleware supporting the various aspects of TDS
 *     (TIBET Development Server) functionality. Primary goals of the TDS are
 *     to provide a way to load changes from server to client, patch changes
 *     from client to server, and allow the client to invoke the TIBET cli.
 * @author Scott Shattuck (ss), William J. Edney (wje)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

'use strict';

var path,
    jsDAV,
    watch,
    Package,
    TDS;

path = require('path');

jsDAV = require('jsDAV/lib/jsdav');
watch = require('watch');

// Load the CLI's package support to help with option and configuration data.
Package = require('../../src/tibet/cli/_Package');


//  ---
//  TIBET Data Server Root
//  ---

TDS = {};

/**
 * The package instance assisting with configuration data loading/lookup.
 * @type {Package} A TIBET CLI package instance.
 */
TDS._package = null;

/**
 * Expands virtual paths using configuration data loaded from TIBET.
 * @param {String} aPath The virtual path to expand.
 * @return {String} The expanded path.
 */
TDS.expandPath = function(aPath) {
    this.initPackage();

    return TDS._package.expandPath(aPath);
};

/**
 * Return the application head, the location serving as the top-level root.
 * @return {String} The application head path.
 */
TDS.getAppHead = function() {
    this.initPackage();

    return TDS._package.getAppHead();
};

/**
 * Returns the value for a specific configuration property.
 * @param {String} property A configuration property name.
 * @return {Object} The property value, if found.
 */
TDS.getcfg = function(property) {
    this.initPackage();

    return TDS._package.getcfg(property);
};

/**
 * Initalizes the TDS package, providing it with any initialization options
 * needed such as app_root or lib_root. If the package has already been
 * configured this method simply returns.
 * @param {Object} options The package options to use.
 * @return {Package} The package instance.
 */
TDS.initPackage = function(options) {
    if (this._package) {
        return this._package;
    }

    this._package = new Package(options);
};

/**
 * Provides a useful 'skip' function for the Express logger. This will filter
 * out a lot of logging overhead that might otherwise occur when the TDS is
 * being accessed.
 * @return {Boolean} true to skip logging the current request.
 */
TDS.logFilter = function(req, res) {
    var url = TDS.getcfg('tds.watch_uri');

    // Don't log repeated calls to the watcher URL.
    if (req.path.indexOf(url) !== -1) {
        return true;
    }
};


//  ---
//  TIBET CLI Middleware
//  ---

/**
 * Processes command execution requests by passing the argument list to the
 * TIBET command. This option is disabled by default and must be specifically
 * activated.
 *
 * You can test whether it works by using URLs of the form:
 * url = TP.uc('~/tds/cli?cmd=echo&argv0=fluff&--testing=123&--no-color');
 *
 * Run the command by forcing a call to the server for the URL:
 * url.getContent();
 *
 * @param {Object} options Configuration options. Currently ignored.
 * @return {Function} A connect/express middleware function.
 */
TDS.cli = function(options) {

    return function (req, res, next) {

        var cli,    // Spawned child process for the server.
            cmd,    // The command being requested.
            params, // Named argument collector.
            child;  // child process module.

        cmd = req.param('cmd');
        if (!cmd) {
            cmd = 'help';
        }

        params = [cmd];

        Object.keys(req.query).forEach(function(key) {
            var value;

            if (key === 'cmd') {
                void 0;    // skip
            } else {
                value = req.query[key];

                params.push('--' + key);
                if (value !== null &&
                    value !== undefined &&
                    value !== true &&
                    value !== '') {
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
 * Processes requests to patch a source file with client-side changes. Changes
 * can be in the form of an entire file or a patch/diff formatted patch file.
 * The target path must reside under tds.patch_root for the patch to be valid.
 * The default is ~app_src which restricts patches to application assets in the
 * application's source directory.
 */
TDS.patcher = function(options) {

    return function (req, res, next) {

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

        root = path.resolve(TDS.expandPath(TDS.getcfg('tds.patch_root')));

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
 * Watches for file change activity within a directory. If changes occur a
 * server-sent event is created and transmitted.
 * @param {Object} options Configuration options. Currently ignored.
 * @return {Function} A connect/express middleware function.
 */
TDS.watcher = function(options) {
    var root,
        changedFileName,
        writeSSEHead,
        writeSSEData,
        pattern,
        ignore,
        escaper;

    changedFileName = '';
    root = path.resolve(TDS.expandPath(TDS.getcfg('tds.watch_root')));

    // Helper function for escaping regex metacharacters for patterns. NOTE that
    // we need to take "ignore format" things like path/* and make it path/.* or
    // the regex will fail.
    escaper = function(str) {
        return str.replace(
            /\*/g, '\.\*').replace(
            /\./g, '\\.').replace(
            /\//g, '\\/');
    };

    // Build a pattern we can use to test against ignore files.
    ignore = TDS.getcfg('tds.watch.ignore');
    if (ignore) {

        pattern = ignore.reduce(function(str, item) {
            return str ? str + '|' + escaper(item) : escaper(item);
        }, '');

        try {
            pattern = new RegExp(pattern);
        } catch (e) {
            return console.log('Error creating RegExp: ' + e.message);
        }
    }

    // TODO: control this via a flag (and perhaps a command-line API)

    // TODO: toggle from the client. Until we issue watchFS don't.

    // TODO: may need to change to the "monitor" approach here. see docs for the
    // watch module.

    watch.watchTree(root,
        function (fileName, curr, prev) {
            if (typeof fileName === 'object' && prev === null && curr === null) {
                // Finished walking the tree
                void 0;
            } else if (prev === null) {
                // fileName is a new file
                void 0;
            } else if (curr.nlink === 0) {
                // fileName was removed
                void 0;
            } else {
                // fileName was changed
                changedFileName = fileName;
            }

            if (changedFileName && pattern) {
                if (pattern.test(changedFileName)) {
                    changedFileName = '';
                }
            }

            // Normalize the file name. We need to send it to the client as if
            // it were rooted from the launch root.
            changedFileName = changedFileName.replace(TDS.getAppHead(), '');
        });

    writeSSEHead = function (req, res, cb) {
        res.writeHead(
            200,
            {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

        // TODO: make this interval configurable.
        res.write('retry: 1000\n');

        if (cb) {
            return cb(req, res);
        }
    };

    writeSSEData = function (req, res, eventName, eventData, cb) {
        var id;

        id = (new Date()).getTime();

        res.write('id: ' + id + '\n');
        res.write('event: ' + eventName + '\n');
        res.write('data: ' + JSON.stringify(eventData) + '\n\n');

        if (cb) {
            return cb(req, res);
        }
    };

    return function (req, res, next) {

        var eventName;

        if (req.headers.accept && req.headers.accept === 'text/event-stream') {

            if (changedFileName !== '') {
                eventName = TDS.getcfg('tds.watch_event');
                console.log('Announcing file system change to: ' +
                    changedFileName);
            } else {
                eventName = '';
            }

            //  Write the SSE HEAD and then in that method's callback, write the
            //  SSE data.
            writeSSEHead(
                req, res,
                function(req, res) {
                    writeSSEData(
                        req, res, eventName, changedFileName,
                        function(req, res) {

                            if (changedFileName !== '') {
                                changedFileName = '';
                            }

                            res.end();
                        });
            });
        }
    };
};

//  ---
//  WebDAV Middleware
//  ---

TDS.webdav = {};

/**
 * Provides routing to the jsDAV module for WebDAV support. The primary purpose
 * of this middleware is to give TIBET a way to update the server without
 * relying on any non-standard APIs or server functionality.
 * @param {Object} options Configuration options. Currently ignored.
 * @return {Function} A connect/express middleware function.
 */
TDS.webdav = function(options) {
    var node,
        mount;

    node = path.resolve(TDS.expandPath(TDS.getcfg('tds.dav_root')));
    mount = TDS.expandPath(TDS.getcfg('tds.dav_uri'));

    return function (req, res, next) {
        jsDAV.mount({
            node: node,
            mount: mount,
            server: req.app,
            standalone: false,
            plugins: [TDS.webdav.jsDAV_CORS_Plugin]
        }).exec(req, res);
    };
};

// Ensure we can leverage CORS headers in case the TDS isn't the boot server.
TDS.webdav.jsDAV_CORS_Plugin = require('jsDAV/lib/DAV/plugins/cors');

//  ---
//  Export
//  ---

module.exports = TDS;

}());
