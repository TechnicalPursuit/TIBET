/**
 * @overview An optional server for TIBET development and deployment. The TIBET
 *     Data Server (TDS) provides a number of features to make development
 *     faster and more fluid including support for live sourcing and storing
 *     client-side changes back to the server. Additional middleware specific to
 *     working with CouchDB, including support for the CouchDB changes feed,
 *     lets you create powerful CouchDB-backed applications with minimal effort.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
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
        cookieKey,          // Key for cookie configuration.
        cookieParser,       // Express cookie parser.
        engine,             // Which view engine to use?
        env,                // Current execution environment.
        express,            // Express web framework.
        helmet,             // Security blanket.
        http,               // Web server baseline.
        jsonParser,         // Express body parser.
        logcolor,           // Should console log be colorized.
        logcount,           // The app log file count.
        logfile,            // The app log file.
        logformat,          // The morgan format to log with.
        logsize,            // The app log file size per file.
        loggedIn,           // Helper function for passport.
        logger,             // The app logger instance.
        logo,               // Text logo.
        minimist,           // Argument processing.
        morgan,             // Express request logger.
        passport,           // Passport authentication plugin.
        path,               // The path module.
        port,               // Port to listen on.
        project,            // Project name.
        requireDir,         // Directory loader.
        root,               // Root directory for static files.
        router,             // Express route processor.
        routes,             // Loaded route handlers.
        secretKey,          // Secrete key value.
        session,            // Express session management.
        sessionKey,         // Session key value.
        store,              // Session store.
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

    minimist = require('minimist');

    session = require('express-session');
    helmet = require('helmet');

    bodyParser = require('body-parser');
    cookieParser = require('cookie-parser');
    compression = require('compression');

    morgan = require('morgan');
    winston = require('winston');

    requireDir = require('require-dir');
    routes = requireDir('./routes');

    TDS = require('tibet/etc/tds/tds-couch');

    //  ---
    //  APP/TDS Config
    //  ---

    //  Create app instance and capture the environment data from it.
    app = express();
    env = app.get('env');

    //  Parse command line arguments, leveraging TDS default parse options.
    argv = minimist(process.argv.slice(2), TDS.PARSE_OPTIONS) || {_: []};

    //  Map the defaulted environment from Express into our argument list.
    argv.env = argv.env || env;

    //  Configure the TDS's underlying TIBET Package instance. This instance is
    //  how we access all of TIBET's configuration data and functionality.
    TDS.initPackage(argv);

    //  Map TDS slot onto app instance for reference during plugin loading and
    //  configuration. This provides plugins access to TIBET config data.
    app.TDS = TDS;

    //  ---
    //  Parsers
    //  ---

    //  Create parsers for body content. These are applied on a route-by-route
    //  basis to avoid conflicting with things like express-pouchdb.
    bodyLimit = TDS.cfg('tds.max_bodysize') || '5mb';
    jsonParser = bodyParser.json({limit: bodyLimit});
    urlencodedParser = bodyParser.urlencoded({
        extended: false,        //  TODO: why not true?
        limit: bodyLimit
    });

    //  TODO: revisit how to properly configure these without causing the
    //        pouchdb option to fail.
    app.use(jsonParser);
    app.use(urlencodedParser);

    //  ---
    //  Logging
    //  ---

    //  TODO:   externalize

    winston.emitErrs = true;
    winston.level = TDS.cfg('tds.log.level') || 'info';

    logcolor = TDS.cfg('tds.log.color');
    if (logcolor === undefined || logcolor === null) {
        logcolor = true;
    }
    logcount = TDS.cfg('tds.log.count') || 5;
    logfile = TDS.expandPath(TDS.cfg('tds.log.file')) || './log/tds.log';
    logformat = TDS.cfg('tds.log.format') || 'dev';
    logsize = TDS.cfg('tds.log.size') || 5242880;

    logger = new winston.Logger({
        transports: [
            new winston.transports.File({
                level: winston.level,
                filename: logfile,
                maxsize: logsize,
                maxFiles: logcount,
                handleExceptions: true,
                json: true,         //  json is easier to parse with tools
                colorize: false     //  always false into the log file.
            }),
            new winston.transports.Console({
                level: winston.level,
                colorize: logcolor,
                handleExceptions: true,
                json: false,    //  json is harder to read in terminal output
                eol: ' '   // Remove EOL newlines. Not '' or won't be used.
            })
        ],
        exitOnError: false
    }),

    //  Additional trimming here to help support blending morgan and winston and
    //  not ending up with too many newlines in the output stream.
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

    //  Merge in the morgan request logger and direct it to the winston stream.
    app.use(morgan(logformat, {
        skip: TDS.logFilter,
        stream: logger.stream
    }));

    //  Map logger onto the app so req.app.logger can be used in middleware.
    app.logger = logger;

    //  ---
    //  Compression
    //  ---

    //  TODO:   externalize and show sample of filtering.

    //  Express gzip compression. Send data compressed if possible.
    app.use(compression());

    //  ---
    //  Static (wo/Login)
    //  ---

    //  TODO    externalize

    //  Get the application root. This will limit the scope of the files we
    //  serve and provide a root for accessing application resources.
    appRoot = TDS.expandPath(TDS.getAppRoot());

    //  The following paths are leveraged by the login page, even if there's
    //  been no code loaded yet, and by the initial startup sequence in the case
    //  of the TIBET library which simply avoids a ton of deserialization of the
    //  user object to confirm login.
    root = path.join(appRoot, 'TIBET-INF');
    app.use('/TIBET-INF', express.static(root));

    root = path.join(appRoot, 'tibet.json');
    app.use('/tibet.json', express.static(root));

    root = path.join(appRoot, 'styles');
    app.use('/styles', express.static(root));

    root = path.join(appRoot, 'media');
    app.use('/media', express.static(root));

    //  ---
    //  Sessions
    //  ---

    //  TODO: update cfg key names for these. probably need tds.cookie.*,
    //  tds.session.* etc.

    //  NOTE:   this must be initialized before any session is.
    cookieKey = TDS.cfg('tds.cookie') || 'T1B3TC00K13';
    app.use(cookieParser(sessionKey));

    //  Require in the session store, allowing it to be separately configured
    //  for MemoryStore, Redis, Couch, etc.
    store = require('./plugins/store');

    sessionKey = TDS.cfg('tds.session') || 'T1B3TS3SS10N';
    secretKey = TDS.cfg('tds.secret') || 'ThisIsNotSecureChangeIt';

    //  TODO    externalize
    //  Configure a simple memory session by default.
    app.use(session({
        secret: secretKey,
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            secure: false,  //  Only for HTTPS
            httpOnly: true
        }
    }));

    //  ---
    //  Security
    //  ---

    //  TODO    externalize

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

    // ---
    // Views
    // ---

    engine = require('./plugins/engine');
    engine.configure(app);

    // ---
    // Login
    // ---

    passport = require('./plugins/passport');
    passport.configure(app);

    //  TODO:   move this to the passport module or other location.
    loggedIn = function(req, res, next) {

        if (req.isAuthenticated() || TDS.cfg('boot.use_login') === false) {
            return next();
        }

        res.redirect('/');
    }

    //  ---
    //  Static (w/Login)
    //  ---

    //  TODO    externalize
    //  Force logins for any remaining paths under application root.
    app.use('/', loggedIn, express.static(appRoot));

    //  ---
    //  Mocks
    //  ---

    //  TODO    externalize
    //  If we're running in development we have a second set of potential routes
    //  we can either load or generate to allow for mock static data and/or mock
    //  route processing.
    if (app.get('env') === 'development') {
        //  TODO: load mock data paths and see if any of them match.

        //  TODO: potentially generate a new route if the Sherpa is asking for
        //  that by accessing an "invalid route" in a kind of lazy-author
        //  fashion.
    }

    //  ---
    //  Routes
    //  ---

    //  TODO    externalize
    //  Load the routes found in the route subdirectory.
    Object.keys(routes).forEach(function(route) {
        app.use('/', routes[route]);
    });

    //  ---
    //  TDS Integrations
    //  ---

    //  TODO    externalize

    //  Should we add a route for driving the tibet command line tools from the
    //  client? Off by default for profiles other than 'development'.
    if (TDS.cfg('tds.use.cli') === true) {
        app.post(TDS.cfg('tds.cli.uri'), loggedIn, TDS.cli());
    }

    //  Should we add routes for source-code patch processor? Off by default for
    //  profiles other than 'development'.
    if (TDS.cfg('tds.use.patcher') === true) {
        app.put(TDS.cfg('tds.patch.uri'), loggedIn, TDS.patcher());
        app.post(TDS.cfg('tds.patch.uri'), loggedIn, TDS.patcher());
        app.patch(TDS.cfg('tds.patch.uri'), loggedIn, TDS.patcher());
    }

    //  Activate the file watcher? Used to drive live-syncing functionality. Off
    //  by default for profiles other than 'development'.
    if (TDS.cfg('tds.use.watcher') === true) {
        app.get(TDS.cfg('tds.watch.uri'), loggedIn, TDS.watcher());
    }

    //  Turn on support for webdav verbs? Off by default for profiles other than
    //  'development' since this adds PUT, DELETE, etc.
    if (TDS.cfg('tds.use.webdav') === true) {
        app.use(TDS.cfg('tds.webdav.uri'), loggedIn, TDS.webdav());
    }

    //  Activate the CouchDB integration layer.
    TDS.couchdb({
        app: app,
        env: env,
        argv: argv
    });

    //  ---
    //  Fallbacks
    //  ---

    //  TODO    externalize
    //  Serve a general 404 if no other handler too care of the request.
    app.get('/*', function(req, res, next) {
        res.status(404).render('404', {error:
            req.url + ' not found.'});
    });

    //  ---
    //  Errors
    //  ---

    //  TODO    externalize
    //  Internal server error handler. Just render the 500 template.
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.status(500).render('500', {error: err});
    });


    //  Handler for process-level exceptions. Dump stack and exit.
    process.on('uncaughtException', function(err) {

        //  These happen due to mal-ordered middleware but they log and we
        //  shouldn't be killing the server over it.
        if (err.message && err.message.indexOf(
            'headers after they are sent') !== -1) {
            return;
        }

        console.error('Process error: \n' + err.stack);
        process.exit(1);
    });

    //  ---
    //  Run That Baby!
    //  ---

    //  TODO:   pre-startup hook

    //  Lots of options for where to get a port number but try to leverage TDS
    //  first. Our registered IANA port is the last option and is hard-coded.
    port = TDS.cfg('tds.port') || TDS.cfg('port') ||
        process.env.npm_package_config_port ||
        process.env.PORT ||
        1407;   //  registered TIBET Data Server port.

    http.createServer(app).listen(port);

    //  TODO:   startup hook
    env = argv.env;
    project = TDS.cfg('npm.name') || '';
    project += ' ' + TDS.cfg('npm.version') || '0.0.1';

    version = TDS.cfg('tibet.version') || '';

    console.log(project + ' (' + env + ') running on ' +
            'TIBET ' + (version ? version + ' ' : '') +
            'at http://127.0.0.1' +
        (port === 80 ? '' : ':' + port));

    //  TODO:   post-startup hook
    //  For debugging purposes it can be helpful to see which routes are
    //  actually loaded and active.
    if (TDS.cfg('tds.log.routes')) {
        console.log(app._router.stack);
    }
}());

