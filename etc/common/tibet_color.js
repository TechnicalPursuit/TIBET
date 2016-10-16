//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview Server-side color processing. Routines here provide ways to get
 *     colorize strings, particularly log strings, using a combination of a
 *     {{tool}}.color.scheme (which maps color names to values) and a
 *     {{tool}}.color.theme, which maps semantic names to style chains such as
 *     'bold.underline.red'.
 */
//  ========================================================================

/* global TP:true, phantom:true */
/* eslint indent:0 */

(function() {

    var Config,
        Color,
        ansi256,
        ansiStyles;

    //  Colors are used for RGB index lookups. Styles are used for modifiers.
    ansi256 = require('ansi-256-colors');
    ansiStyles = require('ansi-styles');

    /**
     * The base color object. Supports a colorize method which is the primary
     * operation as well as configuration of a current color scheme and theme.
     * @param {Object} options Configuration options. Key values here are the
     *     'theme' and 'scheme' which allow each instance to color differently.
     * @return {Color} A new instance ready for colorizing.
     */
    Color = function(options) {

        this.options = options || {};

        //  Color module is pulled in by the cli, tds, phantom, package, etc. so
        //  it needs to leverage tibet_config for accessing config data.
        if (typeof phantom !== 'undefined') {
            Config = require(phantom.libraryPath +
                '/../common/tibet_config');
        } else {
            Config = require('./tibet_config');
        }
        this.config = new Config(this.options);

        //  Do the scheme and theme updates _after_ we get config in place so
        //  that invoking the setters will also preload the right config data.
        if (typeof phantom !== 'undefined') {
            //  Phantom should use the 'cli' settings for scheme/theme.
            this.scheme(options.scheme ||
                this.config.getcfg('cli.color.scheme') ||
                this._scheme);
            this.theme(options.theme ||
                this.config.getcfg('cli.color.theme') ||
                this._theme);
        } else {
            this.scheme(options.scheme || process.env.TIBET_CLI_SCHEME ||
                this._scheme);
            this.theme(options.theme || process.env.TIBET_CLI_THEME ||
                this._theme);
        }

        return this;
    };


    /**
     * The name of the scheme which provides the mappings between a color
     * name such as 'red' and the actual value used to represent that color.
     * @type {String}
     */
    Color.prototype._scheme = 'ttychalk';


    /**
     * The name of the theme which provides the mappings between semantic
     * names such as 'bracket' and a color.scheme name such as 'gray'. Note that
     * theme mappings can be sequences such as bold.underline.white.
     * @type {String}
     */
    Color.prototype._theme = 'default';


    /**
     * Colorizes a string by injecting ANSI escape sequences.
     * @param {String} aString The string to be colorized.
     * @param {String} aSpec The styling specification name. This must be a
     *     value found in the system's configuration under the current theme.
     *     For example, 'bracket' implies 'theme.' + currentTheme + '.' +
     *     bracket (theme.default.bracket) as one possible specification.
     * @return {String} The ANSI-escaped string.
     */
    Color.prototype.colorize = function(aString, aSpec) {
        var parts,
            i,
            len,
            key,
            str,
            spec,
            color,
            cfg,
            open,
            close;

        //  If we got info from the CLI or other consumer that color is off then
        //  skip the colorizing and just return.
        if (!aSpec || aSpec === 'no-color' || this.options.color === false) {
            return aString;
        }

        //  Inbound spec should be something like 'bracket'. Looking that up in
        //  the styles (defined by the 'theme') should yield something like
        //  'bold.gray'.
        key = 'theme.' + this._theme + '.' + aSpec.toLowerCase();
        spec = this._styles[key];
        if (!spec) {
            return aString;
        }

        str = '' + aString;

        //  Processing something like 'bold.gray' means looking up each portion
        //  and getting the proper escape codes for that operation.
        parts = spec.toLowerCase().split('.');
        len = parts.length;
        for (i = 0; i < len; i++) {
            key = 'color.' + this._scheme + '.' + parts[i];

            color = this._colors[key];
            if (!color) {
                //  Some spec segments are modifiers, not colors, so check.
                cfg = ansiStyles.modifiers[parts[i]];
                if (cfg) {
                    open = cfg.open;
                    close = cfg.close;
                }
            } else {
                if (/^bg[A-Z]/.test(parts[i])) {
                    open = ansi256.bg.codes[color];
                } else {
                    open = ansi256.fg.codes[color];
                }
            }

            str = (open || '') + str + (close || '');
        }

        //  Ensure we close anything not yet closed.
        str += ansi256.reset;

        return str;
    };


    /**
     * Combined setter/getter for the current color scheme. If a new scheme name
     * is provided it is verified and the receiver's color scheme values are
     * updated. If no value is provided the current scheme name is returned.
     * @param {String} [aName] The optional scheme name to set.
     * @return {String} The current scheme name after optional update.
     */
    Color.prototype.scheme = function(aName) {
        var cfg,
            name;

        if (aName) {
            name = aName.toLowerCase();
            cfg = this.config.getcfg('color.' + name);
            if (!cfg) {
                throw new Error('InvalidColorScheme', name);
            }
            this._colors = cfg;
            this._scheme = name;
        }

        return this._scheme;
    };


    /**
     * Combined setter/getter for the current color theme. If a new theme name
     * is provided it is verified and the receiver's color theme values are
     * updated. If no value is provided the current theme name is returned.
     * @param {String} [aName] The optional theme name to set.
     * @return {String} The current theme name after optional update.
     */
    Color.prototype.theme = function(aName) {
        var cfg,
            name;

        if (aName) {
            name = aName.toLowerCase();
            cfg = this.config.getcfg('theme.' + name);
            if (!cfg) {
                throw new Error('InvalidTheme', name);
            }
            this._styles = cfg;
            this._theme = name;
        }

        return this._theme;
    };


    //  ---
    //  Exports
    //  ---

    module.exports = Color;
}());
