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
        http,               // Web server baseline.
        logger,             // Configured logger instance.
        logo,               // Text logo.
        minimist,           // Argument processing.
        options,            // Common options block.
        port,               // Port to listen on.
        project,            // Project name.
        TDS,                // TIBET Data Server baseline.
        version;            // TIBET version.

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

    express = require('express');
    http = require('http');
    minimist = require('minimist');

    TDS = require('tibet/etc/tds/tds-base');

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

    //  Map TDS slot onto app instance for reference during plugin loading and
    //  configuration. This provides plugins access to TIBET config data.
    app.TDS = TDS;

    //  ---
    //  Plugins
    //  ---

    //  Shared options which allow modules to essentially share values like the
    //  logger, authentication handler, etc.
    options = {app: app, argv: argv};

    require('./plugins/body-parser')(options);

    require('./plugins/logger')(options);

    require('./plugins/compression')(options);

    require('./plugins/public-static')(options);

    require('./plugins/session')(options);

    require('./plugins/security')(options);

    require('./plugins/view-engine')(options);

    require('./plugins/authenticate')(options);

    require('./plugins/private-static')(options);

    require('./plugins/mocks')(options);

    require('./plugins/routes')(options);

    require('./plugins/pouchdb')(options);

    require('./plugins/tds')(options);

    require('./plugins/fallback')(options);

    require('./plugins/errors')(options);

    //  ---
    //  Post-Plugins
    //  ---

    logger = options.logger;

    //  ---
    //  Backstop
    //  ---

    //  Always maintain at least the uncaught exception handler internally.
    process.on('uncaughtException', function(err) {

        //  These happen due to mal-ordered middleware but they log and we
        //  shouldn't be killing the server over it.
        if (err.message && err.message.indexOf(
            'headers after they are sent') !== -1) {
            return;
        }

        logger.error('Process error: \n' + err.stack);

        if (TDS.cfg('tds.stop_onerror')) {
            process.exit(1);
        }
    });

    //  ---
    //  Run That Baby!
    //  ---

    require('./plugins/prestart')(options);

    //  Lots of options for where to get a port number but try to leverage TDS
    //  first. Our registered IANA port is the last option and is hard-coded.
    port = TDS.cfg('tds.port') || TDS.cfg('port') ||
        process.env.npm_package_config_port ||
        process.env.PORT ||
        1407;   //  registered TIBET Data Server port.

    http.createServer(app).listen(port);

    env = argv.env;
    project = TDS.cfg('npm.name') || '';
    project += ' ' + TDS.cfg('npm.version') || '0.0.1';

    version = TDS.cfg('tibet.version') || '';

    logger.info(project + ' (' + env + ') running on ' +
            'TIBET ' + (version ? version + ' ' : '') +
            'at http://127.0.0.1' +
        (port === 80 ? '' : ':' + port));

    //  For debugging purposes it can be helpful to see which routes are
    //  actually loaded and active.
    if (TDS.cfg('tds.log.routes')) {
        logger.debug(app._router.stack);
    }

    require('./plugins/poststart')(options);

}());

