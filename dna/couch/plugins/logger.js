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
            config,
            logcolor,           // Should console log be colorized.
            logcount,           // The app log file count.
            logfile,            // The app log file.
            logformat,          // The app output format.
            logger,             // The app logger instance.
            logsize,            // The app log file size per file.
            TDS,
            winston,            // Appender-supported logging.
            expressWinston;     // Request logging support.

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        TDS = app.TDS;

        //  NOTE this plugin _is_ the logger so our only option here is to
        //  use the prelog function to essentially queue logging output.
        TDS.prelog(['debug', 'Integrating TDS logger.']);

        //  ---
        //  Requires
        //  ---

        winston = require('winston');
        expressWinston = require('express-winston');

        //  ---
        //  Variables
        //  ---

        winston.emitErrs = true;
        winston.level = TDS.cfg('tds.log.level') || 'info';

        logcolor = TDS.cfg('tds.log.color');
        if (logcolor === undefined || logcolor === null) {
            logcolor = true;
        }
        logcount = TDS.cfg('tds.log.count') || 5;
        logformat = TDS.cfg('tds.log.format') || 'dev';
        logsize = TDS.cfg('tds.log.size') || 5242880;

        //  Log file names can include the environment if desired.
        //  NOTE any escaping here is due to handlebars processing during
        //  the `tibet clone` command. They disappear in the final output.
        /* eslint-disable no-useless-escape */
        logfile = TDS.expandPath(TDS.cfg('tds.log.file')) ||
            './log/tds-\{{env}}.log';
        if (/\{{env}}/.test(logfile)) {
            logfile = logfile.replace(/\{{env}}/g, options.env);
        }
        /* eslint-enable no-useless-escape */

        //  ---
        //  Initialization
        //  ---

        logger = new winston.Logger({
            transports: [
                new winston.transports.File({
                    level: winston.level,
                    filename: logfile,
                    maxsize: logsize,
                    maxFiles: logcount,
                    meta: true,
                    json: true,         //  json is easier to parse with tools
                    colorize: false     //  always false in the log file.
                }),
                new winston.transports.Console({
                    level: winston.level,
                    stderrLevels: ['error'],
                    debugStdout: false,
                    meta: true,
                    colorize: false,    //  Don't use built-in...we format this.
                    json: false,    //  json is harder to read in terminal view.
                    eol: ' ',   // Remove EOL newlines. Not '' or won't be used.
                    formatter: function(obj) {
                        var msg,
                            style;

                        msg = '';
                        msg += TDS.colorize('[', 'bracket') +
                            TDS.colorize(Date.now(), 'stamp') +
                            TDS.colorize(']', 'bracket');

                        msg += ' ' + TDS.colorize(
                            TDS.rpad(obj.level.toUpperCase(), 8),
                            obj.level.toLowerCase());

                        if (obj.meta && obj.meta.req && obj.meta.res) {
                            //  HTTP req/res information.
                            style = ('' + obj.meta.res.statusCode).charAt(0) + 'xx';
                            msg += ' ' + TDS.colorize(obj.meta.req.method, style);
                            msg += ' ' + TDS.colorize(obj.meta.req.url, 'url');
                            msg += ' ' + TDS.colorize(obj.meta.res.statusCode, style);
                            msg += ' ' + TDS.colorize(obj.meta.responseTime + 'ms', 'ms');
                        } else {
                            msg += ' ' + TDS.colorize(obj.message, 'data');
                        }

                        //console.log(TDS.beautify(obj));

                        return msg;
                    }
                })
            ],
            exitOnError: false
        });

        //  Make sure we have a default function in place if no other is set.
        TDS.logger_filter = TDS.logger_filter || function(req, res) {
            var url;

            url = TDS.getcfg('tds.watch.uri');

            // Don't log repeated calls to the watcher URL.
            if (req.path.indexOf(url) !== -1) {
                return true;
            }
        };

        //  ---
        //  Routes
        //  ---

        app.use(expressWinston.logger({
            winstonInstance: logger,
            level: winston.level,
            expressFormat: true,
            colorize: false,
            skip: TDS.logger_filter
        }));

        //  ---
        //  Flush
        //  ---

        TDS.flushlog(logger);

        //  ---
        //  Sharing
        //  ---

        options.logger = logger;

        return options.logger;
    };

}(this));
