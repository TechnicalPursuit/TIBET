/**
 * @overview Functionality specific to integrating the TDS with CouchDB. There
 *     are two primary of functionality: Couch-to-FS and FS-to-Couch. These
 *     combine to give you a way to keep CouchDB up to date with filesystem
 *     changes (and if your booting TIBET out of CouchDB it will live-source).
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Watches the CouchDB changes feed and file system, sharing information
     * about changes between the two data sets. This allows you to use
     * live-sourcing from the file system into a CouchDB-booted TIBET
     * application and to propogate changes from CouchDB down to the file
     * system as desired.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            applyChanges,
            appRoot,
            baseline,
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
            db_config,
            db_host,
            db_name,
            db_port,
            db_scheme,
            db_url,
            doc_name,
            escaper,
            feed,
            feedopts,
            follow,
            fs,
            ignore,
            inserting,
            logger,
            mime,
            nano,
            path,
            pattern,
            processDesignChange,
            processDocumentChange,
            pushpos,
            //pushrev,
            Promise,
            readFile,
            TDS,
            watcher,
            //writeFile,
            zlib;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  Should we add a route for driving the tibet command line tools from
        //  the client? Off by default for profiles other than 'development'.
        if (TDS.cfg('tds.use.couch') !== true) {
            return;
        }
        logger.debug('Integrating TDS CouchDB interface.');

        //  ---
        //  Requires
        //  ---

        chokidar = require('chokidar');
        crypto = require('crypto');
        follow = require('follow');
        fs = require('fs');
        mime = require('mime-types');
        nano = require('nano');
        path = require('path');
        Promise = require('bluebird');
        zlib = require('zlib');

        //  ---
        //  Variables
        //  ---

        //  Ensure we have default option slotting for this plugin.
        options.tds_couch = options.tds_couch || {};

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
         * Per docs for the `follow` module:
         *

        All of the CouchDB _changes options are allowed. See
        http://guide.couchdb.org/draft/notifications.html.

        db | Fully-qualified URL of a couch database. (Basic auth URLs are ok.)

        since | The sequence number to start from. Use "now" to start from the
        latest change in the DB.

        heartbeat | Milliseconds within which CouchDB must respond (default:
        30000 or 30 seconds)

        feed | Optional but only "continuous" is allowed

        filter | Either a path to design document filter, e.g. app/important Or
        a Javascript function(doc, req) { ... } which should return true or
        false

        query_params | Optional for use in with filter functions, passed as
        req.query to the filter function

        *
        * Besides the CouchDB options, more are available:
        *

        headers | Object with HTTP headers to add to the request

        inactivity_ms | Maximum time to wait between changes. Omitting this
        means no maximum.

        max_retry_seconds | Maximum time to wait between retries (default: 360
        seconds)

        initial_retry_delay | Time to wait before the first retry, in
        milliseconds (default 1000 milliseconds)

        response_grace_time | Extra time to wait before timing out, in
        milliseconds (default 5000 milliseconds)
        */

        feedopts = {
            db: db_url + '/' + db_name,
        //    feed: TDS.getcfg('couch.watch.feed') || 'continuous',
            heartbeat: TDS.getcfg('couch.watch.heartbeat') || 500
        //    inactivity_ms: TDS.getcfg('couch.watch.inactivity_ms') || null,
        //    initial_retry_delay: TDS.getcfg('couch.watch.initial_retry_delay') || 1000,
        //    max_retry_seconds: TDS.getcfg('couch.watch.max_retry_seconds') || 360,
        //    response_grace_time: TDS.getcfg('couch.watch.response_grace_time') || 5000,
        //    since: TDS.getcfg('couch.watch.since') || 'now'
        };

        feed = new follow.Feed(feedopts);


        //  Most paths that come from CouchDB won't have a root value which
        //  should normally default to wherever the application has set app root
        //  (often below the tibet_pub directory location).
        appRoot = path.resolve(TDS.expandPath('~app'));


        /**
         * Applies one or more changes to the file system based on a list of
         * altered attachments from the CouchDB changes feed.
         * @param {Array.<Object>} list The list of changes to process.
         */
        applyChanges = function(list) {

            //  TODO:   check to see if this feature is even enabled. It might
            //  be off at the config level.

            //  TODO:   see if we're in a git project, make that a requirement
            //  since that implies changes aren't inherently irreversible.

            //logger.debug('CouchDB changes:\n' +
            //  TDS.beautify(JSON.stringify(list)));

            list.forEach(function(item) {
                //var fullpath;

                //fullpath = path.join(appRoot, item.name);

                logger.info('CouchDB item: ' + JSON.stringify(item));

                switch (item.action) {
                    case 'add':
                        //  Fetch the CouchDB content and write to the FS in the
                        //  proper fully-qualified path location.
                        break;
                    case 'change':
                        //  TODO:   see if the file is tracked, if not refuse to alter it

                        //  Fetch the CouchDB content and write to the FS in the
                        //  proper fully-qualified path location.
                        break;
                    case 'unlink':
                        //  TODO:   see if the file is tracked, if not refuse to alter it

                        //  Not going to do this here. fs.unlink tho.
                        break;
                    default:
                        break;
                }
            });
        };


        /**
         * Handles change notifications specific to the project's design
         * document. This focuses largely on adjusting the file system to
         * properly reflect the state of the CouchDB database (or at least
         * invoking the applyChanges call to do that as needed).
         * @param {Object} change The follow() library change descriptor.
         */
        processDesignChange = function(change) {
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
                //logger.debug('CouchDB change:\n' +
                //    TDS.beautify(JSON.stringify(change)));

                baserev = baseline.doc._rev;
                basepos = baserev.slice(0, baserev.indexOf('-'));

                //  Try to diff to figure out what actually changed...
                atts = change.doc._attachments;

                //  Anything in the attachments list with a revpos greater than
                //  or equal to the baseline one is something we haven't seen.
                Object.keys(atts).forEach(function(key) {
                    var attachment;

                    attachment = atts[key];
                    if (!baseline.doc._attachments[key]) {
                        //  Didn't exist at baseline time, assume an add.
                        list.push({action: 'add', name: key,
                            type: 'attachment', attachment: attachment});
                    } else if (attachment.revpos > basepos &&
                            attachment.revpos !== pushpos) {
                        //  Existed at baseline time, but changed since then
                        //  and not due to the last push from the FS watcher.
                        list.push({action: 'change', name: key,
                            type: 'attachment', attachment: attachment});
                    }
                });

                //  Deleted files will be in the baseline, but not in the new
                //  changes list.
                Object.keys(baseline.doc._attachments).forEach(function(key) {
                    if (!atts[key] && pushpos <= basepos) {
                        //  If the attachment isn't found AND we aren't holding
                        //  a push position greater than the one we're looking
                        //  at (meaning it was our push that deleted it). Then
                        //  track the change in our list.
                        list.push({action: 'unlink', name: key,
                            type: 'attachment', attachment:
                                baseline.doc._attachments[key]});
                    }
                });

                //  Be sure to update the baseline for the next check sequence.
                baseline = change;

                if (list.length > 0) {
                    applyChanges(list);
                } else {
                    //  Output that we saw the change, but we know about it,
                    //  probably because it's coming back in response to a file
                    //  system change we pushed to CouchDB a moment ago.
                    logger.debug('CouchDB change: cyclic update notification.');
                }
            }
        };


        /**
         * Handles document changes in the CouchDB change feed which are NOT
         * related to the project's design document.
         * @param {Object} change The follow() library change descriptor.
         */
        processDocumentChange = options.tds_couch.change || function(change) {
            //logger.debug('CouchDB change:\n' +
             //   TDS.beautify(JSON.stringify(change)));

            //  Delegate task processing to the TDS TaskRunner if available.
            if (TDS.taskrunner) {
                process.nextTick(function() {
                    TDS.taskrunner(change.doc);
                });
            }
            return;
        };


        /**
         * Filters potential changes feed entries before triggering on(change).
         * @param {Object} doc The CouchDB document to potentially filter.
         */
        feed.filter = options.tds_couch.filter || function(doc) {
            var filter,
                regex,
                result;

            filter = TDS.cfg('couch.watch.filter');
            if (filter) {
                regex = new RegExp(escaper(filter));
                if (regex) {
                    result = regex.test(doc._id);
                    if (!result) {
                        logger.debug('Filtering change: ' +
                            TDS.beautify(JSON.stringify(doc)));
                    }
                    return result;
                }
            }

            return true;
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
            var design;

            design = change.doc._id === doc_name;
            if (design) {
                return processDesignChange(change);
            }
            return processDocumentChange(change);
        });


        /**
         * Responds to notifications of an error in the CouchDB changes feed
         * watcher processing.
         * @param {Error} err The error that triggered this handler.
         */
        feed.on('error', function(err) {
            //  A common problem, especially on Macs, is an error due to running
            //  out of open file handles. Try to help clarify that one here.
            if (/EMFILE/.test(err)) {
                logger.error('Too many files open. Try increasing ulimit.');
            } else {
                logger.error(err);
            }

            return true;
        });


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

            //  NOTE the dependency here on appRoot if base isn't passed.
            name = file.replace(base || appRoot, '');
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
                    resolve('md5-' + buf.toString('base64'));
                };

                //  Encoding is provided from att_encoding_info on the document.
                //  If an attachment was encoded this will contain the approach.
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

            name = couchAttachmentName(file, appRoot);

            if (!quiet) {
                logger.info('Host FS change: insert ' + name);
            }

            //  TODO:   all CRUD methods should be in a fetch/crud loop.

            return new Promise(function(resolve, reject) {

                dbGet(doc_name).then(function(response) {
                    var doc,
                        rev,
                        fullpath;

                    //logger.debug(TDS.beautify(JSON.stringify(response)));

                    if (Array.isArray(response)) {
                        doc = response.filter(function(item) {
                            return item._id === doc_name;
                        })[0];
                    } else {
                        doc = response;
                    }

                    rev = doc._rev;
                    logger.info('document revision: ' + rev);

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

                    fullpath = path.join(appRoot, file);

                    readFile(fullpath).then(function(data) {
                        var type,
                            content;

                        //logger.debug('read:\n' + data);

                        //  NOTE:   An empty file will cause nano and ultimately
                        //  the request object to blow up on an invalid 'body'
                        //  so we force a default value as content for empty.
                        content = '' + data || TDS.getcfg('couch.watch.empty');

                        type = mime.lookup(path.extname(fullpath).slice(1));

                        logger.info('Inserting attachment ' + name);

                        db.attachment.insert(
                                doc_name, name, content, type, {rev: rev},
                                function(err, body) {

                                    if (err) {
                                        logger.error('err: ' + err);
                                        reject(err);
                                        return;
                                    }

                                    logger.info(TDS.beautify(JSON.stringify(body)));

                                    //  Track last pushed revision.
                                    //pushrev = body.rev;
                                    pushpos = 1 *
                                        body.rev.slice(0, body.rev.indexOf('-'));

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

            name = couchAttachmentName(file, appRoot);

            if (!quiet) {
                logger.info('Host FS change: update ' + name);
            }

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

                    //logger.debug(TDS.beautify(JSON.stringify(response)));

                    if (Array.isArray(response)) {
                        doc = response.filter(function(item) {
                            return item._id === doc_name;
                        })[0];
                    } else {
                        doc = response;
                    }

                    rev = doc._rev;
                    logger.info('document revision: ' + rev);

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
                    fullpath = path.join(appRoot, file);
                    readFile(fullpath).then(
                    function(data) {
                        var type,
                            content;

                        //logger.debug('read:\n' + data);

                        //  NOTE:   An empty file will cause nano and ultimately
                        //  the request object to blow up on an invalid 'body'
                        //  so we force a default value as content for empty.
                        content = '' + data || TDS.getcfg('couch.watch.empty');

                        //  Set the compression level for gzip to the one our
                        //  database is configured to use for attachments.
                        zlib.Z_DEFAULT_COMPRESSION =
                            db_config.attachments.compression_level;

                        couchDigest(content, att.encoding, zlib.gzip).then(
                        function(digest) {

                            if (digest === att.digest) {
                                logger.info(couchAttachmentName(file) +
                                    ' digest values match. Skipping push.');
                                resolve();
                                return;
                            }

                            logger.info(couchAttachmentName(file) + ' digests' +
                                //' digest ' + digest + ' and ' + att.digest +
                                ' differ. Pushing data to CouchDB.');
                            type = mime.lookup(path.extname(file).slice(1));

                            db.attachment.insert(doc_name, name, content,
                                    type, {rev: rev},
                            function(err, body) {
                                if (err) {
                                    logger.error('err: ' + err);
                                    reject(err);
                                    return;
                                }

                                logger.info(TDS.beautify(JSON.stringify(body)));

                                //  Track last pushed revision.
                                //pushrev = body.rev;
                                pushpos = 1 *
                                    body.rev.slice(0, body.rev.indexOf('-'));

                                resolve();
                            });
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

            name = couchAttachmentName(file, appRoot);

            if (!quiet) {
                logger.info('Host FS change: remove ' + name);
            }

            //  TODO:   all CRUD methods should be in a fetch/crud loop.

            return new Promise(function(resolve, reject) {

                dbGet(doc_name).then(function(response) {
                    var doc,
                        rev;

                    //logger.debug(TDS.beautify(JSON.stringify(response)));

                    if (Array.isArray(response)) {
                        doc = response.filter(function(item) {
                            return item._id === doc_name;
                        })[0];
                    } else {
                        doc = response;
                    }

                    rev = doc._rev;
                    logger.info('document revision: ' + rev);

                    //  Nothing to do. Attachment doesn't exist.
                    if (!doc._attachments[name]) {
                        logger.info('Ignoring unknown attachment ' + name);
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

                                logger.info('deleted ' + file);
                                //logger.info(TDS.beautify(JSON.stringify(body)));

                                //  Track last pushed revision.
                                //pushrev = body.rev;
                                pushpos = 1 *
                                    body.rev.slice(0, body.rev.indexOf('-'));

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


        //  ---
        //  Activation
        //  ---

        //  Couch-To-FS

        //  Access the database configuration data. We use this for gzip level
        //  confirmation and other potential processing.
        require('nano')(db_url).relax({db: '_config'}, function(err, dat) {
            if (err) {
                logger.error(err);
                return;
            }

            db_config = dat;
        });

        //  Activate the database changes feed follower.
        try {
            feed.follow();
        } catch (e) {
            logger.error(e.message);
        }

        //  FS-To-Couch

        //  Configure a watcher for our root, including any ignore
        //  patterns etc.
        if (options.watcher) {
            watcher = options.watcher;
            watcher.consumers += 1;

            logger.debug('TDS CouchDB interface sharing file watcher.');

        } else {

            logger.debug('TDS CouchDB interface creating file watcher.');

            /**
             * Helper function for escaping regex metacharacters for patterns.
             * NOTE that we need to take "ignore format" things like path/* and
             * make it path/.* or the regex will fail.
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

                pattern += '|\\.git|\\.svn';

                try {
                    pattern = new RegExp(pattern);
                } catch (e) {
                    return logger.error('Error creating RegExp: ' +
                        e.message);
                }
            } else {
                pattern = /\.git|\.svn/;
            }

            logger.debug('TDS CouchDB interface observing: ' + appRoot);

            //  Configure a watcher for our root, including any ignore
            //  patterns etc.
            watcher = chokidar.watch(appRoot, {
                ignored: pattern,
                cwd: appRoot,
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
                        logger.error(
                            'Too many files open. Try increasing ulimit.');
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

}(this));

