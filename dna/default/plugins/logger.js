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
            logtheme,           // The log colorizing theme.
            logger,             // The app logger instance.
            meta,               // Reusable logger metadata.
            logsize,            // The app log file size per file.
            TDS,
            watchurl,
            winston,            // Appender-supported logging.
            expressWinston;     // Request logging support.

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        TDS = app.TDS;

        //  NOTE this plugin _is_ the logger so our best option here is to
        //  use the prelog function to queue logging output.
        meta = {type: 'plugin', name: 'logger'};
        TDS.prelog('system', 'loading middleware', meta);

        //  ---
        //  Requires
        //  ---

        winston = require('winston');
        expressWinston = require('express-winston');

        //  ---
        //  Variables
        //  ---

        winston.emitErrs = true;

        if (options.argv.debug) {
            winston.level = options.argv.verbose ? 'trace' : 'debug';
        } else {
        winston.level = TDS.cfg('tds.log.level') || 'info';
        }

        logcolor = TDS.cfg('tds.log.color');
        if (logcolor === undefined || logcolor === null) {
            logcolor = true;
        }

        if (!logcolor) {
            TDS.colorize = function(aString) {
                return aString;
            }
        }

        logcount = TDS.cfg('tds.log.count') || 5;
        logformat = TDS.cfg('tds.log.format') || 'dev';
        logsize = TDS.cfg('tds.log.size') || 5242880;
        logtheme = TDS.cfg('tds.color.theme') || 'default';

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

        /**
         */
        TDS.log_formatter = TDS.log_formatter || function(obj) {
            var msg,
                comp,
                style;

            msg = '';

            //  Everything gets a timestamp...
            msg += TDS.colorize('[', 'bracket') +
                TDS.colorize(Date.now(), 'stamp') +
                TDS.colorize(']', 'bracket');

            //  Everything gets a level...
                msg += ' ' + TDS.colorize(
                    TDS.rpad(obj.level.toLowerCase(), 7),
                    obj.level.toLowerCase());

            if (obj.meta &&
                    obj.meta.req !== undefined &&
                    obj.meta.res !== undefined &&
                    obj.meta.responseTime !== undefined) {

                //  HTTP request logging
                style = ('' + obj.meta.res.statusCode).charAt(0) + 'xx';
                msg += TDS.colorize(obj.meta.req.method, style) + ' ' +
                    TDS.colorize(obj.meta.req.url, 'url') + ' ' +
                    TDS.colorize(obj.meta.res.statusCode, style) + ' ' +
                    TDS.colorize(obj.meta.responseTime + 'ms', 'ms');

            } else if (obj.meta && obj.meta.type) {
                comp = obj.meta.comp || 'TDS';

                //  TIBET plugin, route, task, etc.
                msg += TDS.colorize(comp, comp.toLowerCase() || 'tds') + ' ' +
                    TDS.colorize(obj.message, obj.meta.style || 'dim') + ' ' +
                    TDS.colorize('(', 'dim') +
                    TDS.colorize(obj.meta.name, obj.meta.type || 'dim') +
                    TDS.colorize(')', 'dim');

            } else {
                //  Standard message string with no metadata.
                msg += ' ' + TDS.colorize(obj.message, 'data');
            }

            return msg;
        };

        //  ---
        //  Initialization
        //  ---

        logger = new winston.Logger({
            //  NOTE winston's level #'s are inverted from TIBET's.
            levels: {
                trace: 6,
                debug: 5,
                info: 4,
                warn: 3,
                error: 2,
                fatal: 1,
                system: 0,
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
                    colorize: logcolor, //  Don't use built-in...we format this.
                    json: false,    //  json is harder to read in terminal view.
                    eol: ' ',   // Remove EOL newlines. Not '' or won't be used.
                    formatter: TDS.log_formatter
                })
            ],
            exitOnError: false
        });

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

        TDS.flushlog(logger);

        //  ---
        //  Share
        //  ---

        options.logger = logger;

        return options.logger;
    };

}(this));
