//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet resources' command. Lists resources that are needed
 *     (computed) for a particular package/config and optionally builds files
 *     describing TP.core.URI instances which can be rolled up for loading.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    chalk,
    fs,
    path,
    sh,
    Parent,
    Cmd;


CLI = require('./_cli');
chalk = require('chalk');
fs = require('fs');
path = require('path');
sh = require('shelljs');

//  ---
//  Type Construction
//  ---

// NOTE this is a subtype of the 'tsh' command focused on running :test.
Parent = require('./tsh');

Cmd = function() {};
Cmd.prototype = new Parent();


//  ---
//  Type Attributes
//  ---


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


/**
 * The default path to the TIBET-specific phantomjs test runner.
 * @type {String}
 */
Cmd.DEFAULT_RUNNER = Parent.DEFAULT_RUNNER;


//  ---
//  Instance Attributes
//  ---

/**
 * The list of resources to process as computed by the TSH :resources command.
 * @type {Array.<string>}
 */
Cmd.prototype.resources = [];


/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['inline'],
        'string': ['context'],
        'default': {
            color: false,
            context: 'app'
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet resources [--inline]';

//  ---
//  Instance Methods
//  ---

/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {
    return ':resources';
};


/**
 */
Cmd.prototype.processResources = function() {
    var cmd,
        buildpath,
        libpath;

    console.log(chalk.grey('Resources...'));

    cmd = this;

    //  If we'll be building inline resources we need a build dir to put them
    //  in so make sure it's available.
    if (cmd.options.inline) {
        if (CLI.inProject()) {
            buildpath = CLI.expandPath('~app_build');
        } else if (CLI.inLibrary()) {
            buildpath = CLI.expandPath('~lib_build');
        } else {
            cmd.error('Invalid command context.');
            return 1;
        }

        if (!sh.test('-d', buildpath)) {
            sh.mkdir(buildpath);
        }
    }

    libpath = CLI.expandPath('~lib');

    this.resources.forEach(function(resource) {
        var fullpath,
            data,
            content,
            file;

        //  Check for paths that will expand properly, silence any errors.
        fullpath = CLI.expandPath(resource, true);
        if (!fullpath) {
            return;
        }

        //  Didn't expand? ignore it. Didn't process properly.
        if (fullpath === resource) {
            return;
        }

        //  filter based on context
        if (CLI.inProject()) {
            if (fullpath.indexOf(libpath) === 0) {
                return;
            }
        } else {
            if (fullpath.indexOf(libpath) !== 0) {
                return;
            }
        }

        if (sh.test('-e', fullpath)) {
            if (!cmd.options.inline) {
                cmd.log(resource);
                return;
            }

            cmd.log('inlining: ' + resource);

            cmd.debug('reading: ' + resource);
            data = fs.readFileSync(fullpath, {encoding: 'utf8'});

            //  NOTE we wrap things in TIBET URI constructors and set their
            //  content to the original content, escaped for single-quoting.
            //  This effectively will pre-cache these values, avoiding HTTP.
            content = 'TP.uc(\'' + resource + '\').setContent(';
            content += CLI.quoted(data);
            content += ');'

            //  Replace the resource name with a normalized variant.
            file = path.join(buildpath,
                resource.replace('~', '').replace(/\//g, '-'));
            file += '.js';

            cmd.debug('writing: ' + CLI.getVirtualPath(file));
            fs.writeFileSync(file, content);

            //  TODO:   add file to proper manifest location.
        } else {
            cmd.debug('missing: ' + resource);
        }
    });
};


/**
 * TODO
 */
Cmd.prototype.close = function(code) {

    this.processResources();

    /* eslint-disable no-process-exit */
    process.exit(code);
    /* eslint-enable no-process-exit */
};


/**
 * TODO
 */
Cmd.prototype.stdout = function(data) {
    var str,
        arr,
        cmd;

    cmd = this;
    str = ('' + data).trim();
    arr = str.split('\n');
    arr.forEach(function(line) {
        if (line.charAt(0) === '~') {
            cmd.resources.push(line);
        } else {
            //  Color is off to avoid issues with overall output, so log manually
            //  with the desired color.
            console.log(chalk.grey(line));
        }
    })
};


module.exports = Cmd;

}());
