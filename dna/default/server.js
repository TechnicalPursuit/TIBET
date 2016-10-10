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
        argv,               // The argument list.
        env,                // Current execution environment.
        express,            // Express web framework.
        fs,                 // File system module.
        path,               // Path utility module.
        http,               // Web server baseline.
        https,              // Secure server baseline.
        logger,             // Configured logger instance.
        logo,               // Text logo.
        minimist,           // Argument processing.
        options,            // Common options block.
        protocol,           // HTTP or HTTPS.
        port,               // Port to listen on.
        useHttps,           // Should this be an HTTPS server.
        httpsOpts,          // Options for HTTPS server.
        certPath,           // Directory containing cert data.
        certKey,            // Name of the key file for certs.
        certFile,           // Name of the certificate file.
        project,            // Project name.
        TDS,                // TIBET Data Server baseline.
        plugins,            // TDS server plugin list to load.
        version;            // TIBET version.

    //  ---
    //  Logo
    //  ---

    /* eslint-disable quotes */
    logo = "\n" +
        "                            ,`\n" +
        "                     __,~//`\n" +
        "  ,///,_       .~///////'`\n" +
        "      '//,   ///'`\n" +
        "         '/_/'\n" +
        "           `\n" +
        "   /////////////////     /////////////// ///\n" +
        "   `//'````````///      `//'```````````  '''\n" +
        "   ,/`          //      ,/'\n" +
        "  ,/___          /'    ,/_____\n" +
        " ///////;;,_     //   ,/////////;,_\n" +
        "          `'//,  '/            `'///,_\n" +
        "              `'/,/                '//,\n" +
        "                 `/,                  `/,\n" +
        "                   '                   `/\n" +
        "                                        '/\n" +
        "                                         /\n" +
        "                                         '";
    /* eslint-enable: quotes, no-multi-str */

    //  ---
    //  Baseline require()'s
    //  ---

    express = require('express');
    http = require('http');
    https = require('https');
    minimist = require('minimist');
    fs = require('fs');
    path = require('path');

    //  Always bring in the baseline TDS, even if we don't load the 'tds' plugin
    //  (which loads any tds.plugins.tds list which might be defined). This
    //  gives access to utilities like getcfg etc.
    TDS = require('tibet/etc/tds/tds_base');

    //  ---
    //  APP/TDS Config
    //  ---

    //  Create app instance and capture the environment data from it.
    app = express();
    env = app.get('env');

    //  Parse command line arguments, leveraging TDS default parse options.
    argv = minimist(process.argv.slice(2), TDS.PARSE_OPTIONS) || {_: []};

    //  Map the defaulted environment from Express into our argument list. This
    //  will be used by the TDS initialization which may access both.
    argv.env = argv.env || env;

    //  Configure the TDS's underlying TIBET Package instance. This instance is
    //  how we access all of TIBET's configuration data and functionality.
    TDS.initPackage(argv);

    //  Log it now so the user gets immediate feedback the server is starting.
    console.log(TDS.colorize(logo, 'logo'));

    //  Map TDS and app to each other so they have easy access to configuration
    //  data or other functionality.
    app.TDS = TDS;
    TDS.app = app;

    //  Ensure we update the HTTPS settings before we load any plugins.
    useHttps = TDS.isValid(argv.https) ? argv.https : TDS.getcfg('tds.https');
    TDS.setcfg('tds.https', useHttps);

    //  ---
    //  Plugins
    //  ---

    //  Note that TDS properties are adjusted by environment so this can cause a
    //  different configuration between development and prod (no mocks etc).
    plugins = TDS.getcfg('tds.plugins.core');
    if (!plugins) {
        plugins = [
            'body-parser',
            'logger',
            'compression',
            'reconfig',
            'public-static',
            'session',
            'security',
            'view-engine',
            'authenticate',
            'private-static',
            'routes',
            'tds',
            'proxy',
            'fallback',
            'errors'];
    }

    //  Shared options which allow modules to essentially share values like the
    //  logger, authentication handler, etc.
    options = {app: app, argv: argv, env: env};

    require('./plugins/preload')(options);

    plugins.forEach(function(plugin) {
        var fullpath;

        fullpath = path.join(__dirname, 'plugins', plugin);

        require(fullpath)(options);
    });

    //  ---
    //  Post-Plugins
    //  ---

    logger = options.logger;

    //  ---
    //  Backstop
    //  ---

    //  Always maintain at least the uncaught exception handler. If the consumer
    //  puts one onto the shared options object use that, otherwise use default.
    process.on('uncaughtException', options.uncaughtException || function(err) {
        var stack;

        //  These happen due to mal-ordered middleware but they log and we
        //  shouldn't be killing the server over it.
        if (err.message && err.message.indexOf(
            'headers after they are sent') !== -1) {
            return;
        }

        //  These happen due to port defaults below 1024 (which require perms)
        if (err.message && err.message.indexOf('EACCES') !== -1 && port <= 1024) {
            logger.error('Possible permission error for server port: ' + port);
        } else if (app.get('env') === 'development') {
            stack = err.stack || '';
            logger.error('Uncaught: \n' + stack.replace(/\\n/g, '\n'));
        } else {
            logger.error('Uncaught: \n' + err.message);
        }

        if (TDS.cfg('tds.stop_onerror')) {
            /* eslint-disable no-process-exit */
            process.exit(1);
            /* eslint-enable no-process-exit */
        }
    });

    //  ---
    //  Run That Baby!
    //  ---

    require('./plugins/prestart')(options);

    //  Lots of options for where to get a port number but try to leverage TDS
    //  first. Our registered IANA port is the last option and is hard-coded.
    port = argv.port || TDS.cfg('tds.port') || TDS.cfg('port') ||
        process.env.npm_package_config_port ||
        process.env.PORT ||
        1407;   //  registered TIBET Data Server port.

    //  Update to set the current runtime value to reflect actual port.
    TDS.setcfg('tds.port', port);

    //  Default to https for the site and require it to be forced off via flag.

    if (useHttps) {
        protocol = 'https';

        certPath = TDS.getcfg('tds.cert.path') || 'etc';
        certKey = TDS.getcfg('tds.cert.key') || 'ssl.key';
        certFile = TDS.getcfg('tds.cert.file') || 'ssl.crt';

        httpsOpts = {
            key: fs.readFileSync(path.join(certPath, certKey)),
            cert: fs.readFileSync(path.join(certPath, certFile))
        };

        http.createServer(app).listen(port);

        port = argv.https_port ||
            TDS.cfg('tds.https_port') || TDS.cfg('https_port') ||
            process.env.HTTPS_PORT ||
            443;   //  default https port
        https.createServer(httpsOpts, app).listen(port);

    } else {
        protocol = 'http';
        http.createServer(app).listen(port);
    }

    env = argv.env;

    project = TDS.colorize(TDS.cfg('npm.name') || '', 'project');
    project += ' ' + TDS.colorize(TDS.cfg('npm.version') || '0.0.1', 'version');

    version = TDS.cfg('tibet.version') || '';

    logger.info(project +
            TDS.colorize(' (', 'dim') +
            TDS.colorize(env, 'env') +
            TDS.colorize(') running on ', 'dim') +
            TDS.colorize('TIBET ' + (version ? version + ' ' : ''), 'version') +
            TDS.colorize('at ', 'dim') +
            TDS.colorize(protocol + '://127.0.0.1' + (port === 80 ? '' : ':' + port), 'url'));

    //  For debugging purposes it can be helpful to see which routes are
    //  actually loaded and active.
    if (TDS.cfg('tds.log.routes')) {
        logger.debug(app._router.stack);
    }

    require('./plugins/poststart')(options);

}());
