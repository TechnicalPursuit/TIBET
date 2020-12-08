/**
 * @overview The standard application logger configuration for the TDS.
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
            logcolor,
            logcount,
            logfile,
            logdir,
            level,
            logger,
            meta,
            path,
            sh,
            logsize,
            TDS,
            fileTransport,
            consoleTransport,
            tmpobj,
            transports,
            transportNames,
            watchurl,
            winston,
            winstonFormat,
            winstonLogger,
            expressWinston;

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
        winstonLogger = winston.createLogger;
        winstonFormat = winston.format;
        expressWinston = require('express-winston');

        //  ---
        //  Variables
        //  ---

        level = (TDS.cfg('tds.log.level') || 'info').toLowerCase();

        logcolor = TDS.cfg('color') && TDS.cfg('tds.log.color', true);

        logcount = TDS.cfg('tds.log.count') || 5;
        logsize = TDS.cfg('tds.log.size') || 5242880;

        //  Log file names can include the environment if desired.

        //  NOTE the curly brace escaping here is due to handlebars processing
        //  during the `tibet clone` command. Its disappears in the final
        //  output.
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
            transportNames = '{ "transports": ' + transportNames + '}';
            try {
                tmpobj = JSON.parse(transportNames);
                transportNames = tmpobj.transports;
                if (!Array.isArray(transportNames)) {
                    transportNames = transportNames.split(',');
                }
            } catch (e) {
                TDS.prelog('error', e.message, meta);
                TDS.prelog('error',
                    'unable to parse tds.log.transports as Array.', meta);
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
                level: level,
                meta: true,
                eol: ' ',   // Remove EOL newlines. Not '' or won't be used.
                format: TDS.log_formatter()
            });

            transports.push(consoleTransport);

            TDS.hasConsole(true);
        }

        //  If file is listed, or there are no transports defined, then log to
        //  the standard file transport.
        if (transportNames.indexOf('file') !== -1 || transports.length === 0) {

            //  NOTE that unlike the console transport this isn't a call to
            //  'new'...invoking this just creates a new instance it patches.
            fileTransport = TDS.file_transport({
                level: level,
                filename: logfile,
                maxsize: logsize,
                maxFiles: logcount,
                meta: true,
                format: winstonFormat.combine(
                    TDS.log_decolorizer(),
                    winstonFormat.json()
                )
            });

            transports.push(fileTransport);
        }

        logger = winstonLogger({
            level: level,
            levels: TDS.log_levels,
            transports: transports,
            format: winstonFormat.simple(),
            exitOnError: false,
            silent: false
        });

        //  Create a simple handler for errors so we don't get unhandled
        //  variations and we can log them out without crashing.
        logger.on('error', function(err) {
            process.stderr.write(
                TDS.colorize(Date.now(), 'stamp') +
                TDS.colorize(' [' +
                    TDS.levels.error +
                    '] ', 'error') +
                TDS.colorize('TDS ', 'tds') +
                TDS.colorize(err.message) +
                TDS.colorize(' (', 'dim') +
                TDS.colorize('server', 'tds') +
                TDS.colorize(')', 'dim'));
        });

        //  Hold a reference to the root logger since we'll need it from inside
        //  any logger objects created for routes/tasks etc.
        TDS.logger = logger;

        //  ---

        if (consoleTransport) {
            TDS.logger.flush = function(immediate, callback) {
                consoleTransport.flush(immediate, callback);
            };
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
                TDS.colorize(app.get('env'), 'env') +
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
                    var lvl;

                    //  Have these methods filter by log level if test is a
                    //  valid function (e.g. ifDebug, ifTrace, etc)
                    lvl = key.charAt(0).toUpperCase() + key.slice(1);
                    if (typeof TDS['if' + lvl] === 'function') {
                        if (!TDS['if' + lvl]()) {
                            return;
                        }
                    }

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
            level: level,
            expressFormat: false,
            colorize: logcolor,
            skip: TDS.log_filter
        }));

        //  ---
        //  Flush
        //  ---

        //  Write out any pending (queued) log entries.
        TDS.flush_log(logger);

        //  ---
        //  Share
        //  ---

        options.logger = logger;

        return options.logger;
    };

}(this));
