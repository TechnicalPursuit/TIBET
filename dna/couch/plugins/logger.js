/**
 * @overview The standard application logger configuration for the TDS.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/* eslint-disable no-console */

(function(root) {

    'use strict';

    /**
     * Configures the express-winston logger to log both to the console and to a
     * configurable log file (normally tds-{env} in the project's log
     * directory). The resulting logger instance is added to the TDS variable
     * for use by all remaining plugins.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logcolor,           // Should console log be colorized.
            logcount,           // The app log file count.
            logfile,            // The app log file.
            logdir,             // The app log directory.
            logtheme,           // The log colorizing theme.
            logger,             // The app logger instance.
            meta,               // Reusable logger metadata.
            path,               // Path module for dirname.
            sh,                 // ShellJS for file utilities.
            logsize,            // The app log file size per file.
            TDS,                // The TIBET Data Server instance.
            fileTransport,      // Logger-to-file transport.
            consoleTransport,   // Logger-to-console transport.
            tmparr,             // Temporary array for JSON parse.
            transports,         // List of transports to configure.
            transportNames,     // Config data for transport names.
            watchurl,           // Ignore logging calls to watch url.
            winston,            // Appender-supported logging.
            expressWinston;     // Request logging support.

        app = options.app;
        TDS = app.TDS;

        //  NOTE this plugin _is_ the logger so our best option here is to
        //  use the prelog function to queue logging output.
        meta = {
            type: 'plugin',
            name: 'logger'
        };
        TDS.prelog('system', 'loading middleware', meta);

        //  ---
        //  Requires
        //  ---

        path = require('path');
        sh = require('shelljs');
        winston = require('winston');
        expressWinston = require('express-winston');

        //  ---
        //  Variables
        //  ---

        winston.emitErrs = true;

        winston.level = (TDS.cfg('tds.log.level') || 'info').toLowerCase();

        logcolor = TDS.cfg('tds.log.color');
        if (logcolor === undefined || logcolor === null) {
            logcolor = true;
        }

        if (!logcolor) {
            TDS.colorize = function(aString) {
                return aString;
            };
        }

        logcount = TDS.cfg('tds.log.count') || 5;
        logsize = TDS.cfg('tds.log.size') || 5242880;
        logtheme = TDS.cfg('tds.color.theme') || 'default';

        //  Log file names can include the environment if desired.
        //  NOTE any escaping here is due to handlebars processing during
        //  the `tibet clone` command. They disappear in the final output.
        /* eslint-disable no-useless-escape */
        logfile = TDS.expandPath(TDS.cfg('tds.log.file')) ||
            './logs/tds-\{{env}}.log';
        if (/\{{env}}/.test(logfile)) {
            logfile = logfile.replace(/\{{env}}/g, options.env);
        }
        /* eslint-enable no-useless-escape */

        logdir = path.dirname(logfile);
        if (!sh.test('-e', logdir)) {
            sh.mkdir('-p', logdir);
        }

        //  ---
        //  Logger Plugins
        //  ---

        watchurl = TDS.getcfg('tds.watch.uri');

        /**
         */
        TDS.log_filter = TDS.log_filter || function(req, res) {
            // Don't log repeated calls to the watcher URL.
            if (req.path.indexOf(watchurl) !== -1) {
                return true;
            }
        };

        //  ---
        //  Initialization
        //  ---

        transports = [];
        transportNames = TDS.cfg('tds.log.transports', ['file', 'console']);
        if (!Array.isArray(transportNames)) {
            try {
                tmparr = JSON.parse(transportNames);
                transportNames = tmparr;
                if (!Array.isArray(transportNames)) {
                    throw new Error();
                }
            } catch (e) {
                TDS.prelog('error',
                    'unable to parse tds.log.transports setting.', meta);
                TDS.prelog('warn',
                    'Defaulting tds.log.transports to file+console.', meta);
                transportNames = ['file', 'console'];
            }
        }

        if (transportNames.indexOf('console') !== -1 &&
                options.argv.console !== false) {
            //  NOTE we use a TDS-specific transport for the console output
            //  to help avoid issues with poor handling of newlines etc.
            consoleTransport = new TDS.log_transport({
                level: winston.level,
                stderrLevels: ['error'],
                debugStdout: false,
                meta: true,
                colorize: logcolor, //  Don't use built-in...we format this.
                json: false,    //  json is harder to read in terminal view.
                eol: ' ',   // Remove EOL newlines. Not '' or won't be used.
                formatter: TDS.log_formatter
            });

            transports.push(consoleTransport);
        }

        //  If file is listed, or there are no transports defined, then log to
        //  the standard file transport.
        if (transportNames.indexOf('file') !== -1 || transports.length === 0) {
            fileTransport = new winston.transports.File({
                level: winston.level,
                filename: logfile,
                maxsize: logsize,
                maxFiles: logcount,
                meta: true,
                json: true,         //  json is easier to parse with tools
                colorize: false     //  always false in the log file.
            });

            transports.push(fileTransport);
        }

        logger = new winston.Logger({
            //  NOTE winston's level #'s are inverted from TIBET's.
            levels: {
                trace: 6,
                debug: 5,
                info: 4,
                warn: 3,
                error: 2,
                fatal: 1,
                system: 0
            },
            colors: {
                trace: TDS.getcfg('theme.' + logtheme + '.trace'),
                debug: TDS.getcfg('theme.' + logtheme + '.debug'),
                info: TDS.getcfg('theme.' + logtheme + '.info'),
                warn: TDS.getcfg('theme.' + logtheme + '.warn'),
                error: TDS.getcfg('theme.' + logtheme + '.error'),
                fatal: TDS.getcfg('theme.' + logtheme + '.fatal'),
                system: TDS.getcfg('theme.' + logtheme + '.system')
            },
            transports: transports,
            exitOnError: false
        });

        //  Hold a reference to the root logger since we'll need it from inside
        //  any logger objects created for routes/tasks etc.
        TDS.logger = logger;

        //  ---

        if (consoleTransport) {
            //  NOTE we assign a flush option to the logger to give us a way to
            //  force flushing the console as needed.
            logger.flush = consoleTransport.flush.bind(consoleTransport);
        } else {
            process.stdout.write(
                TDS.colorize(Date.now(), 'stamp') +
                TDS.colorize(' [' +
                    TDS.levels.system +
                    '] ', 'system') +
                TDS.colorize('TDS ', 'tds') +
                TDS.colorize('logging to ' +
                   TDS.getVirtualPath(logfile)) + ' ' +
                TDS.colorize('(', 'dim') +
                TDS.colorize(TDS.getNodeEnv(), 'env') +
                TDS.colorize(')', 'dim'));
        }

        /**
         * Constructs an object with proper handlers for the various logging
         * methods which ensure the data block provided is used as metadata.
         * @param {Object} data An object containing specific metadata.
         * @returns {Object} An object with trace, debug, etc. functions.
         */
        logger.getContextualLogger = function(data) {
            var obj;

            obj = {};

            ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'system'
            ].forEach(function(key) {

                obj[key] = function(msg, metadata) {
                    switch (arguments.length) {
                        case 1:
                            TDS.logger[key](msg, data);
                            break;
                        case 2:
                            TDS.logger[key](msg, metadata || data);
                            break;
                        default:
                            TDS.logger[key].apply(TDS.logger, arguments);
                            break;
                    }
                };
            });

            obj.getContextualLogger = TDS.logger.getContextualLogger;

            return obj;
        };

        //  ---

        app.use(expressWinston.logger({
            winstonInstance: logger,
            level: winston.level,
            expressFormat: false,
            colorize: logcolor,
            json: false,
            skip: TDS.log_filter
        }));

        //  ---
        //  Flush
        //  ---

        TDS.log_flush(logger);

        //  ---
        //  Share
        //  ---

        options.logger = logger;

        return options.logger;
    };

}(this));
