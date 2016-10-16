//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview Simple server-side logging methods which match the basic API found
 *     in the client.
 */
//  ========================================================================

/* eslint no-console:0 */

(function() {

    var Logger,
        Color;

    Color = require('./tibet_color');

    /**
     *
     */
    Logger = function(options) {
        var level;

        this.options = options || {};

        if (this.options.verbose) {
            level = Logger.TRACE;
        } else if (this.options.debug) {
            level = Logger.DEBUG;
        } else {
            level = Logger.INFO;
        }
        this.setLevel(this.options.level || level);

        this.color = new Color(this.options);

        return this;
    };

    //  Standard TIBET logging levels.
    Logger.TRACE = 1;
    Logger.DEBUG = 2;
    Logger.INFO = 3;
    Logger.WARN = 4;
    Logger.ERROR = 5;
    Logger.SEVERE = 6;
    Logger.FATAL = 7;
    Logger.SYSTEM = 8;

    Logger.LEVELS = [
        'any',
        'trace',
        'debug',
        'info',
        'warn',
        'error',
        'severe',
        'fatal',
        'system'
    ];

    /**
     *
     */
    Logger.prototype.getLevel = function() {
        return this.level;
    };

    /**
     *
     */
    Logger.prototype.setLevel = function(aLevel) {
        var lvl;

        if (typeof aLevel === 'number') {
            lvl = aLevel;
        } else {
            lvl = Logger[aLevel.toUpperCase()];
            if (typeof lvl !== 'number') {
                throw new Error('InvalidLevel');
            }
        }

        this.level = lvl;
    };

    /**
     *
     */
    Logger.prototype.log = function(msg, spec, level) {
        var lvl;

        if (this.options.silent === true) {
            return;
        }

        lvl = level || Logger.INFO;
        if (lvl < this.getLevel()) {
            return;
        }

        console.log(this.color.colorize(msg, spec));
    };


    Logger.prototype.trace = function(msg) {
        this.log(msg, 'trace', Logger.TRACE);
    };

    Logger.prototype.debug = function(msg) {
        this.log(msg, 'debug', Logger.DEBUG);
    };

    Logger.prototype.info = function(msg) {
        this.log(msg, 'info', Logger.INFO);
    };

    Logger.prototype.warn = function(msg) {
        this.log(msg, 'warn', Logger.WARN);
    };

    Logger.prototype.error = function(msg) {
        this.log(msg, 'error', Logger.ERROR);
    };

    Logger.prototype.severe = function(msg) {
        this.log(msg, 'severe', Logger.SEVERE);
    };

    Logger.prototype.fatal = function(msg) {
        this.log(msg, 'fatal', Logger.FATAL);
    };

    Logger.prototype.system = function(msg) {
        this.log(msg, 'system', Logger.SYSTEM);
    };

    //  ---
    //  Exports
    //  ---

    module.exports = Logger;
}());
