//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview Common shared utility functions for TIBET-style 'make' operations.
 *     See the make.js command file for more information on 'tibet make'.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var helpers;


/**
 * Canonical `helper` object for internal utility functions.
 */
helpers = {};


/**
 * Computes the common parameters needed by nano and/or other interfaces to
 * CouchDB. This includes the CouchDB URL, the target database name, and the
 * target design doc application name.
 * @return {Object} An object with db_url, db_name, and db_app values.
 */
helpers.getCouchParameters = function(make) {
    var db_url,
        db_name,
        db_app,
        result;

    if (!make) {
        throw new Error(
            'Invalid call to helper function. No task provided.');
    }

    db_url = helpers.getCouchURL(make);

    db_name = process.env.COUCH_DATABASE;
    if (!db_name) {
        db_name = make.CLI.getcfg('tds.couch.db_name') || make.getProjectName();
    }

    result = make.prompt.question('Database name [' + db_name + '] ? ');
    if (result && result.length > 0) {
        db_name = result;
    }

    db_app = process.env.COUCH_APPNAME;
    if (!db_app) {
        db_app = make.CLI.getcfg('tds.couch.app_name') || 'app';
    }

    return {
        db_url: db_url,
        db_name: db_name,
        db_app: db_app
    };
};


/**
 * Computes the proper CouchDB URL for use with nano and other CouchDB
 * interfaces. The computed URL will include user and password information as
 * needed based on COUCH_USER and COUCH_PASS environment settings. All other
 * data is pulled from tds configuration parameters.
 */
helpers.getCouchURL = function(make) {
    var db_scheme,
        db_host,
        db_port,
        db_url,
        db_user,
        db_pass,
        result;

    if (!make) {
        throw new Error(
            'Invalid call to helper function. No task provided.');
    }

    db_url = process.env.COUCH_URL;
    if (!db_url) {
        //  Build up from config or defaults as needed.
        db_scheme = make.CLI.getcfg('tds.couch.scheme') || 'http';
        db_host = make.CLI.getcfg('tds.couch.host') || '127.0.0.1';
        db_port = make.CLI.getcfg('tds.couch.port') === undefined ?
            '5984' : make.CLI.getcfg('tds.couch.port');

        db_user = process.env.COUCH_USER;
        db_pass = process.env.COUCH_PASS;

        db_url = db_scheme + '://';
        if (db_user && db_pass) {
            db_url += db_user + ':' + db_pass + '@' + db_host;
        } else {
            db_url += db_host;
        }

        if (db_port) {
            db_url += ':' + db_port;
        }
    }

    result = make.prompt.question('CouchDB base [' +
        helpers.maskCouchAuth(db_url) + '] ? ');
    if (result && result.length > 0) {
        db_url = result;
    }
    make.log('using base url \'' + helpers.maskCouchAuth(db_url) + '\'.');

    return db_url;
};


/**
 * Returns a version of the url provided with any user/pass information masked
 * out. This is used for prompts and logging.
 * @param {String} url The URL to mask.
 * @returns {String} The masked URL.
 */
helpers.maskCouchAuth = function(url) {
    var regex,
        match,
        newurl;

    //  scheme://(user):(pass)@hostetc...
    regex = /(.*)\/\/(.*):(.*)@(.*)/;

    if (!regex.test(url)) {
        return url;
    }

    match = regex.exec(url);
    newurl = match[1] + '//' + match[4];

    return newurl;
};


module.exports = helpers;

}());
