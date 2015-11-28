/**
 * @overview An optional server for TIBET development and deployment. The TIBET
 *     Data Server (TDS) provides a number of features to make development
 *     faster and more fluid including support for live sourcing and storing
 *     client-side changes back to the server. The TDS is also engineered to be
 *     a complementary server to a TIBET client in that it focuses on serving
 *     data, not "pages", in a purely RESTful fashion.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*
 * Parameters:
 *
 *  --tds.use.cli               // Defaults to false.
 *  --tds.use.patcher           // Defaults to false.
 *  --tds.use.watcher           // Defaults to false.
 *  --tds.use.webdav            // Defaults to false.
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

/* eslint-disable no-console */

(function() {

    'use strict';

    var app,                // Express application instance.
        appRoot,            // Computed TIBET application root.
        argv,               // The argument list.
        bodyLimit,          // Max size of body content.
        bodyParser,         // Express body parser.
        compression,        // Express gzip/compression.
        cookieParser,       // Express cookie parser.
        env,                // Current execution environment.
        express,            // Express web framework.
        helmet,             // Security blanket.
        http,               // Web server baseline.
        jsonParser,         // Express body parser.
        logger,             // The app logger instance.
        logfile,            // The app log file.
        logformat,          // The morgan format to log with.
        logo,               // Text logo.
        minimist,           // Argument processing.
        mocks,              // Mock data file references.
        morgan,             // Express request logger.
        path,               // The path module.
        port,               // Port to listen on.
        project,            // Project name.
        requireDir,         // Directory loader.
        router,             // Express route processor.
        routes,             // Loaded route handlers.
        serveStatic,        // Express file-system serving.
        session,            // Express session management.
        sessionKey,         // Unique session salt value.
        TDS,                // TIBET middleware addons.
        urlencodedParser,   // Express body parser.
        version,            // TIBET version.
        winston;            // Appender-supported logging.

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
        "    ////////////////////     ///////////////////  ////\n" +
        "    `//'````````````///      `//'```````````````  '''\n" +
        "     /`              //       /'\n" +
        "    /                //      '/\n" +
        "   ,/____             /'    ,/_____\n" +
        "  /////////;;,,_      //   ,//////////;,_\n" +
        "              `'/,_   '/              `'///,_\n" +
        "                 `'/,_ /                   '//,\n" +
        "                    '/,/,                    '/_\n" +
        "                      `/,                     `/,\n" +
        "                        '                      `/\n" +
        "                                               '/\n" +
        "                                                /";
    /* eslint-enable: quotes, no-multi-str */

    //  Log it now so the user gets immediate feedback the server is starting.
    console.log(logo);

    //  ---
    //  Baseline require()'s
    //  ---

    http = require('http');
    path = require('path');

    express = require('express');
    /* eslint-disable new-cap */
    router = express.Router();
    /* eslint-enable new-cap */

    bodyParser = require('body-parser');
    compression = require('compression');
    cookieParser = require('cookie-parser');
    serveStatic = require('serve-static');
    session = require('express-session');
    morgan = require('morgan');
    winston = require('winston');

    helmet = require('helmet');

    minimist = require('minimist');

    requireDir = require('require-dir');
    routes = requireDir('./routes');

    TDS = require('tibet/etc/tds/tds-middleware');

    //  ---
    //  Environment base
    //  ---

    app = express();
    env = app.get('env');

    //  ---
    //  Argument Processing
    //  ---

    //  NOTE we parse here leveraging the parse options for the TDS middleware.
    //  These may need to be adjusted for custom flag support.
    argv = minimist(process.argv.slice(2), TDS.PARSE_OPTIONS) || {_: []};

    //  Pass in the defaulted environment from Express.
    argv.env = argv.env || env;

    //  Get the package configuration set up and access it for app_root value.
    //  This will often be provided as a virtual path so be sure to expand.
    TDS.initPackage(argv);
    appRoot = TDS.expandPath(TDS.getAppRoot());

    //  Lots of options for where to get a port number but try to leverage TDS
    //  first. Our IANA port is the last option.
    port = TDS.cfg('tds.port') || TDS.cfg('port') ||
        process.env.npm_package_config_port ||
        process.env.PORT ||
        1407;   //  registered TIBET Data Server port.

    sessionKey = TDS.cfg('tds.session_key') || 'ThisIsNotSecure';

    winston.level = argv.debug ? 'debug' : TDS.cfg('tds.log.level');

    //  ---
    //  Basic Parsers
    //  ---

    //  Create parsers for body content. These are applied on a route-by-route
    //  basis to avoid conflicting with things like express-pouchdb.
    bodyLimit = TDS.cfg('tds.max_bodysize') || '5mb';
    jsonParser = bodyParser.json({limit: bodyLimit});
    urlencodedParser = bodyParser.urlencoded({
        extended: false,        //  TODO: why not true?
        limit: bodyLimit
    });

    app.use(jsonParser);
    app.use(urlencodedParser);
    app.use(cookieParser(sessionKey));

    //  ---
    //  Logging
    //  ---

    winston.emitErrs = true;
    logfile = TDS.expandPath(TDS.cfg('tds.log.file'));
    logformat = TDS.cfg('tds.log.format');

    logger = new winston.Logger({
        transports: [
            new winston.transports.File({
                level: winston.level,
                filename: logfile,
                handleExceptions: true,
                json: false,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: false
            }),
            new winston.transports.Console({
                level: winston.level,
                handleExceptions: true,
                json: false,
                eol: ' ',
                colorize: true
            })
        ],
        exitOnError: false
    }),

    logger.stream = {
        write: function(message, encoding) {
            var msg;

            msg = message;
            while (msg.charAt(msg.length - 1) === '\n') {
                msg = msg.slice(0, -1);
            }
            logger.info(msg);
        }
    };

    app.use(morgan(logformat, {
        skip: TDS.logFilter,
        stream: logger.stream
    }));

    app.logger = logger;

    // ---
    // Login
    // ---

    //  TODO: add login authentication (see passport.js).

    //  Configure a basic session. We look up the secret here which allows it to
    //  be set on the command line or via the project's tibet.json file.
    app.use(session({
        secret: TDS.cfg('tds.secret'),
        resave: true,
        saveUninitialized: true
    }));

    //  ---
    //  Server Security
    //  ---

    app.use(helmet.hidePoweredBy());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noCache());
    app.use(helmet.noSniff());
    app.use(helmet.frameguard('sameorigin'));
    app.use(helmet.xssFilter());

    //  Should be more configurable. This is just a placeholder for now.
    app.use(helmet.contentSecurityPolicy({
        reportUri: '/',
        reportOnly: true
    }));

    //  Should be more configurable. These are disabled by default.
    //app.use(helmet.hpkp());
    //app.use(helmet.hsts());

    //  ---
    //  Server Setup
    //  ---

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
    //  TDS Integrations
    //  ---

    //  Let the client access the tibet command line functionality. Potentially
    //  not secure, but at least the command being run and the command set is
    //  somewhat constrained.
    if (TDS.cfg('tds.use.cli') === true) {
        app.post(TDS.cfg('tds.cli.uri'), TDS.cli());
    }

    //  Configure the TIBET patch handler. This will process requests from the
    //  client to apply a patch to a source file, or to replace the file
    //  entirely.
    if (TDS.cfg('tds.use.patcher') === true) {
        app.put(TDS.cfg('tds.patch.uri'), TDS.patcher());
        app.post(TDS.cfg('tds.patch.uri'), TDS.patcher());
        app.patch(TDS.cfg('tds.patch.uri'), TDS.patcher());
    }

    //  Configure the file watcher so changes on the server can be propogated to
    //  the client. SSE must be active in the client for this to work.
    if (TDS.cfg('tds.use.watcher') === true) {
        app.get(TDS.cfg('tds.watch.uri'), TDS.watcher());
    }

    //  Configure the webdav component so changes in the client can be
    //  propogated to the server.
    if (TDS.cfg('tds.use.webdav') === true) {
        app.use(TDS.cfg('tds.webdav.uri'), TDS.webdav());
    }

    //  ---
    //  Server Fallbacks
    //  ---

    //  If we're in development mode we have a few options before we cry 404.

    if (app.get('env') === 'development') {
        //  TODO: load mock data paths and see if any of them match.

        //  TODO: potentially generate a new route if the Sherpa is asking for
        //  that by accessing an "invalid route" in a kind of lazy-author
        //  fashion.
    }

    //  Serve a general 404 if no other handler too care of the request.
    app.use(function(req, res, next) {
        res.status(404).send(TDS.cfg('tds.404'));
    });

    //  ---
    //  Error Handling
    //  ---

    //  Provide simple error handler middleware here.
    app.use(function(err, req, res, next) {
        console.error(err.stack);

        //  TODO: dump stack/error back to the client...?
        res.status(500).send(TDS.cfg('tds.500'));
    });


    //  TODO: ? timeouts ?


    //  ---
    //  Run That Baby!
    //  ---

    http.createServer(app).listen(port);

    env = argv.env;
    project = TDS.cfg('npm.name') || '';
    project += ' ' + TDS.cfg('npm.version') || '0.0.1';

    version = TDS.cfg('tibet.version') || '';

    console.log(project + ' (' + env + ') running on ' +
            'TIBET ' + (version ? version + ' ' : '') +
            'at http://127.0.0.1' +
        (port === 80 ? '' : ':' + port));

    //  uncomment to view final route configuration
    //console.log(app._router.stack);
}());

