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

(function() {

'use strict';

var CLI = require('./_cli');
var beautify = require('js-beautify').js_beautify;


//  ---
//  Type Construction
//  ---

var Parent = require('./_cmd');

var Cmd = function(){};
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

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Manages and/or displays the current TIBET configuration data.\n\n' +

'The config command can output one or more configuration values to the\n' +
'console based on current configuration data for your application or\n' +
'update a particular value to a string, number or boolean value.\n\n' +

'You can view the entire configuration list by leaving off any specific\n' +
'value. You can view all values for a particular prefix by listing just\n' +
'the prefix. You can view a specific value by naming that value directly.\n' +
'You can dump virtual paths by quoting them. \'~\' will show them all.\n\n' +

'Configuration data can also be updated by adding an \'=\' and value to\n' +
'a properly defined property name.\n\n' +

'Examples:\n\n' +

'tibet config -> list all configuration values.\n' +
'tibet config \'~\' -> list all path values.\n' +
'tibet config boot -> list all boot.* values.\n' +
'tibet config boot.bootstrap -> list a single value.\n' +
'tibet config foo.bar=true -> set foo.bar to true.\n\n' +

'NOTE that if you use this command to set values it will rewrite tibet.json\n' +
'by using the beautify npm module to process the stringified JSON content.\n' +
'As a result your file may not retain its appearance after updates.\n';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet config [property[=value]]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    var cfg;
    var option;
    var parts;
    var str;

    if (this.options._.length > 1) {
        option = this.options._[1];
    }

    if (/=/.test(option)) {
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
    } else {
        cfg = CLI.getcfg(option);
    }

    if (typeof cfg === 'undefined')  {
        this.info('Config value not found: ' + option);
        return;
    }

    str = '{\n';

    // Object.keys will throw for anything other than Object/Array...
    try {
        if (CLI.isEmpty(option) || option.indexOf('path') === 0) {
            str += '\t"~": "' + CLI.getAppHead() + '",\n';
            str += '\t"~app": "' + CLI.getAppRoot() + '",\n';
            str += '\t"~lib": "' + CLI.getLibRoot() + '",\n';
        }
        Object.keys(cfg).sort().forEach(function(key) {
            str += '\t"' + key.replace(/_/g, '.') + '": "' + cfg[key] + '",\n';
        });
        str = str.slice(0, -2);
        str += '\n}';
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

    var json;
    var parts;
    var root;
    var key;

    json = require('tibet.json');
    if (!json) {
        this.error('Unable to load tibet.json.');
        return 1;
    }

    parts = path.split('.');

    if (parts.length === 1) {
        json[path] = value;
    } else {
        root = json;
        while (parts.length > 1) {
            key = parts.shift();
            if (root[key] !== void(0)) {
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
        if (value === "true") {
            value = true;
        } else if (value === "false") {
            value = false;
        } else if (!isNaN(parseInt(value, 10))) {
            value = parseInt(value, 10);
        }

        root[parts[0]] = value;
    }

    beautify(JSON.stringify(json)).to('tibet.json');
};


module.exports = Cmd;

}());
