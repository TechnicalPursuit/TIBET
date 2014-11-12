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
 * Parameters:
 *
 *  --app_root <string>         // Defaults to '.'
 *
 *  --no-cli                    // Defaults to false.
 *  --no-watcher                // Defaults to false.
 *  --no-webdav                 // Defaults to false.
 *
 *  --tds.port <number>         // Defaults to 1407.
 *  --tds.secret <string>       // Should change from tibet_cfg value.
 *
 *  --tds.cli_uri  <string>     // URL path for TIBET cli route
 *
 *  --tds.dav_root <string>     // Directory mounted for webdav.
 *  --tds.dav_uri  <string>     // URL path for webdav routing.
 *
 *  --tds.watch_root <string>   // Directory mounted for watch.
 *  --tds.watch_uri  <string>   // URL path for file watcher.
 */

(function() {

'use strict';

var http,           // Web server baseline.
    minimist,       // Argument processing.

    express,        // Express web framework.
    bodyParser,     // Express body parser.
    compression,    // Express gzip/compression.
    //csurf,          // Express cross-site protection.
    morgan,         // Express logging.
    session,        // Express session management.
    serveStatic,    // Express file-system serving.

    TDS,            // TIBET middleware addons.

    argv,           // The argument list.
    app_root,       // Computed TIBET application root.
    app,            // Express application instance.
    port;           // Port to listen on.

// Require our components.
http = require('http');
minimist = require('minimist');
express = require('express');
bodyParser = require('body-parser');
compression = require('compression');
//csurf = require('csurf');
morgan = require('morgan');
session = require('express-session');
serveStatic = require('serve-static');
TDS = require('tibet/etc/tds/tds-middleware');

//  ---
//  Argument Processing
//  ---

argv = minimist(process.argv.slice(2)) || {_: []};

// Since server.js typically sits in the project root directory we can work with
// __dirname here as a default.
app_root = argv.app_root || __dirname;

// Ensure the TDS loads configuration data from our computed root.
argv.app_root = app_root;
TDS.initPackage(argv);

// Lots of options for where to get a port number but try to leverage TDS first.
port = TDS.getcfg('port') ||
    TDS.getcfg('tds.port') ||
    process.env.npm_package_config_port ||
    process.env.PORT ||
    1407;

//  ---
//  Server Stack Configuration
//  ---

app = express();

// TODO: add login authentication based on params or some such.
// get data from tibet.json for user/pass lists.

// Configure a basic session. We look up the secret here which allows it to be
// set on the command line or via the project's tibet.json file.
// TODO: warn if it's still the one coded into the library as a default value.
app.use(session({
    secret: TDS.getcfg('tds.secret'),
    resave: true,                       // TODO: remove when possible.
    saveUninitialized: true             // TODO: remove when possible.
}));

// TODO: if we ever actually do a "form" or some other template we can try to
// reactivate this. for now it isn't being sent to the client appropriately.
//app.use(csurf());

app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: false}));

//  Express logger.
//  TODO: Add options control in tibet.json.
app.use(morgan('dev', {skip: TDS.logFilter}));

//  ---
//  ---

// Let the client access the tibet command line functionality. Potentially not
// secure, but at least the command being run and the command set is somewhat
// constrained.
if (argv.cli !== false) {
    app.get(TDS.getcfg('tds.cli_uri'), TDS.cli());
    app.post(TDS.getcfg('tds.cli_uri'), TDS.cli());
}

// Configure the TIBET patch handler. This will process requests from the client
// to apply a patch to a source file, or to replace the file entirely.
if (argv.patcher !== false) {
    app.put(TDS.getcfg('tds.patch_uri'), TDS.patcher());
    app.post(TDS.getcfg('tds.patch_uri'), TDS.patcher());
    app.patch(TDS.getcfg('tds.patch_uri'), TDS.patcher());
}

// Configure the file watcher so changes on the server can be propogated to the
// client. SSE must be active in the client for this to work.
if (argv.watcher !== false) {
    app.get(TDS.getcfg('tds.watch_uri'), TDS.watcher());
}

// Configure the webdav component so changes in the client can be propogated to
// the server.
if (argv.webdav !== false) {
    app.put(TDS.getcfg('tds.dav_uri'), TDS.webdav());
    app.post(TDS.getcfg('tds.dav_uri'), TDS.webdav());
}

//  ---
//  Server Wrapup
//  ---

//  By default we assume the entire site is accessible statically. That's a
//  side-effect of TIBET not making any assumptions about server-side logic.
app.use(serveStatic(app_root));

//  Express gzip compression. Send data compressed if possible.
app.use(compression());

// Serve a general 404 if no other handler too care of the request.
app.use(function(req, res, next) {
  res.send(404, TDS.getcfg('tds.404'));
});

// Provide simple error handler middleware here.
app.use(function(err, req, res, next) {
  console.error(err.stack);
// TODO: dump stack/error back to the client...?
  res.send(500, TDS.getcfg('tds.500'));
});


// TODO: ? timeouts ?


//  ---
//  Run That Baby!
//  ---

http.createServer(app).listen(port);

}());
