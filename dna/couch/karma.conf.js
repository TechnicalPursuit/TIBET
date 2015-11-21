//  ============================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ============================================================================

/**
 * @overview Karma test runner configuration specific to TIBET projects. Under
 *     normal circumstances you shouldn't need to alter this file, you can use
 *     a "karma" property in your project's tibet.json file to set properties.
 */

//  ----------------------------------------------------------------------------

/* eslint indent:0 */
(function(root) {

var express,
    static,
    app,
    http,
    path,
    json,
    timeout,
    browsers,
    level,
    port,
    proxy;

//  ----------------------------------------------------------------------------
//  TIBET Configuration Data
//  ----------------------------------------------------------------------------

    path = require('path');

    //  Load TIBET's configuration file to check for karma settings.
    json = require(path.join(__dirname, './tibet.json'));
    if (json && json.karma) {

        if (json.karma.browsers) {
            browsers = json.karma.browsers;
        }

        if (json.karma.level) {
            level = json.karma.level;
        }

        if (json.karma.port) {
            port = json.karma.port;
        }

        if (json.karma.proxy) {
            proxy = json.karma.proxy;
        }

        if (json.karma.timeout) {
            timeout = json.karma.timeout;
        }
    }

    //  Default the values needed by both karma and our proxy server here.
    port = port || 9876;
    proxy = proxy || (port + 1);

//  ----------------------------------------------------------------------------
//  Karma Configuration Data
//  ----------------------------------------------------------------------------

module.exports = function(config) {

    //  Default karma-only settings while inside function where config is valid.
    browsers = browsers || ['Chrome'];
    level = (level !== undefined) ? level : config.LOG_INFO,
    timeout = timeout || 15000;

    config.set({

    //  ------------------------------------------------------------------------
    //  Stuff You May Want To Change
    //  ------------------------------------------------------------------------

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits, otherwise you
    // hit the DEBUG button to run tests and can re-run via reload etc.
    singleRun: true,

    // start these browsers for testing
    // See https://npmjs.org/browse/keyword/karma-launcher
    browsers: browsers,

    // options include: config.LOG_DISABLE ||
    // config.LOG_ERROR || config.LOG_WARN ||
    // config.LOG_INFO || config.LOG_DEBUG
    logLevel: level !== undefined ? level : config.LOG_INFO,

    // preprocess matching files before serving them to the browser?
    // See https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    // test results reporter to use. possible values: 'dots', 'progress'.
    // See https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // enable / disable executing tests whenever any file changes
    autoWatch: false,

    //  ------------------------------------------------------------------------
    //  The Other Stuff
    //  ------------------------------------------------------------------------

    frameworks: ['tibet'],

    useIframe: true,

    urlRoot: '/',

    basePath: '',

    port: port,

    //  Note we create a small express server to serve "static" content which
    //  runs on the proxy port defined here. This lets TIBET boot without any
    //  overhead in copying the entirety of TIBET and your application into a
    //  temp directory. It also avoids other Karma issues with file mappings.
    proxies: {
        '/base/': 'http://127.0.0.1:' + proxy + '/'
    },

    //  Yes, there are no files. The adapter loads TIBET and it does the rest.
    //  Adding files will in most cases cause things to fail to boot properly.
    files: [],

    //  No files, so no need to exclude anything. Don't add exclusions here or
    //  it's likely to cause the TIBET boot process/testing to fail.
    exclude: [],

    //  Tell Karma how long to wait (for boot etc) before inactivity disconnect.
    //  This is necessary since Karma "connects" quickly but depending on your
    //  TIBET boot configuration it can be close to 10 seconds (the default
    //  timeout) before TIBET starts sending output to Karma for testing.
    browserNoActivityTimeout: timeout

    })
};

//  ----------------------------------------------------------------------------
//  Micro-Server For TIBET Loading
//  ----------------------------------------------------------------------------

/*
 * We don't want to have to start/stop a separate server instance to launch
 * TIBET properly so we create an ultralight version of a server here that
 * the tibet_loader can take advantage of to acquire the resources it needs.
 * This avoids the necessity of telling Karma about files that aren't tests.
 */
express = require('express');
static = require('serve-static');
http = require('http');

app = express();
app.use(static(__dirname));
http.createServer(app).listen(proxy);

}(this));

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
