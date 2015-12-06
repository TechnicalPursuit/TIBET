/**
 * @overview Functionality specific to integrating the TDS with CouchDB. There
 *     are
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */


(function() {

    'use strict';

    //  ---
    //  CouchDB Integration
    //  ---

    module.exports = function(options) {
        var app,
            applyChanges,
            baseline,
            beautify,
            chokidar,
            couchAttachmentName,
            couchDigest,
            crypto,
            db,
            dbAdd,
            dbGet,
            dbRemove,
            //dbRename,
            dbUpdate,
            db_app,
            db_host,
            db_name,
            db_port,
            db_scheme,
            db_url,
            doc_name,
            escaper,
            feed,
            follow,
            fs,
            ignore,
            inserting,
            logger,
            mime,
            nano,
            path,
            pattern,
            Promise,
            readFile,
            root,
            snappy,
            TDS,
            watcher,
            //writeFile,
            zlib;

        //  ---
        //  Options / Arguments
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  Should we add a route for driving the tibet command line tools from
        //  the client? Off by default for profiles other than 'development'.
        if (TDS.cfg('tds.use.couch') !== true) {
            return;
        }

        logger.info('Activating TDS CouchDB plugin.');

        beautify = require('js-beautify');
        chokidar = require('chokidar');
        crypto = require('crypto');
        follow = require('follow');
        fs = require('fs');
        mime = require('mime-types');
        nano = require('nano');
        path = require('path');
        Promise = require('bluebird');
        snappy = require('node-snappy');
        zlib = require('zlib');


        readFile = Promise.promisify(fs.readFile);
        //writeFile = Promise.promisify(fs.writeFile);

        //  Build up from config or defaults as needed.
        db_scheme = TDS.getcfg('couch.scheme') || 'http';
        db_host = TDS.getcfg('couch.host') || '127.0.0.1';
        db_port = TDS.getcfg('couch.port') || '5984';

        db_url = db_scheme + '://' + db_host + ':' + db_port;

        db_name = TDS.getcfg('couch.db_name') || TDS.getcfg('npm.name');
        db_app = TDS.getcfg('couch.app_name') || 'app';

        doc_name = '_design/' + db_app;

        //  ---
        //  CouchDB-To-File
        //  ---

        /*
All of the CouchDB _changes options are allowed. See http://guide.couchdb.org/draft/notifications.html.

db | Fully-qualified URL of a couch database. (Basic auth URLs are ok.)
since | The sequence number to start from. Use "now" to start from the latest change in the DB.
heartbeat | Milliseconds within which CouchDB must respond (default: 30000 or 30 seconds)
feed | Optional but only "continuous" is allowed
filter | Either a path to design document filter, e.g. app/important
Or a Javascript function(doc, req) { ... } which should return true or false
query_params | Optional for use in with filter functions, passed as req.query to the filter function

Besides the CouchDB options, more are available:

headers | Object with HTTP headers to add to the request
inactivity_ms | Maximum time to wait between changes. Omitting this means no maximum.
max_retry_seconds | Maximum time to wait between retries (default: 360 seconds)
initial_retry_delay | Time to wait before the first retry, in milliseconds (default 1000 milliseconds)
response_grace_time | Extra time to wait before timing out, in milliseconds (default 5000 milliseconds)
        */

        feed = new follow.Feed(options);

        feed.db = db_url + '/' + db_name;

        //  NOTE the value here has to be large enough to avoid problems with
        //  initial connection or a fatal error is thrown by follow(). For
        //  example, 100ms is often too low even on a local dev machine.
        //  TODO:   pull from config
        feed.heartbeat = 500;   //  milliseconds

        //  TODO:   more options per list above


        root = path.resolve(TDS.expandPath(
            TDS.getcfg('couch.app.root') || 'public'));


        /**
         * Applies one or more changes to the file system based on a list of
         * altered attachments from the CouchDB changes feed.
         * @param {Array.<Object>} list The list of changes to process.
         */
        applyChanges = function(list) {
            logger.debug('CouchDB changes:\n' +
                beautify(JSON.stringify(list)));

            list.forEach(function(item) {
                //var fullpath;

                //fullpath = path.join(root, item.name);

                switch (item.action) {
                    case 'added':
                        logger.info('CouchDB change: insert ' + item.name);
                        //  Fetch the CouchDB content and write to the FS in the
                        //  proper fully-qualified path location.
                        break;
                    case 'changed':
                        logger.info('CouchDB change: update ' + item.name);
                        //  Fetch the CouchDB content and write to the FS in the
                        //  proper fully-qualified path location.
                        break;
                    case 'deleted':
                        logger.info('CouchDB change: delete ' + item.name);
                        //  Not going to do this here. fs.unlink tho.
                        break;
                    default:
                        break;
                }
            });
        };


        /**
         * Filters potential changes feed entries before triggering on(change).
         * @param {Object} doc The CouchDB document to potentially filter.
         */
        feed.filter = function(doc) {
            var ok;

            //  TODO:   remove limitation on only _design doc files.
            ok = doc._id === doc_name;

            if (!ok) {
                logger.info('filtering: ' + beautify(JSON.stringify(doc)));
            }

            return ok;
        };


        /**
         * Responds to change notifications from the CouchDB changes feed. The
         * data is checked against the last known change and the delta is
         * computed to determine a set of added, removed, renamed, and updated
         * attachments which may need attention. The resulting changes are then
         * made to the local file system to maintain synchronization between the
         * file system and CouchDB.
         * @param {Object} change The follow() library change descriptor.
         */
        feed.on('change', function(change) {
            var list,
                atts,
                baserev,
                basepos;

            list = [];

            if (!baseline) {
                //  Capture a baseline to use for checking deletes etc. which
                //  can only be determined properly by comparing to past.
                baseline = change;
            } else {
                //  TODO    Note that the change object can include a _set_ of
                //  revisions. That could imply that we need to check across the
                //  list to ensure we capture all updates/deletes properly. Or
                //  more likely that we need to verify revpos values between
                //  baseline and current, not just a single revpos.

                //logger.debug('CouchDB change:\n' +
                //    beautify(JSON.stringify(change)));

                baserev = baseline.doc._rev;
                basepos = baserev.slice(0, 2);

                //  Try to diff to figure out what actually changed...
                atts = change.doc._attachments;

                //  Anything in the attachments list with a revpos greater than
                //  or equal to the baseline one is something we haven't seen.
                Object.keys(atts).forEach(function(key) {
                    if (!baseline.doc._attachments[key]) {
                        //  Didn't exist at baseline time, assume an add.
                        list.push({action: 'added', name: key});
                    } else if (atts[key].revpos >= basepos) {
                        //  Existed at baseline time, but changed since then.
                        list.push({action: 'changed', name: key});
                    }
                });

                //  Deleted files will be in the baseline, but not in the new
                //  changes list.
                Object.keys(baseline.doc._attachments).forEach(function(key) {
                    if (!atts[key]) {
                        list.push({action: 'deleted', name: key});
                    }
                });

                //  Be sure to update the baseline for the next check sequence.
                baseline = change;

                if (list.length > 0) {
                    applyChanges(list);
                } else {
                    logger.debug('CouchDB change: cyclic update notification.');
                }
            }
        })

        feed.on('error', function(err) {
            if (/EMFILE/.test(err)) {
                logger.error('Too many files open. Try increasing ulimit.');
            } else {
                logger.error(err);
            }

            return true;
        });

        try {
            feed.follow();
        } catch (e) {
            logger.error(e.message);
        }


        //  ---
        //  File-To-CouchDB
        //  ---

        nano = require('nano')(db_url);
        db = nano.use(db_name);

        dbGet = Promise.promisify(db.get);


        /**
         * Computes the proper attachment name for a file. This is the subset of
         * the full name which places the attachment below the document root.
         * @param {String} file The absolute file path, which is adjusted.
         * @param {String} [base=root] The optional base to use. Defaults to the
         *     document root computed based on couch.app.root or 'attachments'.
         * @return {String} The new attachment name.
         */
        couchAttachmentName = function(file, base) {
            var name;

            //  NOTE the dependency here on 'root' if base isn't passed.
            name = file.replace(base || root, '');
            if (name.charAt(0) === '/') {
                name = name.slice(1);
            }

            return name;
        };


        /**
         * Computes a CouchDB-compatible digest useful for determining when an
         * attachment has changed. This is necessary to help dampen cycling
         * between CouchDB changes and file system updates.
         * @param {String} data The file content to compute a hash for.
         */
        couchDigest = function(data, encoding, zipper) {

            return new Promise(function(resolve, reject) {
                var compute;

                //  Helper function to do the computation once we've determined
                //  if we need to compress the content first or not.
                compute = function(content) {
                    var hex,
                        buf;

                    //  Capture the md5 hash of the content in hex string form.
                    hex = crypto.createHash('md5').update(
                        content).digest('hex');

                    //  Convert the hex hash form into base64.
                    buf = new Buffer(hex, 'hex');

                    //  Always prepend the hashing model.
                    //  TODO: support options other than md5 for hashing.
                    resolve('md5-' + buf.toString('base64'));
                };

                //  Encoding is provided from att_encoding_info on the document.
                //  If an attachment was encoded this will contain the approach.
                //  TODO: support encodings other than gzip.
                if (encoding === 'gzip') {
                    zipper(data, function(err2, zipped) {
                        if (err2) {
                            reject(err2);
                            return;
                        }
                        resolve(compute(zipped));
                    });
                } else {
                    resolve(compute(data));
                }
            }).timeout(10000);
        };


        /**
         * Responds to notifications of new file additions. The resulting file
         * is added as attachments to the current application design document.
         * @param {String} file The name of the file to add as a full path.
         */
        dbAdd = function(file, quiet) {
            var name;

            name = couchAttachmentName(file, root);

            if (!quiet) {
                logger.info('Host FS change: insert ' + name);
            }
            logger.debug('fetching ' + name + ' doc._rev for CRUD insert');

            //  TODO:   all CRUD methods should be in a fetch/crud loop.

            return new Promise(function(resolve, reject) {

                dbGet(doc_name).then(function(response) {
                    var doc,
                        rev,
                        fullpath;

                    //logger.debug(beautify(JSON.stringify(response)));

                    //  Data comes in the form of an array with doc and status
                    //  so find the doc one.
                    doc = response.filter(function(item) {
                        return item._id === doc_name;
                    })[0];

                    rev = doc._rev;

                    if (doc._attachments[name]) {
                        inserting = true;
                        dbUpdate(file, true).then(
                            function(result) {
                                inserting = false;
                                resolve(result);
                            },
                            function(err) {
                                inserting = false;
                                reject(err);
                            });
                        return;
                    }

                    fullpath = path.join(root, file);

                    readFile(file).then(function(data) {
                        var type;

                        logger.debug('read:\n' + data);

                        type = mime.lookup(path.extname(file).slice(1));

                        logger.info('Inserting attachment ' + name);

                        db.attachment.insert(
                                doc_name, name, data, type, {rev: rev},
                                function(err, body) {

                                    if (err) {
                                        logger.error('err: ' + err);
                                        reject(err);
                                        return;
                                    }

                                    logger.info(beautify(JSON.stringify(body)));
                                    resolve();
                                });
                    },
                    function(err) {
                        reject(err);
                    });
                });
            });
        };


        /**
         * Responds to nofications of changed file content. The changed file is
         * read and a CouchDB-compatible digest is computed. If the digest does
         * not match the current digest for the named file (attachment) the data
         * is updated in CouchDB.
         * @param {String} file The name of the file to update as a full path.
         */
        dbUpdate = function(file, quiet) {
            var name;

            name = couchAttachmentName(file, root);

            if (!quiet) {
                logger.info('Host FS change: update ' + name);
            }
            logger.debug('fetching ' + name + ' doc._rev for CRUD update');

            //  TODO:   all CRUD methods should be in a fetch/crud loop.

            return new Promise(function(resolve, reject) {

                //  Fetch revision of document, we'll need that for the update.
                //  Note that we also ask for encoding info since that's
                //  necessary to do the right process when building a digest for
                //  change detection.
                dbGet(doc_name, {att_encoding_info: true}).then(
                function(response) {
                    var doc,
                        rev,
                        att,
                        fullpath;

                    //logger.debug(beautify(JSON.stringify(response)));

                    if (Array.isArray(response)) {
                        doc = response.filter(function(item) {
                            return item._id === doc_name;
                        })[0];
                    } else {
                        doc = response;
                    }

                    rev = doc._rev;
                    logger.debug('document revision: ' + rev);

                    att = doc._attachments[name];
                    if (!att) {
                        if (!inserting) {
                            dbAdd(file, true).then(
                                function(result) {
                                    resolve(result);
                                },
                                function(err) {
                                    reject(err);
                                });
                            return;
                        } else {
                            logger.warn('Unable to find attachment: ' + name);
                            reject('No attachment');
                            return;
                        }
                    }

                    //  Read the file content in preparation for a push.
                    logger.debug('reading attachment data');

                    fullpath = path.join(root, file);

                    readFile(fullpath).then(
                    function(data) {
                        var type;

                        logger.debug('read:\n' + data);
                        logger.debug('computing file system checksum digest');

                        couchDigest(data, att.encoding, zlib.gzip).then(
                        function(digest) {
                            logger.debug('comparing attachment digest ' +
                                digest);

                            if (digest === att.digest) {
                                logger.debug(couchAttachmentName(file) +
                                    ' gzip digest values match. Skipping push.');
                                resolve();
                                return;
                            }

                            //  zlib doesn't always match, but snappy does,
                            //  unfortunately snappy likes to consume file
                            //  handles so this is an ugly fallback hack to
                            //  limit our use of snappy for now.
                            logger.debug('computing snappy digest for ' + name);

                            couchDigest(data, att.encoding, snappy.compress.bind(snappy)).then(
                            function(stuff) {
                                if (stuff === att.digest) {
                                    logger.debug(couchAttachmentName(file) +
                                        ' snappy digest values match. Skipping push.');
                                    resolve();
                                    return;
                                }

                                logger.debug(couchAttachmentName(file) +
                                    ' digest ' + digest + ' and ' + att.digest +
                                    ' differ. Pushing data to CouchDB.');
                                type = mime.lookup(path.extname(file).slice(1));

                                logger.info('Updating attachment ' + name);

                                db.attachment.insert(doc_name, name, data, type,
                                        {rev: rev},
                                function(err, body) {
                                    if (err) {
                                        logger.error('err: ' + err);
                                        reject(err);
                                        return;
                                    }

                                    logger.info(beautify(JSON.stringify(body)));
                                    resolve();
                                });
                            },
                            function(err) {
                                if (/timed out/.test(err.message)) {
                                    //  timeout? sigh...snappy
                                    //  probably used up the file
                                    //  descriptors so work from the
                                    //  attachment data.
                                    logger.debug('comparing data for ' +
                                         name);
                                    db.attachment.get(doc_name, name,
                                    function(error, body) {
                                        if (error) {
                                            logger.error(error);
                                            reject(error);
                                            return;
                                        }

                                        if (body.toString() ===
                                            data.toString()) {
                                            resolve();
                                        } else {
                                            db.attachment.insert(doc_name, name,
                                                data, type, {rev: rev},
                                            function(err2, body2) {
                                                if (err2) {
                                                    logger.error('err: ' + err2);
                                                    reject(err2);
                                                    return;
                                                }

                                                logger.info(beautify(
                                                    JSON.stringify(body2)));
                                                resolve();
                                            });
                                        }
                                    });
                                } else {
                                    logger.error(err);
                                    reject(err);
                                }
                            }).timeout(1000);
                        },
                        function(err) {
                            logger.error(err);
                            reject(err);
                        });
                    },
                    function(err) {
                        logger.error(err);
                        reject(err);
                    });
                });
            });
        };


        /**
         *
         */
        dbRemove = function(file, quiet) {
            var name;

            name = couchAttachmentName(file, root);

            if (!quiet) {
                logger.info('Host FS change: remove ' + name);
            }
            logger.debug('fetching ' + name + ' doc._rev for CRUD remove');

            //  TODO:   all CRUD methods should be in a fetch/crud loop.

            return new Promise(function(resolve, reject) {

                dbGet(doc_name).then(function(response) {
                    var doc,
                        rev;

                    //logger.debug(beautify(JSON.stringify(response)));

                    //  Data comes in the form of an array with doc and status
                    //  so find the doc one.
                    doc = response.filter(function(item) {
                        return item._id === doc_name;
                    })[0];

                    rev = doc._rev;

                    //  Nothing to do. Attachment doesn't exist.
                    if (!doc._attachments[name]) {
                        resolve();
                        return;
                    }

                    logger.info('Removing attachment ' + name);

                    db.attachment.destroy(
                            doc_name, name, {rev: rev},
                            function(err, body) {

                                if (err) {
                                    logger.error('err: ' + err);
                                    reject(err);
                                    return;
                                }

                                logger.debug('deleted ' + file);
                                logger.info(beautify(JSON.stringify(body)));

                                resolve();
                            });
                });
            });
        };


        /**
         * Current commented out since chokidar does not provide a reliable way
         * to determine that a file was renamed as opposed to an unlink/add.
         *
        dbRename = function(newPath, oldPath) {
            return dbAdd(newPath).then(dbRemove(oldPath));
        };
        */


        //  Configure a watcher for our root, including any ignore
        //  patterns etc.
        if (options.watcher) {
            watcher = options.watcher;
            watcher.consumers += 1;
console.log('tds-couch sharing watcher');
        } else {
console.log('tds-couch creating watcher');
            /**
             * Helper function for escaping regex metacharacters for patterns. NOTE
             * that we need to take "ignore format" things like path/* and make it
             * path/.* or the regex will fail.
             */
            escaper = function(str) {
                return str.replace(
                    /\*/g, '\.\*').replace(
                    /\./g, '\\.').replace(
                    /\//g, '\\/');
            };

            //  Build a pattern we can use to test against ignore files.
            ignore = TDS.getcfg('tds.watch.ignore');
            if (ignore) {
                pattern = ignore.reduce(function(str, item) {
                    return str ? str + '|' + escaper(item) : escaper(item);
                }, '');

                //  TODO:   expand on this to support .svn or perhaps all
                //          dot files etc.
                pattern += '|\\.git';

                try {
                    pattern = new RegExp(pattern);
                } catch (e) {
                    return logger.error('Error creating RegExp: ' +
                        e.message);
                }
            } else {
                //  TODO:   expand on this to support .svn or perhaps all
                //          dot files etc.
                pattern = /\.git/;
            }

            //  Configure a watcher for our root, including any ignore
            //  patterns etc.
            watcher = chokidar.watch(root, {
                ignored: pattern,
                cwd: root,
                ignoreInitial: true,
                ignorePermissionErrors: true,
                persistent: true
            });

            watcher.consumers = 1;
            options.watcher = watcher;
        }

        watcher.on('all', function(event, data) {

            // Events: add, addDir, change, unlink, unlinkDir, ready, raw, error
            switch (event) {
                case 'add':
                    dbAdd(data);
                    break;
                case 'change':
                    dbUpdate(data);
                    break;
                case 'unlink':
                    dbRemove(data);
                    break;
                case 'error':
                    if (/EMFILE/.test(data)) {
                        logger.error('Too many files open. Try increasing ulimit.');
                        return;
                    } else {
                        logger.error(data);
                        return;
                    }
                    break;
                default:
                    break;
            }
        });
    };
}());

