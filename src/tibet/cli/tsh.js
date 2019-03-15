//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview A base command type which runs TIBET shell within the context of
 *     a headless TIBET environment. The script to run can be provided as a
 *     quoted string or as the value for the command argument --script.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0, no-process-exit: 0, no-console: 0 */

(function() {

'use strict';

var CLI,
    Cmd,
    Promise,
    puppeteer;

CLI = require('./_cli');
puppeteer = require('puppeteer');
Promise = require('bluebird');


//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
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
Cmd.NAME = 'tsh';


/**
 * Standard value output by TSH to say 'no result/output'.
 */
Cmd.NO_VALUE = '__TSH__NO_VALUE__TSH__';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options. Note that most of these are based on the
 * values suitable for the headless environment so they can be parsed properly.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
{
    'boolean': ['color', 'errimg', 'help', 'usage', 'debug', 'tap',
        'system', 'quiet'],
    'string': ['script', 'url', 'params', 'level'],
    'number': ['timeout', 'remote-debug-port'],
    'default': {
        color: true
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The timeout used for command invocation. Processing TSH requires startup time
 * etc. so default to 15 seconds here.
 * @type {Number}
 */
Cmd.prototype.TIMEOUT = 15000;

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet tsh <script> [<headless_args>]';

//  ---
//  Instance Methods
//  ---

/**
 * Perform startup announcement as appropriate for the (sub)command.
 */
Cmd.prototype.announce = function() {

    if (!this.options.silent) {
        this.log((this.options.tap ? '# ' : '') +
            'Loading TIBET at ' + new Date().toISOString(), 'dim');
    }

    return;
};


/**
 * Perform the actual command processing logic.
 */
Cmd.prototype.execute = function() {
    var ignoreChromeOutput,
        puppetBrowser,
        puppetPage,
        start,
        end,
        cmd,
        puppeteerArgs,
        active,
        profile,
        script,
        arglist,
        finalTimeout;

    //  Without a script we can't run so verify that we got something useful.
    script = this.getScript();
    if (script === void 0) {
        return this.usage();
    }
    this.options.script = script;

    //  Push values into the config or we won't get them back in the arglist.
    CLI.setcfg('script', this.options.script);

    // Access the argument list. Subtypes can adjust how they assemble this to
    // alter the default behavior. Note the slice() here removes the command
    // name from the list ('tsh').
    arglist = this.getArglist().slice(1);
    if (CLI.isEmpty(arglist)) {
        return 0;
    }

    // Finalize it, giving subtypes a chance to tweak the arguments as needed.
    arglist = this.finalizeArglist(arglist);

    // If no arglist then we presubably output usage() and are just returning.
    if (!arglist) {
        return 0;
    }

    //  Determine which specific boot profile to use. We use a separate
    //  routine for this so we can check the prefix/value and avoid pushing a
    //  profile more than once into the argument list.
    profile = this.finalizeBootProfile(arglist);

    //  TODO:   headless args?

    //  Need to be ok with more latency in command output...esp for things like
    //  resource processing.
    finalTimeout = this.finalizeTimeout(arglist);

    // Push root path values since headless can't properly determine that based
    // on where it loads (app vs. lib, tibet_pub or not, etc).
    arglist.push('--app-head=\'' + CLI.expandPath('~') + '\'');
    arglist.push('--app-root=\'' + CLI.expandPath('~app') + '\'');
    arglist.push('--lib-root=\'' + CLI.expandPath('~lib') + '\'');

    // this.debug('headless ' + arglist.join(' '));

    this.announce();

    /*
     * Helper to remove Chrome-initiated messages we don't need to see.
     */
    ignoreChromeOutput = function(text) {
        return /Synchronous XMLHttpRequest on the main thread/i.test(text);
    };

    cmd = this;

    //  Let us access file urls so we don't have to launch a server. Also, don't
    //  specify a sandbox in case we're running as root.
    puppeteerArgs = {
        args: CLI.getcfg('puppeteer.chromium_args', [
                        '--disable-web-security',
                        '--allow-file-access-from-files',
                        '--no-sandbox']),
        devtools: CLI.getcfg('puppeteer.devtools', false),
        headless: CLI.getcfg('puppeteer.headless', true),
        slowMo: CLI.getcfg('puppeteer.slowMo', false)
    };

    puppeteer.launch(
        puppeteerArgs
    ).then(
    function(browser) {

        puppetBrowser = browser;
        return browser.newPage();

    }).then(function(page) {

        puppetPage = page;

        //  Set the timeout on Puppeteer so that it matches what we hand to the
        //  TSH:
        page.setDefaultTimeout(finalTimeout);

        page.on('close', function(evt) {
            process.exit(0);
        });

        page.on('error', function(err) {
            cmd.stderr(err);
            process.exit(1);
        });

        page.on('pageerror', function(err) {
            cmd.stderr(err);
            process.exit(1);
        });

        page.on('console', function(msg) {

            //  Strip browser messages we don't initiate.
            if (ignoreChromeOutput(msg.text())) {
                return;
            }

            if (!active && !cmd.options.verbose) {
                return;
            }

            switch (msg.type()) {
                case 'error':
                    cmd.stderr(msg);
                    break;
                default:
                    cmd.stdout(msg);
                    break;
            }
        });

        return puppetBrowser.userAgent();

    }).then(function(agent) {
        var fullpath;

        //  You can launch a file path as long as you set the right flags
        //  for Chrome to avoid issues with cross-origin security glitches.
        if (CLI.inLibrary()) {
            fullpath = 'file:' +
                CLI.expandPath('~lib_etc/headless/headlesstsh.xhtml') +
                '#?boot.profile=\'' + profile + '\'';
        } else {
            fullpath = 'file:' +
                CLI.expandPath(CLI.getcfg('project.start_page')) +
                '#?boot.profile=\'' + profile + '\'';
        }

        //  NOTE: this value must match the value found in tibet_cfg.js
        //  for the boot system to properly recognize headless context.
        puppetPage.setUserAgent(agent + ' Puppeteer');

        start = new Date();

        return puppetPage.goto(fullpath);

    }).then(function(result) {

        //  Once the page loads TIBET will start to load. We need to
        //  wait for it to finish before we continue.
        return puppetPage.waitForFunction(function() {

            //  If TP isn't defined, that means we're in a non-TIBET start page.
            /* eslint-disable dot-notation */
            if (!window['TP']) {
                throw new Error('TIBET not found in start page.');
            }
            /* eslint-enable dot-notation */

            //  If $$stop isn't falsey it's going to have an error in
            //  it. Capture and exit.
            if (TP && TP.boot && TP.boot.$$stop) {
                throw new Error(TP.boot.$$stop);
            }

            if (TP && TP.sys && TP.sys.hasStarted) {
                return TP.sys.hasStarted();
            }

            return false;
        }, {
            polling: 250
        });

    }).then(function() {

        active = true;
        end = new Date();

        //  Once TIBET boots run whatever TSH command we're being
        //  asked to execute for this process.
        if (!cmd.options.silent) {
            cmd.log((cmd.options.tap ? '# ' : '') +
                'TIBET loaded and active in ' + (end - start) + 'ms', 'dim');
        }

        return puppetPage.mainFrame().executionContext();

    }).then(function(context) {

        var input,
            shouldPause;

        input = cmd.options.script;
        shouldPause = cmd.options.pause;

        return context.evaluate(function(tshInput, pauseBeforeExec) {

            return new Promise(function(resolve, reject) {
                var handler;

                handler = function(aSignal, stdioResults) {
                    var result,
                        found,
                        results,
                        str;

                    //  Normalize the result data array. We rely on an array of
                    //  results so that buffered output can be processed.
                    if (TP.isValid(stdioResults)) {
                        if (TP.isArray(stdioResults)) {
                            results = stdioResults;
                        } else {
                            //  Objects in the stdioResults array are supposed
                            //  to be simple pojos with meta/data keys.
                            if (TP.notValid(stdioResults.meta)) {
                                results = [{
                                    meta: 'stdout',
                                    data: TP.json(stdioResults)
                                }];
                            } else {
                                results = [stdioResults];
                            }
                        }
                    } else {
                        results = [];
                    }

                    //  If we have signal data and it's not already represented
                    //  in the result array add it before getting to the output
                    //  sequence.
                    if (TP.isValid(aSignal)) {
                        result = aSignal.getResult();
                        found = results.some(function(item) {
                            return item.data === result;
                        });
                        if (!found) {
                            results.push({
                                meta: 'stdout',
                                data: str
                            });
                        }
                    }

                    //  Normalize all data slots in result set to be string form.
                    results = results.map(function(item) {
                        var data;

                        try {
                            if (TP.isString(item.data)) {
                                data = item.data;
                            } else {
                                data = JSON.stringify(item.data);
                            }
                        } catch (e) {
                            try {
                                data = TP.str(item.data);
                            } catch (e2) {
                                data = item.data;
                            }
                        }

                        if (TP.notValid(data)) {
                            data = TP.boot.$stringify(item.data);
                        }

                        return {
                            meta: item.meta,
                            data: data
                        };
                    });

                    resolve(results);
                };

                if (pauseBeforeExec) {
                    /* eslint-disable no-debugger */
                    debugger;
                    /* eslint-enable no-debugger */
                }

                TP.shellExec(TP.hc(
                    'cmdSrc', tshInput,     //  the TSH input to run
                    'cmdEcho', false,       //  don't echo the request
                    'cmdHistory', false,    //  don't create a history entry
                    'cmdSilent', false,     //  report output so we can capture
                                            //  it
                    'onsuccess', handler,   //  success handler (same handler)
                    'onfail', handler));    //  failure handler (same handler)
            });
        }, input, shouldPause);

    }).then(function(results) {

        cmd.stdout(results);
        cmd.close(0, puppetBrowser);

    }).catch(function(err) {

        cmd.stderr(err);
        cmd.close(1, puppetBrowser);
    });
};


/**
 * Performs any final processing of the argument list prior to execution. The
 * default implementation does nothing but subtypes can leverage this method
 * to ensure the command line meets their specific requirements.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @returns {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizeArglist = function(arglist) {

    if (arglist.indexOf('--quiet') === -1) {
        arglist.push('--quiet');
    }

    return arglist;
};


/**
 * Finalize the --boot.profile argument for the command. This requires a search
 * of the current argument list. We want to use whatever may have been provided
 * on the command line before we default to some other value.
 */
Cmd.prototype.finalizeBootProfile = function(arglist) {
    var found,
        ndx,
        profile;

    found = arglist.some(function(item, index) {
        if (typeof item === 'string') {
            if (item === '--boot.profile' ||
                    item.indexOf('--boot.profile=') === 0) {
                ndx = index;
                return true;
            }
        }
        return false;
    });

    if (found) {
        profile = arglist[ndx];
        if (profile === '--boot.profile') {
            profile = arglist[ndx + 1];
            arglist.splice(ndx, 2);
        } else {
            profile = profile.replace('--boot.profile=', '');
            arglist.splice(ndx, 1);
        }

        return profile;
    }

    return this.getBootProfile();
};


/**
 * Finalize the timeout flag value in the arglist. The goal here is to preserve
 * and/or add whichever timeout value is highest. If a prior invocation set a
 * timeout we want it preserved if it's larger. Otherwise we want to use
 * whatever new value is provided.
 * @param {Array.<String>} arglist The argument list to adjust.
 * @returns {Number} The final timeout value.
 */
Cmd.prototype.finalizeTimeout = function(arglist) {
    var timeout,
        index,
        finder,
        prior;

    timeout = this.options.timeout || this.TIMEOUT;

    finder = function(arr) {
        var ind;

        ind = -1;
        arr.forEach(function(item, i) {
            if (typeof item !== 'string') {
                return;
            }

            if (item === '--timeout' || item.indexOf('--timeout=') === 0) {
                ind = i;
            }
        });

        return ind;
    };

    index = finder(arglist);
    if (index !== -1) {
        prior = arglist[index];
        if (prior.indexOf('=') === -1) {
            //  No = means next value is the value...
            prior = arglist[index + 1];
            if (parseInt(prior, 10) < timeout) {
                //  NOTE we do this twice to remove both flag and value
                arglist.splice(index, 1);
                arglist.splice(index, 1);
            } else {
                //  Convert to a single value.
                arglist[index] = '--timeout=' + prior;
                arglist.splice(index + 1, 1);
            }
        } else {
            prior = prior.split('=')[1];
            if (parseInt(prior, 10) < timeout) {
                //  Only one splice here since value was joined via '='.
                arglist.splice(index, 1);
            }
        }
    }

    //  Retest for timeout. If prior block removed it (or it was never found)
    //  then add it now.
    index = finder(arglist);
    if (index === -1) {
        arglist.push('--timeout=' + timeout);
    }

    return parseInt(timeout);
};

/**
 * Computes and returns the full boot profile value, combining the profile
 * package name with any profile config ID.
 * @returns {String} The profile@config to boot.
 */
Cmd.prototype.getBootProfile = function() {
    var root,
        config;

    root = this.getBootProfileRoot();
    config = this.getBootProfileConfig();

    if (CLI.notEmpty(config)) {
        return root + '@' + config;
    }

    return root;
};


/**
 * Computes and returns the proper profile configuration to boot. This value is
 * appended to the value from getProfileRoot() to produce the full boot profile
 * value. Most commands use the same root but some will alter the configuration.
 * @returns {String} The profile config ID.
 */
Cmd.prototype.getBootProfileConfig = function() {
    var config;

    if (CLI.notEmpty(this.options['boot.profile'])) {
        config = this.options['boot.profile'].split('@')[1];
    } else if (CLI.notEmpty(this.options['boot.config'])) {
        return this.options['boot.config'];
    }

    //  NOTE the majority of commands should load the full suite of code to
    //  ensure proper operation.
    config = config || 'reflection';

    return config;
};


/**
 * Computes and returns the proper profile to boot in support of the TSH. This
 * is the name of the package file, minus any specific boot config ID.
 * @returns {String} The profile root name.
 */
Cmd.prototype.getBootProfileRoot = function() {
    var profile;

    if (CLI.notEmpty(this.options['boot.profile'])) {
        profile = this.options['boot.profile'].split('@')[0];
    } else if (CLI.notEmpty(this.options['boot.package'])) {
        return this.options['boot.package'];
    }

    //  NOTE that boot profiles for TSH execution must use a headless profile.
    if (CLI.inProject()) {
        profile = profile || '~app_cfg/headless';
    } else {
        profile = profile || '~lib_etc/headless/headless';
    }

    return profile;
};


/**
 * Computes and returns any optional profile value, combining the profile
 * package name with any profile config ID. Note this is the profile passed to
 * any command line (script) being run, not the boot profile.
 * @returns {String} The profile@config to include with any script.
 */
Cmd.prototype.getProfile = function() {
    var root,
        config;

    root = this.getProfileRoot();
    config = this.getProfileConfig();

    if (CLI.notEmpty(config)) {
        return root + '@' + config;
    }

    return root;
};


/**
 * Computes and returns the proper profile config value. This value is appended
 * to the value from getProfileRoot() to produce the full script profile value.
 * @returns {String} The profile config ID.
 */
Cmd.prototype.getProfileConfig = function() {
    var config;

    if (CLI.notEmpty(this.options.profile)) {
        config = this.options.profile.split('@')[1];
    } else if (CLI.notEmpty(this.options.config)) {
        return this.options.config;
    }

    if (CLI.inProject()) {
        config = config || 'base';
    } else {
        config = config || 'reflection';
    }

    return config;
};


/**
 * Computes and returns the proper profile package for the script. This
 * is the name of the package file, minus any specific profile config ID.
 * @returns {String} The profile root aka packkge name.
 */
Cmd.prototype.getProfileRoot = function() {

    var profile;

    if (CLI.notEmpty(this.options.profile)) {
        profile = this.options.profile.split('@')[0];
    } else if (CLI.notEmpty(this.options.package)) {
        return this.options.package;
    }

    if (CLI.inProject()) {
        profile = profile || '~app_cfg/main';
    } else {
        profile = profile || '~lib_etc/headless/headless';
    }

    return profile;
};


/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {

    var script;

    if (CLI.notEmpty(this.options.script)) {
        script = this.options.script;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name (tsh in this case). [1] should be the "script" to run.
        script = this.options._[1];
    }

    return script;
};


/**
 * Verify any command prerequisites are in place.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.prereqs = function() {
    return 0;
};


/**
 * Invoked when the command channel to the client is closed. Normally this will
 * simply exit the process but subtypes often use it to process data captured
 * during the stdout call.
 */
Cmd.prototype.close = function(code, browser) {
    /* eslint-disable no-process-exit */
    if (CLI.isValid(browser) && browser.close) {
        browser.close();
    }
    process.exit(code);
    /* eslint-enable no-process-exit */
};


/**
 * Invoked any time the stderr channel to the client receives data. The default
 * is simply to log it as an error. Subtypes may do other error handling.
 */
Cmd.prototype.stderr = function(err) {

    //  Might be a 'ConsoleMessage' object from puppeteer...
    if (typeof err.text === 'function') {
        this.error(err.text());
        return;
    }

    this.error(err);
};


/**
 * Invoked any time the stdout channel to the client receives data. The default
 * is simply to log the data to the console. Subtypes may use this to capture
 * data for processing upon receipt of the 'exit' event.
 */
Cmd.prototype.stdout = function(obj) {
    var arr,
        cmd;

    cmd = this;
    arr = Array.isArray(obj) ? obj : [obj];

    arr.forEach(function(item) {
        var val;

        //  Might be a 'ConsoleMessage' object from puppeteer...
        if (typeof item.text === 'function') {
            val = item.text();
        } else if (CLI.isValid(item.data)) {
            //  Might be 'results' from TIBET ( { meta: ..., data: ...} ).
            val = item.data;
        } else {
            val = CLI.beautify(item);
        }

        //  Filter TSH no value/output messaging.
        if (Cmd.NO_VALUE !== val) {
            cmd.log(val);
        }
    });
};


module.exports = Cmd;

}());
