/**
 * @overview The 'tibet config' command. Dumps the current TIBET configuration
 *     data to stdout for review. When inside a project this data will include
 *     information from the project's tibet.json file.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

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
Cmd.CONTEXT = CLI.CONTEXTS.BOTH;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
    'Dumps the current TIBET configuration data to stdout.';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet config';


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
    var str;

    if (this.argv._.length > 1) {
        option = this.argv._[1];
    }

    cfg = CLI.getcfg(option);

    if (typeof cfg === 'undefined')  {
        this.info('Config value not found: ' + option);
        return;
    }

    str = '{\n';

    // Object.keys will throw for anything other than Object/Array...
    try {
        Object.keys(cfg).sort().forEach(function(key) {
            str += '\t"' + key.replace(/_/g, '.') + '": "' + cfg[key] + '",\n';
        });
        str = str.slice(0, -2);
        str += '\n}';
    } catch (e) {
        str = '' + cfg;
    }

    this.info(str);
};


module.exports = Cmd;

}());
