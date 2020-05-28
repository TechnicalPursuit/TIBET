//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview A common supertype for commands like 'tibet couch' and 'tibet tws'
 *     which interact with CouchDB as their primary task.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    couch,
    path,
    sh;

CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_multi');   //  NOTE we inherit from 'multi' here.
Cmd.prototype = new Cmd.Parent();

couch = require('../../../etc/helpers/couch_helpers');
path = require('path');
sh = require('shelljs');

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
 * @type {String}
 */
Cmd.NAME = '_couchdb';


//  ---
//  Instance Attributes
//  ---

//  NOTE the parse options here are just for the 'couch' command itself.
//  Subcommands need to parse via their own set of options.

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
boolean: ['confirm'],
    default: {
        confirm: true
    }
}, Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


//  ---
//  Instance Methods
//  ---

//  ---
//  Command Execution
//  ---

/**
 * Performs error handling for couchdb. This method deconstructs an Error object
 * as returned by nano to glean the maximum information and then calls
 * CLI.handleError to handle the error.
 * @param {Error} e The error object.
 * @param {string} phase The phase of command processing.
 * @param {string} command The command that failed.
 * @param {Boolean} exit Set to false to avoid exiting the process.
 */
CLI.handleCouchError = function(e, phase, command, exit) {

    e.msg = '{"error":"' + e.error + '","reason":"' + e.reason + '"}';

    return CLI.handleError(e, phase, command, exit);
};


//  ---
//  Utilities
//  ---

/**
* Low-level routine for fetching a document. The document id should be
* provided along with any options which are proper for db.get.
* @param {String} id The document ID to retrieve from CouchDB.
* @param {Object} [options] nano-compatible options db.get.
* @param {Object} [params] Couch parameters if available.
* @returns {Promise} A promise with 'then' and 'catch' options.
*/
Cmd.prototype.dbGet = function(id, options, params) {
    var server,
        db,
        db_url,
        db_name,
        db_app,
        dbParams;

    dbParams = CLI.blend(
                {requestor: CLI, confirm: this.options.confirm},
                params);

    dbParams = CLI.blend(
                dbParams,
                couch.getCouchParameters(dbParams));

    db_url = dbParams.db_url;
    db_name = dbParams.db_name;
    db_app = dbParams.db_app;

    if (!db_url || !db_name || !db_app) {
        this.error('Unable to determine CouchDB parameters.');
        return;
    }

    server = couch.server(db_url);
    db = server.use(db_name);

    return db.getAsync(id, options).then(function(result) {
        return result;
    });
};


/**
* Low-level routine for building an index for Mango. The index object
* should be provided along with any options which are proper for db.createIndex.
* @param {Object} index The index object to be used.
* @param {Object} [options] nano-compatible options db.createIndex.
* @param {Object} [params] Couch parameters if available.
* @returns {Promise} A promise with 'then' and 'catch' options.
*/
Cmd.prototype.dbIndex = function(index, options, params) {
    var server,
        db,
        db_url,
        db_name,
        db_app,
        dbParams;

    dbParams = CLI.blend(
                {requestor: CLI, confirm: this.options.confirm},
                params);

    dbParams = CLI.blend(
                dbParams,
                couch.getCouchParameters(dbParams));

    db_url = dbParams.db_url;
    db_name = dbParams.db_name;
    db_app = dbParams.db_app;

    if (!db_url || !db_name || !db_app) {
        this.error('Unable to determine CouchDB parameters.');
        return;
    }

    server = couch.server(db_url);
    db = server.use(db_name);

    return db.createIndex(index).then(function(result) {
        return result;
    });
};


/**
* Low-level routine for inserting/updating a document.
* @param {Object} doc The JavaScript object to be inserted.
* @param {Object} [options] nano-compatible options db.insert.
* @param {Object} [params] Couch parameters if available.
* @returns {Promise} A promise with 'then' and 'catch' options.
*/
Cmd.prototype.dbInsert = function(doc, options, params) {
    var server,
        db,
        db_url,
        db_name,
        db_app,
        dbParams;

    dbParams = CLI.blend(
                {requestor: CLI, confirm: this.options.confirm},
                params);

    dbParams = CLI.blend(
                dbParams,
                couch.getCouchParameters(dbParams));

    db_url = dbParams.db_url;
    db_name = dbParams.db_name;
    db_app = dbParams.db_app;

    if (!db_url || !db_name || !db_app) {
        this.error('Unable to determine CouchDB parameters.');
        return;
    }

    server = couch.server(db_url);
    db = server.use(db_name);

    return db.insertAsync(doc, options).then(function(result) {
        return result;
    });
};


/**
* Low-level routine for querying for documents using Mango. The query object
* should be provided along with any options which are proper for db.find.
* @param {Object} query The Mango query to execute in CouchDB.
* @param {Object} [options] nano-compatible options db.find.
* @param {Object} [params] Couch parameters if available.
* @returns {Promise} A promise with 'then' and 'catch' options.
*/
Cmd.prototype.dbQuery = function(query, options, params) {
    var server,
        db,
        db_url,
        db_name,
        db_app,
        dbParams;

    dbParams = CLI.blend(
                {requestor: CLI, confirm: this.options.confirm},
                params);

    dbParams = CLI.blend(
                dbParams,
                couch.getCouchParameters(dbParams));

    db_url = dbParams.db_url;
    db_name = dbParams.db_name;
    db_app = dbParams.db_app;

    if (!db_url || !db_name || !db_app) {
        this.error('Unable to determine CouchDB parameters.');
        return;
    }

    server = couch.server(db_url);
    db = server.use(db_name);

    return db.findAsync(query).then(function(result) {
        return result.docs;
    });
};


/**
* Low-level listing routine for displaying results of running a view.
* @param {String} viewname The view to execute to produce results.
* @param {Object} [options] nano-compatible options db.view.
* @param {Object} [params] Couch parameters if available.
* @returns {Promise} A promise with 'then' and 'catch' options.
*/
Cmd.prototype.dbView = function(viewname, options, params) {
    var server,
        db,
        db_url,
        db_name,
        db_app,
        dbParams;

    dbParams = CLI.blend(
                {requestor: CLI, confirm: this.options.confirm},
                params);

    dbParams = CLI.blend(
                dbParams,
                couch.getCouchParameters(dbParams));

    db_url = dbParams.db_url;
    db_name = dbParams.db_name;
    db_app = dbParams.db_app;

    if (!db_url || !db_name || !db_app) {
        this.error('Unable to determine CouchDB parameters.');
        return;
    }

    server = couch.server(db_url);
    db = server.use(db_name);

    return db.viewAsyncRows(db_app, viewname, options);
};


/**
* Pushes all JSON documents in a specified directory to the current
* database. Typically invoked by by executePush variants to load sets of data.
* @param {String} dir The directory to load. Note that this call is _not_
*     recursive so only documents in the top level are loaded. Also note this
*     value will be run through the CLI's expandPath routine to expand any
*     virtual path values.
* @param {Object} [params] Couch parameters if available.
* @returns {Promise} A promise with 'then' and 'catch' options.
*/
Cmd.prototype.pushDir = function(dir, params) {
    var fullpath,
        cmd,
        promises;

    cmd = this;

    fullpath = CLI.expandPath(dir);
    if (!sh.test('-e', fullpath)) {
        this.error('Unable to find ' + fullpath);
        return;
    }

    if (!sh.test('-d', fullpath)) {
        this.error('Target is not a directory: ' + fullpath);
        return;
    }

    promises = [];

    sh.ls(CLI.joinPaths(fullpath, '*.json')).forEach(function(file) {
        var filename;

        filename = file.toString();

        if (path.basename(filename).charAt(0) === '_') {
            cmd.warn('ignoring: ' + filename);
            return;
        }

        //  Force confirmation off here. We don't want to prompt for every
        //  individual file.
        promises.push(cmd.pushFile(file, params));
    });

    return Promise.all(promises);
};


/**
* Pushes a single JSON document into the current database.
* @param {String} file The file name to be loaded. Note that this will be run
*     through the CLI's expandPath routine to handle any virtual paths.
* @param {Object} [params] Couch parameters if available.
* @returns {Promise} A promise with 'then' and 'catch' options.
*/
Cmd.prototype.pushFile = function(file, params) {
    var dat,
        doc,
        fullpath;

    fullpath = CLI.expandPath(file);

    if (!sh.test('-e', fullpath)) {
        this.error('Unable to find ' + fullpath);
        return;
    }

    dat = sh.cat(fullpath);
    if (!dat) {
        this.error('No content read for file: ' + fullpath);
    }

    dat = dat.toString();

    try {
        doc = JSON.parse(dat);
    } catch (e) {
        this.error('Error parsing ' + fullpath + ': ' + e.message);
        return;
    }

    return this.pushOne(fullpath, doc, params);
};


/**
* Pushes an actual document object (JSON which has been parsed or a JavaScript
* POJO) associated with a particular source file path. The path is necessary to
* ensure that the document at that location is updated with the _id value
* returned by CouchDB if the upload is successful, or that the _rev is updated.
* @param {String} fullpath A full absolute path for the source of the document.
* @param {Object} doc The javascript object to upload as a document.
* @param {Object} [params] Couch parameters if available.
* @returns {Promise} A promise with 'then' and 'catch' options.
*/
Cmd.prototype.pushOne = function(fullpath, doc, params) {
    var dbParams,
        db_url,
        db_name,
        server,
        db,
        cmd,
        skip;

    cmd = this;

    dbParams = CLI.blend(
                {requestor: CLI, confirm: this.options.confirm},
                params);

    dbParams = CLI.blend(
                dbParams,
                couch.getCouchParameters(dbParams));

    db_url = dbParams.db_url;
    db_name = dbParams.db_name;

    if (!db_url || !db_name) {
        this.error('Unable to determine CouchDB parameters.');
        return;
    }

    server = couch.server(db_url);
    db = server.use(db_name);

    skip = false;

    if (doc._id) {
        //  Have to fetch to get the proper _rev to update...
        return db.getAsync(doc._id).then(function(response) {
            var rev;

            //  Set revs to match so we can compare actual 'value' other
            //  than the rev. If they're the same we can skip the insert.
            rev = response._rev;
            delete response._rev;

            if (CLI.isSameJSON(doc, response)) {
                cmd.log('skipping: ' + fullpath);
                skip = true;
                return;
            }

            doc._rev = rev;
            cmd.log('updating: ' + fullpath);
        }).catch(function(err) {
            if (err.message !== 'missing') {
                //  most common error will be 'missing' document due to
                //  deletion, purge, etc.
                cmd.error(fullpath + ' =>');
                CLI.handleCouchError(err, Cmd.NAME, 'pushOne', false);

                throw err;
            }

            //  missing...don't worry about rev check...

            delete doc._rev;    //  clear any _rev to avoid update conflict

            cmd.log('inserting: ' + fullpath);

        }).then(function() {
            if (!skip) {
                return db.insertAsync(doc);
            }
        }).then(function(response2) {
            if (!skip) {
                cmd.log(fullpath + ' =>\n' + CLI.beautify(response2));

                //  Set the document ID to the response ID so we know it.
                doc._id = response2.id;
                delete doc._rev;

                //  Write the doc to the path after beautifying it.
                new sh.ShellString(CLI.beautify(doc)).to(fullpath);
            }
        }).catch(function(err2) {
            cmd.error(fullpath + ' =>');
            CLI.handleCouchError(err2, Cmd.NAME, 'pushOne', false);

            throw err2;
        });
    } else {
        return db.insertAsync(doc).then(function(response) {

            cmd.log(fullpath + ' =>\n' + CLI.beautify(response));

            //  Set the document ID to the response ID so we know it.
            doc._id = response.id;
            delete doc._rev;
            new sh.ShellString(CLI.beautify(doc)).to(fullpath);
        }).catch(function(err) {
            cmd.error(fullpath + ' =>');
            CLI.handleCouchError(err, Cmd.NAME, 'pushOne', false);

            throw err;
        });
    }
};


module.exports = Cmd;

}());
