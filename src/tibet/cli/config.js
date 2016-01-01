//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet config' command. Dumps the current TIBET configuration
 *     data to stdout for review. When inside a project this data will include
 *     information from the project's tibet.json file.
 */
//  ========================================================================

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    beautify,
    sh,
    Parent,
    Cmd;

CLI = require('./_cli');
beautify = require('js-beautify').js_beautify;
sh = require('shelljs');


//  ---
//  Type Construction
//  ---

Parent = require('./_cmd');

Cmd = function() {};
Cmd.prototype = new Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;


//  ---
//  Instance Attributes
//  ---

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'string': ['env'],
        'default': {
            'env': 'development'
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet config [property[=value]] [--env <env>]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    var cfg,
        option,
        parts,
        keys,
        newcfg,
        str;

    if (this.options._.length > 1) {
        option = this.options._[1];
    }

    if (/\=/.test(option)) {
        parts = option.split('=');
        return this.setConfig(parts[0], parts[1]);
    } else if (option === '~') {
        cfg = CLI.getAppHead();
    } else if (option === '~app' || option === '~app_root') {
        cfg = CLI.getAppRoot();
    } else if (option === '~lib' || option === '~lib_root') {
        cfg = CLI.getLibRoot();
    } else if (option && option.charAt(0) === '~') {
        cfg = CLI.getcfg('path.' + option.slice(1));
    } else if (option && option.indexOf('.') !== -1) {
        // longer key...might be a partial path or a full path
        cfg = CLI.getcfg(option);
        if (cfg === undefined) {
            cfg = CLI.getcfg();
            keys = Object.keys(cfg).filter(function(key) {
                return key.indexOf(option) === 0; //option.replace(/\./g, '_')) === 0;
            });
            newcfg = {};
            keys.forEach(function(key) {
                if (CLI.isValid(cfg[key])) {
                    newcfg[key] = cfg[key];
                }
            });
            cfg = newcfg;
        }
    } else {
        cfg = CLI.getcfg(option);
    }

    if (cfg === undefined) {
        this.info('Config value not found: ' + option);
        return;
    }

    // Output arrays in array form rather than object form.
    if (Array.isArray(cfg)) {
        this.info(JSON.stringify(cfg));
        return;
    }

    // Filter TDS user keys...
    try {
        keys = Object.keys(cfg).filter(function(key) {
            return key.indexOf('tds.users') !== 0;
        });
        newcfg = {};
        keys.forEach(function(key) {
            if (CLI.isValid(cfg[key])) {
                newcfg[key] = cfg[key];
            }
        });
        cfg = newcfg;
    } catch (e) {
        //  Ignore, probably not an object with keys.
        void 0;
    }

    // Object.keys will throw for anything other than Object/Array...
    try {
        str = '{\n';

        if (CLI.isEmpty(option) || option.indexOf('path') === 0) {
            str += '\t"~": "' + CLI.getAppHead() + '",\n';
            str += '\t"~app": "' + CLI.getAppRoot() + '",\n';
            str += '\t"~lib": "' + CLI.getLibRoot() + '",\n';
        }
        Object.keys(cfg).sort().forEach(function(key) {
            str += '\t"' + key + '": ' + // key.replace(/_/g, '.') + '": ' +
            // TODO: if this is a nested object from tibet.json etc. we'll dump
            // the entire subtree. Probably should come up with a routine to
            // "flatten" the keys out for output purposes.
                JSON.stringify(cfg[key]) + ',\n';
        });
        str = str.slice(0, -2);

        if (str) {
            str += '\n}';
        }
    } catch (e) {
        str = '' + cfg;
    }

    if (str.indexOf('~') === 0) {
        str += ' => ' + CLI.expandPath(str);
    }
    this.info(str);
};


/**
 * Sets a configuration value in the current project's tibet.json file.
 * @param {String} path The key to set, which may include '.' segments.
 * @param {String} value The value to set.
 */
Cmd.prototype.setConfig = function(path, value) {

    var json,
        file,
        parts,
        root,
        text,
        key,
        val;

    if (/^tds\./.test(path)) {
        file = CLI.expandPath('~tds_file');
    } else {
        file = CLI.expandPath('~tibet_file');
    }

    json = require(file);
    if (!json) {
        this.error('Unable to load: ' + file);
        return 1;
    }
    parts = path.split('.');

    if (parts.length === 1) {
        json[path] = value;
    } else {

        //  TDS values aren't prefixed as such in the TDS file, they're placed
        //  without prefix under an appropriate environment root.
        if (/^tds\./.test(path)) {
            parts[0] = this.options.env;
        }

        root = json;
        while (parts.length > 1) {
            key = parts.shift();
            if (root[key] !== void 0) {
                // Watch out for potential scalars where we need an object.
                if (typeof root[key] !== 'object') {
                    this.warn('replacing scalar on path: ' + path);
                    root[key] = {};
                }
            } else {
                root[key] = {};
            }
            root = root[key];
        }

        // If the value is potentially a number or boolean we need to convert to
        // that so we don't quote it as a string value.
        if (value === 'true') {
            val = true;
        } else if (value === 'false') {
            val = false;
        } else if (!isNaN(parseInt(value, 10))) {
            val = parseInt(value, 10);
        } else {
            val = value;
        }

        root[parts[0]] = val;
    }

    beautify(JSON.stringify(json)).to(file);

    //  Read the JSON back in. But we can't use require without a bunch of noise
    //  around cache cleansing etc.
    text = sh.cat(file);
    if (text) {
        json = JSON.parse(text);
        /* eslint-disable no-eval */
        if (/^tds\./.test(path)) {
            key = this.options.env + path.slice(3);
        } else {
            key = path;
        }
        this.info(eval('json.' + key));
        /* eslint-disable no-eval */
    }
};


module.exports = Cmd;

}());
