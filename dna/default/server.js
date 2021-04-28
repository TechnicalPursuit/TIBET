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

/* eslint-disable no-console, no-process-exit */

(function() {

    'use strict';

    var app,                // Express application instance.
        argv,               // The argument list.
        certFile,           // Name of the certificate file.
        certKey,            // Name of the key file for certs.
        certPath,           // Directory containing cert data.
        sslErrMsg,          // SSL Error msg containing useful information.
        key,                // The key file data.
        cert,               // The cert file data.
        env,                // Current execution environment.
        express,            // Express web framework.
        fs,                 // File system module.
        http,               // Web server baseline.
        https,              // Secure server baseline.
        httpsOpts,          // Options for HTTPS server.
        logger,             // Configured logger instance.
        meta,               // Logger metadata.
        minimist,           // Argument processing.
        options,            // Common options block.
        plugins,            // TDS server plugin list to load.
        port,               // Port to listen on.
        protocol,           // HTTP or HTTPS.
        TDS,                // TIBET Data Server baseline.
        shutdown,           // Shutdown hook function.
        exitSoon,           // Exit hook function.
        called,             // Trap in shutdown to avoid running twice.
        useHttps;           // Should this be an HTTPS server.

    //  ---
    //  Baseline require()'s
    //  ---

    express = require('express');
    http = require('http');
    https = require('https');
    minimist = require('minimist');
    fs = require('fs');

    //  Always bring in the baseline TDS, even if we don't load the 'tds' plugin
    //  (which loads any tds.plugins.tds list which might be defined). This
    //  gives access to utilities like getcfg etc.
    TDS = require('tibet').TDS;

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
    env = argv.env;
    app.set('env', env);

    //  Configure the TDS's underlying TIBET Package instance. This instance is
    //  how we access all of TIBET's configuration data and functionality.
    TDS.initPackage(argv);

    //  Write the server announcement string.
    TDS.announceTIBET(env);

    //  Map TDS and app to each other so they have easy access to configuration
    //  data or other functionality.
    app.TDS = TDS;
    TDS.app = app;

    //  Ensure we update the HTTPS settings before we load any plugins.
    useHttps = TDS.isValid(argv.https) ? argv.https : TDS.getcfg('tds.https');
    TDS.setcfg('tds.https', useHttps);

    protocol = useHttps ? 'https' : 'http';

    //  Configure common error reporting metadata so we style properly.
    meta = {
        comp: 'TDS',
        type: 'tds',
        name: 'server',
        style: 'error'
    };

    //  ---
    //  Serious Shutdown Hook
    //  ---

    exitSoon = function(code, str, opts) {
        setTimeout(() => {
            var msg;

            msg = str || 'shutdown complete';
            TDS.logger.system(msg, meta);
            if (!TDS.hasConsole()) {
                process.stdout.write(TDS.colorize(msg, 'error') + '\n');
            }

            if (TDS.logger.flush) {
                TDS.logger.flush(true);
            }
        }, TDS.getcfg('tds.shutdown_timeout'));

        setTimeout(() => {
            process.exit(code);
        }, TDS.getcfg('tds.shutdown_timeout') + 100);

        return;
    };

    //  ---
    //  Middleware
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
            'user',
            'proxy',
            'fallback',
            'errors'];
    }

    //  Shared options which allow modules to essentially share values like the
    //  logger, authentication handler, etc.
    options = {
        app: app,
        argv: argv,
        env: env
    };

    //  Should always be a preload plugin we can load/run ourselves.
    require(TDS.joinPaths(__dirname, 'plugins', 'preload'))(options);

    //  Some environments will use HTTPS in front and HTTP behind, meaning the
    //  server doesn't know it's HTTPS but it should force redirects that way.
    if (!TDS.getcfg('tds.https') && TDS.getcfg('tds.secure_requests')) {
        app.use(function(req, res, next) {
            if (req.header('x-forwarded-proto') !== 'https') {
                res.redirect('https://' + req.header('host') + req.url);
            } else {
                next();
            }
        });
    }

    //  Trigger loading of all the individual plugins in the list.
    TDS.loadPlugins(TDS.joinPaths(__dirname, 'plugins'), plugins, options);

    //  Capture logger reference now that plugins have loaded.
    logger = options.logger;
    if (!logger) {
        console.error('missing critical logger middleware or export.');
        console.error('shutting down server');
        return exitSoon(1);
    }

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

        if (err.message && err.message.indexOf('EACCES') !== -1 && port <= 1024) {
            //  These happen due to port defaults below 1024 (which require perms)
            console.error('Possible permission error for server port: ' + port);
            //  NOTE: Do *not* replace this with exitSoon.
            setTimeout(() => {
                process.exit(1);
            }, 10);
            return;
        } else if (err.message && err.message.indexOf('EADDRINUSE') !== -1) {
            //  These happen because you forget you're already running one.
            console.error('Server start failed. Port ' + (err.port || port) +
                ' is busy.');
            //  NOTE: Do *not* replace this with exitSoon.
            setTimeout(() => {
                process.exit(1);
            }, 10);
            return;
        } else if (app.get('env') === 'development') {
            stack = err.stack || '';
            TDS.logger.error('Uncaught: \n' + stack.replace(/\\n/g, '\n'), meta);
        } else {
            TDS.logger.error('Uncaught: \n' + err.message, meta);
        }

        if (TDS.logger.flush) {
            TDS.logger.flush(true);
        }

        if (TDS.cfg('tds.stop_onerror')) {
            return exitSoon(1);
        }
    });

    //  ---
    //  Graceful Shutdown Hook
    //  ---

    called = false;
    shutdown = function() {
        var msg,
            code;

        if (called) {
            return;
        }
        called = true;

        msg = 'processing shutdown request';

        TDS.logger.system(' ');    //  blank to get past ctrl char etc.
        TDS.logger.system(msg, meta);
        if (!TDS.hasConsole()) {
            process.stdout.write(TDS.colorize(msg, 'error') + '\n');
        }

        msg = 'shutting down ' + protocol.toUpperCase() + ' server';
        TDS.logger.system(msg, meta);
        if (!TDS.hasConsole()) {
            process.stdout.write(TDS.colorize(msg, 'error') + '\n');
        }

        //  This will get us a viable return code.
        code = TDS.shutdown(null, meta);

        //  If we never really got going...
        if (!TDS.httpServer && !TDS.httpsServer) {
            return exitSoon(1);
        }

        TDS[protocol + 'Server'].close(function(err) {
            if (err) {
                msg = protocol.toUpperCase() + ' server: ' + err.message;
                TDS.logger.error(msg, meta);
                if (!TDS.hasConsole()) {
                    process.stderr.write(TDS.colorize(msg, 'error') + '\n');
                }
            }

            return exitSoon(code, msg);
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGHUP', shutdown);
    process.on('SIGQUIT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('exit', shutdown);

    //  ---
    //  Run That Baby!
    //  ---

    require('./plugins/prestart')(options);

    //  Lots of options for where to get a port number but rely on arg list,
    //  env settings, and then cfg data. Our registered IANA port is the last
    //  option and is hard-coded.
    port = argv.port || process.env.PORT ||
        TDS.cfg('tds.port') || TDS.cfg('port') ||
        process.env.npm_package_config_port ||
        1407;   //  registered TIBET Data Server port.

    //  Update to set the current runtime value to reflect actual port.
    TDS.setcfg('tds.port', port);

    //  Default to https for the site and require it to be forced off via flag.
    if (useHttps) {
        certPath = TDS.getcfg('tds.cert.path') || '~/etc';
        certKey = TDS.getcfg('tds.cert.key') || 'ssl.key';
        certFile = TDS.getcfg('tds.cert.file') || 'ssl.crt';

        sslErrMsg = `
            You can generate a self-signed certificate for local development
            by following the guidelines at:

            https://letsencrypt.org/docs/certificates-for-localhost/

            Place the resulting cert/key files in a directory in your TIBET
            project such as ~/etc and set the TIBET configuration values for

                'tds.cert.path' (defaults to '~/etc')
                'tds.cert.key' (defaults to 'ssl.key')
                'tds.cert.file' (defaults to 'ssl.crt')
        `;

        try {
            certKey = TDS.expandPath(TDS.joinPaths(certPath, certKey));
            key = fs.readFileSync(certKey);
        } catch (e) {
            TDS.logger.error('Missing cert key for HTTPS: ' + certKey, meta);
        }

        try {
            certFile = TDS.expandPath(TDS.joinPaths(certPath, certFile));
            cert = fs.readFileSync(certFile);
        } catch (e) {
            TDS.logger.error('Missing cert file for HTTPS: ' + certFile, meta);
        }

        if (!key || !cert) {
            TDS.logger.error(sslErrMsg);
            if (TDS.logger.flush) {
                TDS.logger.flush(true);
            }

            //  Trigger the shutdown hook function.
            process.kill(process.pid, 'SIGTERM');
            return;
        }

        httpsOpts = {
            key: key,
            cert: cert
        };

        port = argv.https_port || argv.port || process.env.HTTPS_PORT ||
            TDS.cfg('tds.https_port') || TDS.cfg('https_port') ||
            443;   //  default https port

        TDS.httpsServer = https.createServer(httpsOpts, app);
        TDS.httpsServer.listen(port);

    } else {
        TDS.httpServer = http.createServer(app);
        TDS.httpServer.listen(port);
    }

    //  Tell the TDS to register servers. This supports clean shutdown process.
    TDS.registerServers();

    require('./plugins/poststart')(options);

    TDS.announceStart(logger, protocol, port, env);
}());
