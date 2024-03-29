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

var CLI,
    helpers,
    path,
    sh;

CLI = require('../../src/tibet/cli/_cli');
sh = require('shelljs');
path = require('path');


/**
 * Canonical `helper` object for internal utility functions.
 */
helpers = {};


/**
 * Cache of last-used couch parameters.
 * @type {Object}
 */
helpers.lastCouchParams = {};


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
    files = files.map(function(file) {
        return file.toString();
    });

    files.sort().forEach(function(filename) {
        var fullpath,
            dat;

        if (filename.charAt(0) === '_') {
            return;
        }

        if (path.extname(filename) !== '.js') {
            return;
        }

        try {
            fullpath = CLI.joinPaths(root, filename);
            dat = require(fullpath);
            if (typeof dat !== 'function') {
                throw new Error('No function found in ' + fullpath);
            } else {
                //  Slice here is to remove '.js' from view name.
                obj[filename.slice(0, -3)] = dat.toString();
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
    files = files.map(function(file) {
        return file.toString();
    });

    files.sort().forEach(function(filename) {
        var fullpath,
            gathered,
            dat;

        if (filename.charAt(0) === '_') {
            return;
        }

        if (path.extname(filename) !== '.js') {
            return;
        }

        try {
            fullpath = CLI.joinPaths(root, filename);
            dat = require(fullpath);

            gathered = {};
            obj[filename.slice(0, -3)] = gathered;

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
 * @param {Object} options A parameter block. Specifying a 'requestor' lets the
 *     routine leverage the requestor's logger etc. You can optionally specify
 *     'needsapp' as false to turn off any prompting specific to an application
 *     name (aka design document name) and 'needsdb' as false to turn off any
 *     prompting specific to a database name. A 'cfg_root' value defaults to
 *     'couch' but can be set to 'tds.tws' for example to leverage config
 *     data specific to the TWS.
 * @returns {Object} An object with db_url, db_name, and db_app values.
 */
helpers.getCouchParameters = function(options) {
    var opts,
        requestor,
        cfg_root,
        cfg_key,
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

    cfg_root = opts.cfg_root || 'cli.couch';

    cfg_key = cfg_root.replace(/\./g, '_');

    if (requestor.blend &&
        helpers.lastCouchParams &&
        helpers.lastCouchParams[cfg_key]) {
        opts = requestor.blend(opts, helpers.lastCouchParams[cfg_key]);
    }

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

        //  If we need a db, but we've defaulted it using the logic above, then
        //  ask the user to confirm.
        if (options.needsdb !== false) {
            if (requestor.prompt && opts.confirm !== false) {
                result = requestor.prompt.question(
                                    'Database name [' + db_name + '] ? ');
                if (result && result.length > 0) {
                    db_name = result;
                }
            }
        }
    }

    db_app = opts.db_app || process.env.COUCH_APPNAME;
    if (!db_app) {
        db_app = requestor.getcfg(cfg_root + '.db_app') ||
            requestor.getcfg('npm.name');

        //  If we need an app, but we've defaulted it using the logic above,
        //  then ask the user to confirm.
        if (options.needsapp !== false) {
            if (requestor.prompt && opts.confirm !== false) {
                result = requestor.prompt.question(
                                    'Application name [' + db_app + '] ? ');
                if (result && result.length > 0) {
                    db_app = result;
                }
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
    helpers.lastCouchParams[cfg_key] = params;

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

    cfg_root = opts.cfg_root || 'couch';

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
            msg =
                'Missing CouchDB login credential(s).' +
                ' You may need user:pass@host in URL.\n' +
                'For security reasons you should not rely' +
                ' on public databases in CouchDB.';
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
 * Returns a data structure of db reference information that can be used by
 * commands that want to provide an alternate way of acquiring db references
 * rather than using the flag parameters of '--db_name', etc.
 * @returns {Object} An object usable by the command.
 */
helpers.getDBReferenceInfo = function(argstr) {
    var parts,
        retval;

    retval = {};

    //  All commands allow target specification via a dotted arg1 value. Since
    //  most commands operate on a database or database and appname we default
    //  to assuming dbname[.appname]. Subcommands may alter this as needed.
    if (argstr) {
        parts = argstr.split('.');
        switch (parts.length) {
            case 1:
                retval.db_name = parts[0];
                break;
            case 2:
                retval.db_name = parts[0];
                retval.db_app = parts[1];
                break;
            default:
                //  abstract place to hold part 3 (viewname, something else?)
                retval.db_name = parts[0];
                retval.db_app = parts[1];
                retval.db_ref = parts[2];
                break;
        }
    }

    return retval;
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
    fullpath = CLI.joinPaths(root, 'rewrites.js');
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
    fullpath = CLI.joinPaths(root, 'validate_doc_update.js');
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
    fullpath = CLI.joinPaths(root, 'filters');
    if (sh.test('-d', fullpath)) {
        obj.filters = helpers.gatherDesignDocFunctions(obj.filters, fullpath);
    }

    //  fulltext: obj with 'index' key and optional 'analyzer' and 'defaults'
    //      keys pointing to obj/string data.
    fullpath = CLI.joinPaths(root, 'fulltext');
    if (sh.test('-d', fullpath)) {
        obj.fulltext = helpers.gatherDesignDocObjects(obj.fulltext, fullpath);
    }

    //  lists: function
    fullpath = CLI.joinPaths(root, 'lists');
    if (sh.test('-d', fullpath)) {
        obj.lists = helpers.gatherDesignDocFunctions(obj.lists, fullpath);
    }

    //  shows: function
    fullpath = CLI.joinPaths(root, 'shows');
    if (sh.test('-d', fullpath)) {
        obj.shows = helpers.gatherDesignDocFunctions(obj.shows, fullpath);
    }

    //  updates: function
    fullpath = CLI.joinPaths(root, 'updates');
    if (sh.test('-d', fullpath)) {
        obj.updates = helpers.gatherDesignDocFunctions(obj.updates, fullpath);
    }

    //  views: obj with 'map' and optional 'reduce' keys with function instances
    //      as their values.
    fullpath = CLI.joinPaths(root, 'views');
    if (sh.test('-d', fullpath)) {
        obj.views = helpers.gatherDesignDocObjects(obj.views, fullpath);
    }

    //  TODO:   push attachments... see 'tibet couch pushapp' for code.

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
helpers.server = function(url, logger) {
    var nano,
        Promise,
        use;

    nano = require('nano')(url);
    Promise = require('bluebird');

    //  Update use() to return an enhanced db object.
    use = nano.use;
    nano.use = function(name) {
        var db;

        db = use(name);

        //  Note that we Wrap the result Promises of these calls into Bluebird
        //  Promises for consistency when calling from other CouchDB bits that
        //  use Bluebird Promises.

        db.upsert = function(doc, params) {
            //  We wrap all Promise result values here Bluebird Promises for
            //  better sharing across TIBET.
            if (CLI.notEmpty(doc._id)) {
                return Promise.resolve(db.get(doc._id)).then(
                    function(result) {
                        //  ensure we have the latest rev for update.
                        doc._rev = result._rev;
                        return Promise.resolve(db.insert(doc, params));
                    }).catch(function(err) {
                        logger.error('Document update error: ' + err.message);
                        logger.debug(err);
                    });
            } else {
                return Promise.resolve(db.insert(doc, params)).catch(
                    function(err) {
                        logger.error('Document insert error: ' + err.message);
                        logger.debug(err);
                    });
            }
        };

        db.viewRows = function(appname, viewname, viewParams) {
            return Promise.resolve(db.view(appname, viewname, viewParams)).then(
                function(result) {
                    return result.rows;
                });
        };

        db.viewDocs = function(appname, viewname, viewParams) {
            var params;

            params = viewParams || {};
            params.include_docs = true;

            return Promise.resolve(db.view(appname, viewname, params)).then(
                function(result) {
                    var docs;

                    docs = result.rows.map(function(row) {
                        return row.doc;
                    });

                    return docs;
                });
        };

        db.viewKeys = function(appname, viewname, viewParams) {
            return Promise.resolve(db.view(appname, viewname, viewParams)).then(
                function(result) {
                    var keys;

                    keys = result.rows.map(function(row) {
                        return row.key;
                    });

                    return keys;
                });
        };

        db.viewValues = function(appname, viewname, viewParams) {
            return Promise.resolve(db.view(appname, viewname, viewParams)).then(
                function(result) {
                    var values;

                    values = result.rows.map(function(row) {
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
