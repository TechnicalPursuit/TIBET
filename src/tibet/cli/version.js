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
    path,
    sh,
    beautify;


CLI = require('./_cli');
chalk = require('chalk');
path = require('path');
sh = require('shelljs');
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

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['check'],
        'default': {
            check: false
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

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
        project,
        root,
        fullpath,
        library,
        npm,
        http,
        options,
        url,
        host,
        port,
        urlpath,
        str,
        req,
        code;

    code = 0;

    msg = 'Unable to determine TIBET version.';

    //  If we're in a project try to load the project version for reference.
    if (CLI.inProject()) {
        try {
            project = CLI.getcfg('npm.version') || msg;
        } catch (e) {
            this.error(msg + ' ' + e.message);
            throw new Error();
        }
    }

    //  Library version is always at ~lib/package.json.
    root = CLI.getLibRoot();
    fullpath = path.join(root, CLI.NPM_FILE);
    if (sh.test('-f', fullpath)) {
        try {
            npm = require(fullpath) || {tibet_project: false};
        } catch (e) {
            msg = 'Error loading TIBET package: ' + e.message;
            if (this.options.stack === true) {
                msg += ' ' + e.stack;
            }
            throw new Error(msg);
        }
    }

    try {
        library = npm.version;
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
        urlpath = url.slice(url.indexOf('/'));
        host = url.slice(0, url.indexOf('/'));
        if (host.indexOf(':') !== -1) {
            port = host.slice(host.indexOf(':') + 1);
            port = parseInt(port, 10);
            host = host.slice(0, host.indexOf(':'));
        }

        options = {hostname: host, port: port, path: urlpath};
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

                if (obj.semver === library) {
                    console.log(chalk.green(
                        'Your current version ' + library.split('+')[0] +
                        ' is the latest.'));
                } else {
                    console.log(chalk.yellow(
                        'Version ' + obj.semver.split('+')[0] +
                        ' is available. You have ' +
                        library.split('+')[0]));
                }
            });
        });

        req.on('error', function(e) {
            console.error('Unable to determine latest version: ' + e.message);
            code = 1;
        });

        req.end();
    } else {

        msg = library.split('+')[0];
        if (project && project !== library) {
            msg = CLI.getcfg('npm.name') + ' ' + project.split('+')[0] +
                ' running on TIBET ' + library.split('+')[0];
        } else {
            msg = library.split('+')[0];
        }
        this.info(msg);
    }
};


module.exports = Cmd;

}());
