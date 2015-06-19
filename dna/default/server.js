/**
 * @overview An optional server for TIBET development and deployment. The TIBET
 *     Data Server (TDS) provides a number of features to make development
 *     faster and more fluid including support for live sourcing and storing
 *     client-side changes back to the server. The TDS is also engineered to be
 *     a complementary server to a TIBET client in that it focuses on serving
 *     data, not "pages", in a purely RESTful fashion. As part of this latter
 *     feature the TDS integrates pouchdb and supports CouchDB APIs natively.
 * @author Scott Shattuck (ss), William J. Edney (wje)
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
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
 *  --tds.cli.uri  <string>     // URL path for TIBET cli route
 *
 *  --tds.webdav.root <string>  // Directory mounted for webdav.
 *  --tds.webdav.uri  <string>  // URL path for webdav routing.
 *
 *  --tds.patch.root <string>   // Directory root for patchable source.
 *  --tds.patch.uri <string>    // URL path for patch handler.
 *
 *  --tds.watch.root <string>   // Directory mounted for watch.
 *  --tds.watch.uri  <string>   // URL path for file watcher.
 */

(function() {

    'use strict';

    var app,                // Express application instance.
        appRoot,            // Computed TIBET application root.
        argv,               // The argument list.
        bodyParser,         // Express body parser.
        compression,        // Express gzip/compression.
        cookieParser,       // Express cookie parser.
        csurf,              // Express cross-site protection.
        DefaultPouch,       // PouchDB.defaults instance.
        express,            // Express web framework.
        helmet,             // Security blanket.
        http,               // Web server baseline.
        io,                 // Socket.io support.
        jsonParser,         // Express body parser.
        logo,               // Text logo.
        minimist,           // Argument processing.
        mocks,              // Mock data file references.
        morgan,             // Express logging.
        path,               // The path module.
        port,               // Port to listen on.
        PouchDB,            // PouchDB interface.
        requireDir,         // Directory loader.
        router,             // Express route processor.
        routes,             // Loaded route handlers.
        serveStatic,        // Express file-system serving.
        session,            // Express session management.
        TDS,                // TIBET middleware addons.
        tdsDB,              // PouchDB instance for TDS.
        urlencodedParser,   // Express body parser.
        version,            // TIBET version.
        winston;            // File-level logging.

    //  ---
    //  Logo
    //  ---

    /* eslint-disable quotes */
    logo = "\n" +
        "                                  ,`\n" +
        "                            __,~//`\n" +
        "   ,///,_            .~////////'`\n" +
        "  '///////,       //////''`\n" +
        "         '//,   ///'`\n" +
        "            '/_/'\n" +
        "              `\n" +
        "   ////////////////////   ///////////////////  ////\n" +
        "   `//'````````````///    `//'```````````````  '''\n" +
        "    /`             ///     /'\n" +
        "   //               //    //\n" +
        "   /                ///   /\n" +
        "  ,/____             //  ,/_____\n" +
        " //////////-_,_      // ,///////////,_\n" +
        "           `''//,_   '/            `'///,_\n" +
        "                `'/,_ /                 '//,\n" +
        "                   '/,/,                  '/_\n" +
        "                     `/,                   `/,\n" +
        "                       '                    `/\n" +
        "                                             /,\n" +
        "                                             `/\n" +
        "                                              /\n" +
        "                                              '";
    /* eslint-enable: quotes, no-multi-str */

    //  Log it now so the user gets immediate feedback the server is starting.
    console.log(logo);

    //  ---
    //  require()'s
    //  ---

    express = require('express');
    /* eslint-disable new-cap */
    router = express.Router();
    /* eslint-enable new-cap */

    bodyParser = require('body-parser');
    compression = require('compression');
    cookieParser = require('cookie-parser');
    csurf = require('csurf');
    helmet = require('helmet');
    http = require('http');
    io = require('socket.io');
    minimist = require('minimist');
    morgan = require('morgan');
    path = require('path');
    PouchDB = require('pouchdb');
    requireDir = require('require-dir');
    routes = requireDir('./routes');
    serveStatic = require('serve-static');
    session = require('express-session');
    TDS = require('tibet/etc/tds/tds-middleware');
    winston = require('winston');

    //  ---
    //  Argument Processing
    //  ---

    argv = minimist(process.argv.slice(2)) || {_: []};

    // Since server.js typically sits in the project root directory we can work
    // with __dirname here as a default.
    appRoot = argv.app_root || __dirname;

    // Ensure the TDS loads configuration data from our computed root.
    argv.app_root = appRoot;
    TDS.initPackage(argv);

    // Lots of options for where to get a port number but try to leverage TDS
    // first. Our IANA port is the last option.
    port = TDS.getcfg('port') ||
        TDS.getcfg('tds.port') ||
        process.env.npm_package_config_port ||
        process.env.PORT ||
        1407;

    //  ---
    //  Server Setup/Security
    //  ---

    app = express();

    //  Create parsers for body content. These are applied on a route-by-route
    //  basis to avoid conflicting with things like express-pouchdb.
    jsonParser = bodyParser.json();
    urlencodedParser = bodyParser.urlencoded({extended: false});

    // TODO: add login authentication based on params or some such.

    // Configure a basic session. We look up the secret here which allows it to
    // be set on the command line or via the project's tibet.json file.
    // TODO: warn if it's still the one coded into the library as a default
    // value.
    app.use(session({
        secret: TDS.getcfg('tds.secret'),
        resave: true,                       // TODO: remove when possible.
        saveUninitialized: true             // TODO: remove when possible.
    }));

    // TODO: activate this. for now it isn't being sent to the client in the
    // right form. we also want to be sure we cover xhrs etc.
    //app.use(csurf());

    //  ---
    //  Server Setup/Security
    //  ---

    //  TODO: Integrate winston here for file-based log rotation. Integrate with
    //  morgan to allow development logging from middleware layers.
    //  TODO: Add options control in tibet.json.
    app.use(morgan('dev', {skip: TDS.logFilter}));

    //  Express gzip compression. Send data compressed if possible including
    //  static data. Don't try to compress SSE streams tho.
    app.use(compression({filter: function(req, res) {
        if (req.headers.accept &&
                req.headers.accept === 'text/event-stream') {
            return false;
        }
        return true;
    }}));

    //  By default we assume the entire site is accessible statically. That's a
    //  side-effect of TIBET not making any assumptions about server-side logic.
    app.use(serveStatic(appRoot));

    //  Load the routes found in the route subdirectory.
    Object.keys(routes).forEach(function(route) {
        app.use('/', routes[route]);
    });

    //  ---
    //  PouchDB Integration
    //  ---

    //  TODO: probably want to support memory based option by default and
    //  include the option to simply "route through" to backend couchdb.
    //  TODO: allow the storage directory name to be set via config parameter.
    DefaultPouch = PouchDB.defaults({prefix: './pouch/'});
    app.use('/db', require('express-pouchdb')(DefaultPouch));

    tdsDB = new DefaultPouch('tds');

    //  ---
    //  Socket.io
    //  ---

    //  TODO: add websocket support so we can manage file watch events etc. in a
    //  more instantaneous fashion.

    //  TODO:   ensure any SSE code is built with awareness of the issues
    //  outlined at https://github.com/expressjs/compression#server-sent-events

    //  ---
    //  TDS Integrations
    //  ---

    // Let the client access the tibet command line functionality. Potentially
    // not secure, but at least the command being run and the command set is
    // somewhat constrained.
    if (argv.cli !== false) {
        app.post(TDS.getcfg('tds.cli.uri'), TDS.cli());
    }

    // Configure the TIBET patch handler. This will process requests from the
    // client to apply a patch to a source file, or to replace the file
    // entirely.
    if (argv.patcher !== false) {
        app.put(TDS.getcfg('tds.patch.uri'), TDS.patcher());
        app.post(TDS.getcfg('tds.patch.uri'), TDS.patcher());
        app.patch(TDS.getcfg('tds.patch.uri'), TDS.patcher());
    }

    // Configure the file watcher so changes on the server can be propogated to
    // the client. SSE must be active in the client for this to work.
    if (argv.watcher !== false) {
        app.get(TDS.getcfg('tds.watch.uri'), TDS.watcher());
    }

    // Configure the webdav component so changes in the client can be propogated
    // to the server.
    if (argv.webdav !== false) {
        app.use(TDS.getcfg('tds.webdav.uri'), TDS.webdav());
    }

    //  ---
    //  Server Fallbacks
    //  ---

    // If we're in development mode we have a few options before we cry 404.

    if (app.get('env') === 'development') {
        // TODO: load mock data paths and see if any of them match.

        // TODO: potentially generate a new route if the Sherpa is asking for
        // that by accessing an "invalid route" in a kind of lazy-author
        // fashion.
    }

    //  ---
    //  Error Handling
    //  ---

    // Serve a general 404 if no other handler too care of the request.
    app.use(function(req, res, next) {
        res.status(404).send(TDS.getcfg('tds.404'));
    });

    // Provide simple error handler middleware here.
    app.use(function(err, req, res, next) {
        console.error(err.stack);

        // TODO: dump stack/error back to the client...?
        res.status(500).send(TDS.getcfg('tds.500'));
    });


    // TODO: ? timeouts ?


    //  ---
    //  Run That Baby!
    //  ---

    http.createServer(app).listen(port);

    version = TDS.getcfg('tibet.version') || '';
    console.log('TIBET Data Server ' +
            (version ? version + ' ' : '') +
            'running at http://127.0.0.1' +
        (port === 80 ? '' : ':' + port));

    //console.log(app._router.stack);
}());

