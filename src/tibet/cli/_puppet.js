//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet echo' command. Echoes the current command line arguments
 *     to stdout. This can be useful to help debug how command arguments are
 *     processed by the TIBET CLI. The echo command is also a good template for
 *     creating your own custom commands.
 */
//  ========================================================================

/* eslint indent:0 no-console:0, no-process-exit:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    // path,
    puppeteer;

CLI = require('./_cli');
// path = require('path');
puppeteer = require('puppeteer');

//  ---
//  Type Construction
//  ---

Cmd = function() {
    //  empty
};
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'puppet';

//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet puppet [args]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    var ignoreChromeOutput;

    /*
     * Helper to remove Chrome-initiated messages we don't need to see.
     */
    ignoreChromeOutput = function(text) {
        return /Synchronous XMLHttpRequest on the main thread/i.test(text);
    };

    puppeteer.launch({
        //  Let us access file urls so we don't have to launch a server.
        args: ['--disable-web-security', '--allow-file-access-from-files'],

        devtools: true,         //  For debugging
        headless: false,        //  For debugging
        slowMo: true            //  For debugging

    }).then(function(browser) {
        var fullpath;

        browser.newPage().then(function(page) {

            page.on('close', (evt) => {
                process.exit(0);
            });

            page.on('error', (err) => {
                console.log(err);
                process.exit(1);
            });

            page.on('console', (msg) => {
                //  Strip browser messages we don't initiate.
                if (ignoreChromeOutput(msg.text())) {
                    return;
                }

                switch (msg.type()) {
                    case 'error':
                        console.error(msg.text());
                        break;
                    default:
                        console.log(msg.text());
                        break;
                }
            });

            //  You can launch a file path as long as you set the right flags
            //  for Chrome to avoid issues with cross-origin security glitches.
            fullpath = 'file:' + CLI.expandPath('~app/index.html') +
                '#?boot.profile=development@developer&boot.teamtibet';

            browser.userAgent().then(function(agent) {

                //  NOTE: this value must match the value found in tibet_cfg.js
                //  for the boot system to properly recognize headless context.
                page.setUserAgent(agent + ' Puppeteer');

                page.goto(fullpath).then(function(result) {

                    var start,
                        end;

                    start = new Date();

                    //  Once the page loads TIBET will start to load. We need to
                    //  wait for it to finish before we continue.
                    page.waitForFunction(() => {

                        //  If $$stop isn't falsey it's going to have an error in
                        //  it. Capture and exit.
                        if (TP && TP.boot && TP.boot.$$stop) {
                            throw new Error(TP.boot.$$stop);
                        }

                        if (TP && TP.sys && TP.sys.hasStarted) {
                            return TP.sys.hasStarted();
                        }

                        return false;

                    }).then(() => {

                        end = new Date();

                        //  Once TIBET boots run whatever TSH command we're being
                        //  asked to execute for this process.
                        console.log('TIBET started in ' + (end - start) + 'ms');

                        // browser.close();

                    }).catch((err) => {
                        //  page.waitForFunction
                        console.error(err);
                    });

                }).catch((err) => {
                    //  page.goto
                    console.error(err);
                });

            }).catch((err) => {
                //  browser.userAgent
                console.error(err);
            });

        }).catch((err) => {
            //  browser.newPage
            console.error(err);
        });

    }).catch((err) => {
        //  puppeteer.launch
        console.error(err);
    });

    return 0;
};


module.exports = Cmd;

}());
