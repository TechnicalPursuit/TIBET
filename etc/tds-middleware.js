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

var path = require('path');

var jsDAV = require('jsDAV/lib/jsdav');
var watch = require('watch');

// Load the CLI's package support to help with option and configuration data.
var Package = require('../src/tibet/cli/_Package');


//  ---
//  TIBET Data Server Root
//  ---

var TDS = {};

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


//  ---
//  TIBET CLI Middleware
//  ---

/**
 * Processes command execution requests by passing the argument list to the
 * TIBET command. For the most part this is "ok" given that the command list
 * is constrained, however commands are extensible so it's possible this could
 * open a security hole. You shouldn't enable this without authentication.
 *
 * You can test whether it works by using URLs of the form in the client
 * console.
 * TP.uc('~/tds/cli?cmd=echo&argv0=fluff&--testing=123&--no-color').getContent();
 *
 * @param {Object} options Configuration options. Currently ignored.
 * @return {Function} A connect/express middleware function.
 */
TDS.cli = function(options) {

    return function (req, res, next) {

        var out;    // Output buffer.
        var cli;    // Spawned child process for the server.
        var msg;    // Shared message content.
        var cmd;    // The command being requested.
        var argv;   // Non-named argument collector.
        var params; // Named argument collector.
        var child;  // child process module.

        cmd = req.param('cmd')
        if (!cmd) {
            res.send('Invalid command.');
            return;
        }

        out = [];
        argv = [];
        params = [];

        Object.keys(req.query).forEach(function(key) {
            if (key === 'cmd') {
                void(0);    // skip
            } else if (/argv\d/.test(key)) {
                argv[key.charAt(4)] = req.query[key];
            } else {
                params.push(key, req.query[key]);
            }
        });

        // Build up the list but filter any "gaps" in the form of missing args
        // in argv or -- flags for booleans etc.
        params = [cmd].concat(argv).concat(params);
        params = params.filter(function(item) {
            return item !== '' && item !== null &&
                item !== undefined;
        });

        child = require('child_process');
        cli = child.spawn('tibet', params);

        cli.stdout.on('data', function(data) {
            var msg = '' + data;
            if (msg.trim().length === 0) {
                return;
            }
            out.push('' + data);
        });

        cli.stderr.on('data', function(data) {
            var msg = '' + data;
            if (msg.trim().length === 0) {
                return;
            }
            out.push(msg);
        });

        cli.on('close', function(code) {
            if (code !== 0) {
                out.push('not ok - ' + code);
            }

            // TODO: SSE the result ?
            res.send(out.join('\n'));
        });
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

        var body;
        var data;
        var type;
        var file;
        var content;

        body = req.body;
        if (body == null) {
            res.send(400, 'No patch data provided.');
            res.end();
            return;
        }

        console.log('Parsing data for patch: ' + body);
        data = body;

        file = data.file;
        type = data.type;
        content = data.content;

        console.log('patch file: ' + file);
        console.log('patch type: ' + type);
        console.log('patch content: ' + content);

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
        changedFileName;

    changedFileName = '';
    root = path.resolve(TDS.expandPath(TDS.getcfg('tds.watch_root')));

    // TODO: control this via a flag (and perhaps a command-line API)
    // Start watching...
    watch.watchTree(root,
        function (fileName, curr, prev) {
            if (typeof fileName === 'object' && prev === null && curr === null) {
                // Finished walking the tree
            } else if (prev === null) {
                // fileName is a new file
            } else if (curr.nlink === 0) {
                // fileName was removed
            } else {
                // fileName was changed
                changedFileName = fileName;
            }
        });

    var writeSSEHead = function (req, res, cb) {
        res.writeHead(
            200,
            {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

        res.write('retry: 1000\n');

        if (cb) {
            return cb(req, res);
        }
    };

    var writeSSEData = function (req, res, eventName, eventData, cb) {
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

        if (req.headers.accept && req.headers.accept === 'text/event-stream') {

            var eventName;

            if (changedFileName !== '') {
                eventName = TDS.getcfg('tds.watch_event');
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
            plugins: [jsDAV_CORS_Plugin]
        }).exec(req, res);
    };
};

// Ensure we can leverage CORS headers in case the TDS isn't the boot server.
TDS.webdav.jsDAV_CORS_Plugin = require("jsDAV/lib/DAV/plugins/cors");

//  ---
//  Export
//  ---

module.exports = TDS;

}());

