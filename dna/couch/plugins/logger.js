/**
 * @overview The standard application logger configuration for the TDS.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var logcolor,           // Should console log be colorized.
        logcount,           // The app log file count.
        logfile,            // The app log file.
        logformat,          // The morgan format to log with.
        logsize,            // The app log file size per file.
        logger,             // The app logger instance.
        morgan,             // Express request logger.
        TDS,
        winston;            // Appender-supported logging.

    TDS = require('tibet/etc/tds/tds-base');
    morgan = require('morgan');
    winston = require('winston');

    module.exports = function(options) {
        var app,
            config,
            filter;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        winston.emitErrs = true;
        winston.level = TDS.cfg('tds.log.level') || 'info';

        logcolor = TDS.cfg('tds.log.color');
        if (logcolor === undefined || logcolor === null) {
            logcolor = true;
        }
        logcount = TDS.cfg('tds.log.count') || 5;
        logformat = TDS.cfg('tds.log.format') || 'dev';
        logsize = TDS.cfg('tds.log.size') || 5242880;

        //  If colors are turned on then we need to collect our values from
        //  config and get ready to update the logger instance color values.
        if (logcolor) {
            config = TDS.cfg('tds.color');
            Object.keys(config).forEach(function(key) {
                config[key.split('.')[2]] = config[key];
                delete config[key];
            });
            winston.config.addColors(config);
        }

        //  Log file names can include the environment if desired.
        //  NOTE the escaping here is due to handlebars processing during
        //  the `tibet clone` command. They disappear in the final output.
        logfile = TDS.expandPath(TDS.cfg('tds.log.file')) ||
            './log/tds-\{{env}}.log';
        if (/\{{env}}/.test(logfile)) {
            logfile = logfile.replace(/\{{env}}/g, options.env);
        }

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
                    json: false,    //  json is harder to read in terminal view.
                    eol: ' '   // Remove EOL newlines. Not '' or won't be used.
                })
            ],
            exitOnError: false
        }),

        //  Make sure we have a default function in place if no other is set.
        TDS.logger_filter = TDS.logger_filter || function(req, res) {
            var url;

            url = TDS.getcfg('tds.watch.uri');

            // Don't log repeated calls to the watcher URL.
            if (req.path.indexOf(url) !== -1) {
                return true;
            }
        };

        //  Additional trimming here to help support blending morgan and winston
        //  and not ending up with too many newlines in the output stream.
        logger.stream = {
            write: function(message, encoding) {
                var msg;

                msg = message;
                while (msg.charAt(msg.length - 1) === '\n') {
                    msg = msg.slice(0, -1);
                }
                logger[winston.level](msg);
            }
        };

        //  Merge in morgan request logger and direct it to the winston stream.
        app.use(morgan(logformat, {
            skip: TDS.logger_filter,
            stream: logger.stream
        }));

        options.logger = logger;
    };

}());
