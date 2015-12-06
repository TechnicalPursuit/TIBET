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
        var app;

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
                    json: false,    //  json is harder to read in terminal view.
                    eol: ' '   // Remove EOL newlines. Not '' or won't be used.
                })
            ],
            exitOnError: false
        }),

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
            skip: TDS.logFilter,
            stream: logger.stream
        }));

        options.logger = logger;
    };

}());
