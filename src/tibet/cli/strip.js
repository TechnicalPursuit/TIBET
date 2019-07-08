//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet test' command. Runs TIBET tests via the 'tibet tsh'
 *     command. The script run is typically the TSH script ':test' which
 *     will run the tsh:test command tag to invoke all test suites.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd;

CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./tsh');      // NOTE we inherit from 'tsh' command.
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'strip';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['selftest', 'inherit', 'subtypes', 'ignore-only',
                    'ignore-skip', 'tap', 'ok'],
        'string': ['target', 'suite', 'cases', 'context', 'profile', 'config'],
        'default': {
            tap: true,
            ok: true
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet strip';

//  ---
//  Instance Methods
//  ---

/**
 * Performed before we close the browser
 * @param {Object} puppetBrowser Puppeteer's 'browser' object.
 * @param {Object} puppetPage Puppeteer's 'page' object.
 * @returns {Promise|null} Either a Promise or null. If this method returns a
 *     Promise, this object will wait to shut down Puppeteer until that Promise
 *     is resolved.
 */
Cmd.prototype.beforeBrowserClose = function(puppetBrowser, puppetPage) {

    Cmd.Parent.prototype.beforeBrowserClose.call(
                    this, puppetBrowser, puppetPage);

    return puppetPage.coverage.stopJSCoverage().then(
        function(results) {
            this.processCoverageResults(results);
        }.bind(this));
};

/**
 * Performed before we load the test page
 * @param {Object} puppetBrowser Puppeteer's 'browser' object.
 * @param {Object} puppetPage Puppeteer's 'page' object.
 */
Cmd.prototype.beforePageLoad = function(puppetBrowser, puppetPage) {

    Cmd.Parent.prototype.beforePageLoad.call(this, puppetBrowser, puppetPage);

    puppetPage.coverage.startJSCoverage();

    return;
};

/**
 * Performs any final processing of the argument list prior to execution.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @returns {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizeArglist = function(arglist) {
    var args;

    args = Cmd.Parent.prototype.finalizeArglist.call(this, arglist);

    if (args.indexOf('--tap') === -1 &&
            args.indexOf('--no-tap') === -1) {
        args.push('--tap');
    }

    args.push('--coverage');

    return args;
};


/**
 * Returns a list of options/flags/parameters suitable for command completion.
 * @returns {Array.<string>} The list of options for this command.
 */
Cmd.prototype.getCompletionOptions = function() {
    var list,
        plist;

    list = Cmd.Parent.prototype.getCompletionOptions.call(this);
    plist = Cmd.Parent.prototype.getCompletionOptions();

    return CLI.subtract(plist, list);
};


/**
 * Computes and returns the proper profile to boot in support of the TSH.
 * @returns {String} The profile to boot.
 */
Cmd.prototype.getBootProfile = function() {
    if (this.options.selftest) {
        return '~lib_etc/headless/headless@selftest';
    }

    return Cmd.Parent.prototype.getBootProfile.call(this);
};


/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {

    var target,
        // context,
        prefix;
        // ignore;

    /*
    if (CLI.notEmpty(this.options.target)) {
        target = this.options.target;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name (tsh in this case). [1] should be the "target" to run.
        target = this.options._[1];
    }
    */

    prefix = ':test';
    target = prefix;

    target += ' --context=\'all\'';
    // target += ' --context=\'lib\' --suite=\'TP.xctrls.button: manipulation\'';

    /*
    if (target.length > 0 && target.indexOf(prefix) !== 0) {
        target = prefix + ' \'' + target + '\'';
    } else {
        target = prefix;
    }

    if (CLI.notEmpty(this.options.suite)) {
        target = target.trim() + ' -suite=\'' + this.options.suite + '\'';
    }

    context = this.options.context;
    if (CLI.isEmpty(context)) {
        context = CLI.inLibrary() ? 'lib' : 'app';
    }
    target = target.trim() + ' -context=\'' + context + '\'';

    if (this.options.selftest) {
        target += ' -ignore_only';
    } else {
        ignore = this.options['ignore-only'];
        if (ignore === true) {
            target += ' -ignore_only';
        }

        ignore = this.options['ignore-skip'];
        if (ignore === true) {
            target += ' -ignore_skip';
        }
    }

    if (this.options.inherit) {
        target += ' -inherit';
    }

    if (this.options.subtypes) {
        target += ' -subtypes';
    }

    if (CLI.notEmpty(this.options.cases)) {
        target = target.trim() + ' -cases=\'' + this.options.cases + '\'';
    }
    */

    return target;
};

Cmd.prototype.processCoverageResults = function(results) {

    var coverage,

        js_used_bytes,
        js_total_bytes,
        // covered_js,

        range;

    if (results) {

        coverage = [...results];

        js_used_bytes = 0;
        js_total_bytes = 0;
        // covered_js = '';

        for (const entry of coverage) {

            js_total_bytes += entry.text.length;
            this.stdout(`Total Bytes for ${entry.url}: ${entry.text.length}`);

            for (range of entry.ranges) {
                js_used_bytes += range.end - range.start - 1;
                // covered_js += entry.text.slice(range.start, range.end) + '\n';
            }
        }

        this.stdout(`Total Bytes of JS: ${js_total_bytes}`);
        this.stdout(`Used Bytes of JS: ${js_used_bytes}`);
    }
};

module.exports = Cmd;

}());
