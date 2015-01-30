//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet version' command. Dumps the current version of TIBET.
 */
//  ========================================================================

(function() {

'use strict';

var CLI,
    Parent,
    Cmd,
    chalk,
    beautify;


CLI = require('./_cli');
chalk = require('chalk');
beautify = require('js-beautify').js_beautify;


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

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Displays the current version of TIBET. Also available as the\n' +
'--version flag on the \'tibet\' command (tibet --version).\n\n' +
'Use --check to request this command to check whether a newer\n' +
'version of TIBET has been published.\n';

/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['check'],
        'default': {
            check: false
        }
    },
    Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet version [--check]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var msg,
        current,
        http,
        options,
        url,
        host,
        port,
        path,
        str,
        req,
        code;

    code = 0;

    msg = 'Unable to determine TIBET version.';
    try {
        current = CLI.getcfg('npm.version') || msg;
    } catch (e) {
        this.error(msg + ' ' + e.message);
        throw new Error();
    }

    // Attempt to load the latest.js file from the TPI web site and process that
    // for information.
    if (this.options.check) {

        http = require('http');

        url = CLI.getcfg('path.lib_version_file');
        if (url.indexOf('http://') !== -1) {
            url = url.slice(7);
        }
        path = url.slice(url.indexOf('/'));
        host = url.slice(0, url.indexOf('/'));
        if (host.indexOf(':') !== -1) {
            port = host.slice(host.indexOf(':') + 1);
            port = parseInt(port, 10);
            host = host.slice(0, host.indexOf(':'));
        }

        options = {hostname: host, port: port, path: path};
        this.debug('checking version at: ' +
            beautify(JSON.stringify(options)));

        str = '';

        req = http.request(options, function(res) {

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                str += chunk;
            });

            res.on('end', function() {
                var json,
                    obj;

                if (str.match(/Cannot GET/)) {
                    console.error(
                        chalk.yellow('Unable to determine latest version: ' +
                            str));
                    code = 1;
                    return;
                }

                json = str.trim().slice(str.indexOf('release(') + 8, -2);
                obj = JSON.parse(json);
                if (!obj) {
                    console.error(
                        chalk.yellow('Unable to parse version data: ' + json));
                    code = 1;
                    return;
                }

                if (obj.semver === current) {
                    console.log(chalk.green(
                        'Your current version ' + current.split('+')[0] +
                        ' is the latest.'));
                } else {
                    console.log(chalk.yellow(
                        'Version ' + obj.semver.split('+')[0] +
                        ' is available. You have ' +
                        current.split('+')[0]));
                }
            });
        });

        req.on('error', function(e) {
            console.error('Unable to determine latest version: ' + e.message);
            code = 1;
        });

        req.end();
    } else {
        this.info(current.split('+')[0]);
    }
};


module.exports = Cmd;

}());
