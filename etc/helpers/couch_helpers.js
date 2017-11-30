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

var helpers,
    path,
    sh;
    // beautify;

sh = require('shelljs');
path = require('path');
// beautify = require('js-beautify').js_beautify;


/**
 * Canonical `helper` object for internal utility functions.
 */
helpers = {};


/**
 * Cache of last-used couch parameters.
 * @type {Object}
 */
helpers.lastCouchParams = null;


/**
 * Iterates over the files in a directory and returns an object whose key/value
 * pairs are the file names and the function bodies returned by require() calls
 * to load each file. Used to load filters, shows, lists, etc. where the content
 * of the directory is a set of files which export a function instance.
 * NOTE that files which are not '.js' files or which start with '_' are
 * ignored. by this routine.
 * @param {Object} target The target object to augment, or null to create one.
 * @param {String} root The directory path containing the files to gather from.
 * @returns {Object} The key/value pairs generated from file names and content.
 */
helpers.gatherDesignDocFunctions = function(target, root) {
    var obj,
        files;

    obj = target || {};

    files = sh.ls(root);
    files.sort().forEach(function(file) {
        var fullpath,
            dat;

        if (file.charAt(0) === '_') {
            return;
        }

        if (path.extname(file) !== '.js') {
            return;
        }

        try {
            fullpath = path.join(root, file);
            dat = require(fullpath);
            if (typeof dat !== 'function') {
                throw new Error('No function found in ' + fullpath);
            } else {
                //  Slice here is to remove '.js' from view name.
                obj[file.slice(0, -3)] = dat.toString();
            }
        } catch (e) {
            throw new Error(e.message);
        }
    });

    return obj;
};


/**
 * Iterates over a set of files contained in a specified root location and loads
 * their object definitions into the target object. This approach is necessary
 * for things like view definitions which require both a map and reduce key and
 * function value.
 * @param {Object} target The target object to augment, or null to create one.
 * @param {String} root The directory path containing the files to gather from.
 * @returns {Object} The key/value pairs generated from file names and content.
 */
helpers.gatherDesignDocObjects = function(target, root) {
    var obj,
        files;

    obj = target || {};

    files = sh.ls(root);
    files.sort().forEach(function(file) {
        var fullpath,
            gathered,
            dat;

        if (file.charAt(0) === '_') {
            return;
        }

        if (path.extname(file) !== '.js') {
            return;
        }

        try {
            fullpath = path.join(root, file);
            dat = require(fullpath);

            gathered = {};
            obj[file.slice(0, -3)] = gathered;

            Object.keys(dat).forEach(function(key) {
                gathered[key] = dat[key].toString();
            });
        } catch (e) {
            throw new Error(e.message);
        }
    });

    return obj;
};


/**
 * Returns a CouchDB connection reference, equivalent to the result object
 * returned by the 'server' method on this object. See @server for more info.
 * @param {Object} options A parameter block suitable for the getCouchParameters
 *     call which defines any couch and TIBET parameters necessary.
 * @returns {Object} An object implementing the 'use' command for DB access.
 */
helpers.getCouchConnection = function(options) {
    var opts,
        requestor,
        params,
        db_url,
        server;

    opts = options || {};

    requestor = opts.requestor;
    if (!requestor) {
        requestor = require('../../src/tibet/cli/_cli');
        opts.confirm = false;
    }

    params = helpers.getCouchParameters(opts);
    db_url = params.db_url;

    server = helpers.server(db_url);

    return server;
};


/**
 * Returns a database object capable of accessing a specific CouchDB database
 *     via both synchronous and asynchronous (Promisified) methods. The async
 *     versions all end in 'Async'. See nano documentation for the API.
 * @param {Object} options A parameter block suitable for the getCouchParameters
 *     call which defines any couch and TIBET parameters necessary.
 * @returns {Object} A database object implementing promisified versions of all
 *     nano database object methods.
 */
helpers.getCouchDatabase = function(options) {
    var opts,
        requestor,
        params,
        db_url,
        db_name,
        server,
        db;

    opts = options || {};

    requestor = opts.requestor;
    if (!requestor) {
        requestor = require('../../src/tibet/cli/_cli');
        opts.confirm = false;
    }

    params = helpers.getCouchParameters(opts);
    db_url = params.db_url;
    db_name = params.db_name;

    server = helpers.server(db_url);
    db = server.use(db_name);

    return db;
};


/**
 * Computes the common parameters needed by other interfaces to CouchDB. This
 * includes the CouchDB URL, the target database name, and the target design doc
 * application name.
 * @param {Object} options A parameter block with at least a 'requestor'. You
 *     can optionally specify 'needsapp' as false to turn off any prompting
 *     specific to an application name (aka design document name).
 * @returns {Object} An object with db_url, db_name, and db_app values.
 */
helpers.getCouchParameters = function(options) {
    var opts,
        requestor,
        cfg_root,
        result,
        db_url,
        db_scheme,
        db_host,
        db_port,
        db_user,
        db_pass,
        db_name,
        db_app,
        params;

    opts = options || {};

    requestor = opts.requestor;
    if (!requestor) {
        requestor = require('../../src/tibet/cli/_cli');
        opts.confirm = false;
    }

    //  Check cache so we reuse across multiple non-confirm calls.
    if (!opts.confirm && helpers.lastCouchParams) {
        return helpers.lastCouchParams;
    }

    cfg_root = opts.cfg_root || 'tds.couch.';

    db_url = opts.db_url || helpers.getCouchURL(opts);

    db_scheme = opts.db_scheme ||
        requestor.getcfg(cfg_root + '.scheme') || 'http';
    db_host = opts.db_host ||
        requestor.getcfg(cfg_root + '.host') || '127.0.0.1';
    db_port = opts.db_port ||
        requestor.getcfg(cfg_root + '.port') === undefined ? '5984' :
            requestor.getcfg(cfg_root + '.port');

    db_user = opts.db_user || process.env.COUCH_KEY || process.env.COUCH_USER;
    db_pass = opts.db_pass || process.env.COUCH_PASS;

    //  Watch out for special chars, esp in the password.
    if (db_user) {
        db_user = encodeURIComponent(db_user);
    }

    if (db_pass) {
        db_pass = encodeURIComponent(db_pass);
    }

    db_name = opts.db_name || process.env.COUCH_DATABASE;
    if (!db_name) {
        db_name = requestor.getcfg(cfg_root + '.db_name') ||
            requestor.getcfg('npm.name');
    }

    if (options.needsdb !== false) {
        if (requestor.prompt && opts.confirm !== false) {
            result = requestor.prompt.question('Database name [' + db_name + '] ? ');
            if (result && result.length > 0) {
                db_name = result;
            }
        }
    }

    db_app = opts.db_app || process.env.COUCH_APPNAME;
    if (!db_app) {
        db_app = requestor.getcfg(cfg_root + '.db_app') ||
            requestor.getcfg('npm.name');
    }

    if (options.needsapp !== false) {
        if (requestor.prompt && opts.confirm !== false) {
            result = requestor.prompt.question('Application name [' + db_app + '] ? ');
            if (result && result.length > 0) {
                db_app = result;
            }
        }
    }

    params = {
        db_url: db_url,
        db_scheme: db_scheme,
        db_host: db_host,
        db_port: db_port,
        db_user: db_user,
        db_pass: db_pass,
        db_name: db_name,
        db_app: db_app
    };

    //  Cache so we can reuse across multiple non-confirm calls.
    helpers.lastCouchParams = params;

    return params;
};


/**
 * Computes the proper CouchDB URL for use with other CouchDB interfaces. The
 * computed URL will include user and password information as needed based on
 * COUCH_KEY/COUCH_USER and COUCH_PASS environment settings. All other data is
 * pulled from tds configuration parameters.
 * @param {Object} options A parameter block with at least a 'requestor'.
 * @returns {String} The database url.
 */
helpers.getCouchURL = function(options) {
    var opts,
        msg,
        requestor,
        cfg_root,
        result,
        db_scheme,
        db_host,
        db_port,
        db_user,
        db_pass,
        db_url;

    opts = options || {};

    requestor = opts.requestor;
    if (!requestor) {
        requestor = require('../../src/tibet/cli/_cli');
        opts.confirm = false;
    }

    cfg_root = opts.cfg_root || 'tds.couch';

    db_user = opts.db_user || process.env.COUCH_KEY || process.env.COUCH_USER;
    db_pass = opts.db_pass || process.env.COUCH_PASS;

    //  Watch out for special chars, esp in the password.
    if (db_user) {
        db_user = encodeURIComponent(db_user);
    }

    if (db_pass) {
        db_pass = encodeURIComponent(db_pass);
    }

    db_url = opts.db_url || process.env.COUCH_URL;

    if (!db_url) {
        //  Build up from config or defaults as needed.
        db_scheme = opts.db_scheme ||
            requestor.getcfg(cfg_root + '.scheme') || 'http';
        db_host = opts.db_host ||
            requestor.getcfg(cfg_root + '.host') || '127.0.0.1';
        db_port = opts.db_port ||
            requestor.getcfg(cfg_root + '.port') === undefined ? '5984' :
                requestor.getcfg(cfg_root + '.port');

        db_url = db_scheme + '://';
        if (db_user && db_pass) {
            db_url += db_user + ':' + db_pass + '@' + db_host;
        } else {
            msg = 'Missing CouchDB credential(s). May need user:pass@host in URL.';
            if (requestor.warn) {
                requestor.warn(msg);
            } else if (requestor.logger && requestor.logger.warn) {
                requestor.logger.warn(msg);
            }
            db_url += db_host;
        }

        if (db_port) {
            db_url += ':' + db_port;
        }
    } else if (db_user && db_pass && !/@/.test(db_url)) {
        db_url = db_url.replace(/:\/\//, '://' + db_user + ':' + db_pass + '@');
    }

    if (requestor.prompt && opts.confirm !== false) {
        result = requestor.prompt.question('CouchDB url [' +
            helpers.maskCouchAuth(db_url) + '] ? ');
        if (result && result.length > 0) {
            db_url = result;
        }

        requestor.log('using base url \'' +
            helpers.maskCouchAuth(db_url) + '\'.');
    }

    return db_url;
};


/**
 * Returns a version of the url provided with any user/pass information masked
 * out. This is used for prompts and logging where basic auth data could
 * potentially be exposed to view.
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
    newurl = match[1] + '//' + 'xxx:xxx@' + match[4];

    return newurl;
};


/**
 * Populates the various design document fields by scanning the root directory
 * provided for things like 'views', 'shows', 'lists', etc. and injecting the
 * proper file content into the proper location(s) in the design document.
 * TODO: this helper function does not currently handle attachment logic.
 * @param {Object} doc The current design doc, if any.
 * @param {String} root The path to a root directory containing design doc
 *     template data.
 * @param {Object} [params] The couch parameters to use. If not provided the
 *     getCouchParameters call will be invoked to provide them.
 * @returns {Object} The updated/populated design document object.
 */
helpers.populateDesignDoc = function(doc, root, params) {
    var obj,
        options,
        fullpath,
        dat;

    if (doc) {
        obj = doc;
    } else {
        options = params || helpers.getCouchParameters();
        obj = {
            _id: '_design/' + options.db_app
        };
    }

    if (!sh.test('-d', root)) {
        throw new Error('Unable to find template directory: ' + root);
    }

    //  Start with files which represent a single value rather than a set.

    //  rewrites.js: an array of objects with 4 keys: from, to, method, query
    fullpath = path.join(root, 'rewrites.js');
    if (sh.test('-e', fullpath)) {
        try {
            dat = require(fullpath);
            obj.rewrites = dat;
        } catch (e) {
            // TODO
            throw new Error(e.message);
        }
    }

    //  validate_doc_update.js: function(newDoc, oldDoc, userCtx, secObj)
    fullpath = path.join(root, 'validate_doc_update.js');
    if (sh.test('-e', fullpath)) {
        try {
            dat = require(fullpath);
            if (typeof dat !== 'function') {
                throw new Error('No function found in ' + fullpath);
            }
            obj.validate_doc_update = dat.toString();
        } catch (e) {
            // TODO
            throw new Error(e.message);
        }
    }

    //  Remaining directories should contain js files in specific formats. The
    //  file name(s) represent the key and the exported return value is used as
    //  the value placed into the document. NOTE that function objects have a
    //  toString invoked on them automatically.

    //  filters: function
    fullpath = path.join(root, 'filters');
    if (sh.test('-d', fullpath)) {
        obj.filters = helpers.gatherDesignDocFunctions(obj.filters, fullpath);
    }

    //  fulltext: obj with 'index' key and optional 'analyzer' and 'defaults'
    //      keys pointing to obj/string data.
    fullpath = path.join(root, 'fulltext');
    if (sh.test('-d', fullpath)) {
        obj.fulltext = helpers.gatherDesignDocObjects(obj.fulltext, fullpath);
    }

    //  lists: function
    fullpath = path.join(root, 'lists');
    if (sh.test('-d', fullpath)) {
        obj.lists = helpers.gatherDesignDocFunctions(obj.lists, fullpath);
    }

    //  shows: function
    fullpath = path.join(root, 'shows');
    if (sh.test('-d', fullpath)) {
        obj.shows = helpers.gatherDesignDocFunctions(obj.shows, fullpath);
    }

    //  updates: function
    fullpath = path.join(root, 'updates');
    if (sh.test('-d', fullpath)) {
        obj.updates = helpers.gatherDesignDocFunctions(obj.updates, fullpath);
    }

    //  views: obj with 'map' and optional 'reduce' keys with function instances
    //      as their values.
    fullpath = path.join(root, 'views');
    if (sh.test('-d', fullpath)) {
        obj.views = helpers.gatherDesignDocObjects(obj.views, fullpath);
    }

    //  TODO:   push attachments... see 'tibet couch pushapp' for code.

    // console.log(beautify(JSON.stringify(obj)));

    return obj;
};


/**
 * A substitute for the nano() call which provides a server URL to act as the
 * root scope for operations. The server object returned here is essentially an
 * augmented nano object with promise-based operations in place. This allows you
 * to access normal nano-based functions via promises by using an API with
 * 'Async' on the end of the target method. For example:
 *      server = helpers.server(db_url);
 *      server.db.listAsync().then(function(json) {
 *          console.log(JSON.stringify(json));
 *      });
 */
helpers.server = function(url) {
    var nano,
        Promise,
        use;

    nano = require('nano')(url);
    Promise = require('bluebird');

    Promise.promisifyAll(nano);     //  nano.uuids etc.
    Promise.promisifyAll(nano.db);  //  nano.db.list etc.

    //  Update use() to return a promisified db object.
    use = nano.use;
    nano.use = function(name) {
        var db;

        db = use(name);
        Promise.promisifyAll(db);
        Promise.promisifyAll(db.multipart);
        Promise.promisifyAll(db.attachment);

        db.viewAsyncRows = function(appname, viewname, viewParams) {

            return db.viewAsync(appname, viewname, viewParams).then(
                function(result) {
                    var body;

                    body = result[0];

                    return body.rows;
                });
        };

        db.viewAsyncDocs = function(appname, viewname, viewParams) {
            var params;

            params = viewParams || {};
            params.include_docs = true;

            return db.viewAsync(appname, viewname, params).then(
                function(result) {
                    var body,
                        docs;

                    body = result[0];
                    docs = body.rows.map(function(row) {
                        return row.doc;
                    });

                    return docs;
                });
        };

        db.viewAsyncKeys = function(appname, viewname, viewParams) {

            return db.viewAsync(appname, viewname, viewParams).then(
                function(result) {
                    var body,
                        keys;

                    body = result[0];
                    keys = body.rows.map(function(row) {
                        return row.key;
                    });

                    return keys;
                });
        };

        db.viewAsyncValues = function(appname, viewname, viewParams) {

            return db.viewAsync(appname, viewname, viewParams).then(
                function(result) {
                    var body,
                        values;

                    body = result[0];
                    values = body.rows.map(function(row) {
                        return row.value;
                    });

                    return values;
                });
        };

        return db;
    };

    nano.db.use = nano.use;
    nano.scope = nano.use;
    nano.db.scope = nano.scope;

    //  Create a promisified variant of the use() call itself.
    nano.useAsync = function(name) {
        return new Promise(function(resolve, reject) {
            var db;

            try {
                //  NOTE we're using the promisified version here.
                db = nano.use(name);
                resolve(db);
            } catch (e) {
                reject(e);
            }
        });
    };

    return nano;
};


module.exports = helpers;

}());
