/**
 * @overview A optional "development-time server for TIBET (aka the TDS).
 *     The TDS supports basic functionality for doing interactive development
 *     via the TIBET Sherpa IDE. Core features are file-watch capability that
 *     triggers a server-sent-event for edits done on the server and WebDAV
 *     support for storing edits done on the client. In combination these
 *     let you edit your application components on either side of the wire and
 *     keep them in sync with a minimum of overhead and minimum reload impact.
 * @author Scott Shattuck (ss), William J. Edney (wje)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*
 * TODO: migrate TIBET middleware portions to a location we can require() under
 * the tibet node_modules path.
 */

(function() {

'use strict';

var http = require('http');
var path = require('path');

var minimist = require('minimist');

var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var csurf = require('csurf');
var morgan = require('morgan');
var session = require('express-session');
var serveStatic = require('serve-static');

var sh = require('shelljs');
var child = require('child_process');
var jsDAV = require('jsDAV/lib/jsdav');
var watch = require('watch');

//  ---
//  Argument Processing
//  ---

var argv = minimist(process.argv.slice(2));
var port = argv.port ||
    process.env.npm_package_config_port ||
    process.env.PORT ||
    1407;

//  ---
//  TIBET Middleware Root
//  ---

var TDS = {};

//  ---
//  TIBET CLI Middleware
//  ---

TDS.cli = {};

/**
 * Processes command execution requests by passing the argument list to the
 * TIBET command. For the most part this is "ok" given that the command list
 * is constrained, however commands are extensible so it's possible this could
 * open a security hole. You shouldn't enable this without authentication.
 *
 * You can test whether it works by using URLs of the form:
 * TP.uc('~/cli?cmd=echo&argv0=fluff&--testing=123&--no-color').getContent();
 */
TDS.cli.middleware = function (req, res, next) {

    var out;    // Output buffer.
    var cli;    // Spawned child process for the server.
    var msg;    // Shared message content.
    var cmd;    // The command being requested.
    var argv;   // Non-named argument collector.
    var params; // Named argument collector.

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

    // Build up the list but filter any "gaps" in the form of missing args in
    // argv or -- flags for booleans etc.
    params = [cmd].concat(argv).concat(params);
    params = params.filter(function(item) {
        return item !== '' && item !== null &&
            item !== undefined;
    });

    console.log('executing \'tibet\' with args: ' + JSON.stringify(params));

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

// TODO: SSE the result so we can be async and update the client when ready.

        res.send(out.join('\n'));
    });
};

//  ---
//  File Watcher Middleware
//  ---

TDS.watcher = {};

TDS.watcher.pathToWatch = path.resolve(__dirname, './src');
TDS.watcher.changedFileName = '';

TDS.watcher.middleware = function (req, res, next) {
    var writeSSEHead,
        writeSSEData;

    writeSSEHead = function (req, res, cb) {
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

    if (req.headers.accept && req.headers.accept === 'text/event-stream') {

        var eventName;

        if (TDS.watcher.changedFileName !== '') {
            // NOTE this must match the NATIVE_NAME in the corresponding listen
            // calls in the client.
            eventName = 'fileChanged';
        } else {
            eventName = '';
        }

        //  Write the SSE HEAD and then in that method's callback, write the SSE
        //  data.
        writeSSEHead(
            req, res,
            function(req, res) {
                writeSSEData(
                    req, res, eventName, TDS.watcher.changedFileName,
                    function(req, res) {

                        if (TDS.watcher.changedFileName !== '') {
                            TDS.watcher.changedFileName = '';
                        }

                        res.end();
                    });
        });
    }
};

// Start watching...
// TODO: control this via a flag (and perhaps a command-line API)

// TODO: start this on activation of the require'd module
watch.watchTree(
    TDS.watcher.pathToWatch,
    function (fileName, curr, prev) {
        if (typeof fileName === 'object' && prev === null && curr === null) {
            // Finished walking the tree
        } else if (prev === null) {
            // fileName is a new file
        } else if (curr.nlink === 0) {
            // fileName was removed
        } else {
            //console.log('the file changed: ' + fileName);
            // fileName was changed
            TDS.watcher.changedFileName = fileName;
        }
    });

//  ---
//  WebDAV Middleware
//  ---

TDS.webdav = {};

TDS.webdav.jsDAV_CORS_Plugin = require("jsDAV/lib/DAV/plugins/cors");

TDS.webdav.middleware = function (req, res, next) {
  jsDAV.mount({
    node: __dirname + "/dav",
    mount: "/webdav",
    server: req.app,
    standalone: false,
    plugins: [jsDAV_CORS_Plugin]
    }
  ).exec(req, res);
};

//  ---
//  Server Stack Configuration
//  ---

var app = express();

// TODO: add login authentication based on params or some such

// TODO make the secret configurable via tibet.json
app.use(session({ secret: "fix this soon" }));

// TODO: if we ever actually do a "form" or some other template we can try to
// reactivate this...
//app.use(csurf());

app.use(bodyParser.urlencoded({ extended: false }));

// NOTE: path must match with TP.tds.FILE_WATCH_URI in TIBETGlobals.js
app.get('/watcher', TDS.watcher.middleware);

// NOTE: path must match with TP.tds.TIBET_CLI_URI in TIBETGlobals.js
// TODO: convert this to POST once testing is done.
app.get('/cli', TDS.cli.middleware);

// NOTE: path must match with TP.tds.WEBDAV_URI in TIBETGlobals.js
app.use('/webdav', TDS.webdav.middleware);

// Do these after the file watcher.
app.use(morgan());
app.use(compression());
app.use(serveStatic(__dirname));

// Serve a general 404 if no other handler too care of the request.
app.use(function(req, res, next){
  res.send(404, 'Sorry cant find that!');
});

// Provide simple error handler middleware here.
app.use(function(err, req, res, next){
  console.error(err.stack);
// TODO: dump stack/error back to the client...?
  res.send(500, 'Something broke!');
});


// TODO: ? timeouts ?


//  ---
//  Run That Baby!
//  ---

http.createServer(app).listen(port);

}());

