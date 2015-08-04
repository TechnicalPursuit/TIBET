/**
 * @overview Functionality specific to integrating the TDS with CouchDB.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

//  TODO:   improve error logging
//  TODO:   use options passed from server.js
//  TODO:   integrate config flags better

/* eslint no-console:0 */

(function() {

    'use strict';

    var path,
        fs,
        gaze,
        zlib,
        crypto,
        Promise,
        nano,
        mime,
        beautify,
        follow,
        TDS;

    TDS = require('./tds-middleware.js');
    Promise = require('bluebird');

    path = require('path');
    fs = require('fs');
    zlib = require('zlib');

    nano = require('nano');
    follow = require('follow');
    mime = require('mime-types');
    crypto = require('crypto');

    beautify = require('js-beautify');
    gaze = require('gaze');

    //  ---
    //  CouchDB Integration
    //  ---

    TDS.couchdb = function(options) {
        var opts,
            project,
            feed,
            baseline,
            db,
            root,
            ignore,
            pattern,
            ready,

            applyChanges,

            couchAttachmentName,
            couchDigest,

            readFile,
            writeFile,

            dbGet,
            dbAdd,
            dbRemove,
            dbRename,
            dbUpdate,

            escaper,
            watcher;

        readFile = Promise.promisify(fs.readFile);
        writeFile = Promise.promisify(fs.writeFile);

        //  ---
        //  CouchDB-To-File
        //  ---

        //  TODO: tie in real options here
        opts = {};
        feed = new follow.Feed(opts);

        //  TODO: get this in a consistent fashion.
        project = TDS.getcfg('npm.name');

        //  TODO:   update config path(s)
        root = path.resolve(TDS.expandPath(
            TDS.getcfg('couch.app.root') || 'attachments'));


        /**
         * Applies one or more changes to the file system based on a list of
         * altered attachments from the CouchDB changes feed.
         * @param {Array.<Object>} list The list of changes to process.
         */
        applyChanges = function(list) {
            console.log('CouchDB changes:\n' + beautify(JSON.stringify(list)));

            list.forEach(function(item) {
                var fullpath;

                fullpath = path.join(root, item.name);

                switch (item.action) {
                    case 'added':
                        console.log('CouchApp added: ' + item.name);
                        //  Fetch the CouchDB content and write to the FS in the
                        //  proper fully-qualified path location.
                        break;
                    case 'changed':
                        console.log('CouchApp changed: ' + item.name);
                        //  Fetch the CouchDB content and write to the FS in the
                        //  proper fully-qualified path location.
                        break;
                    case 'deleted':
                        console.log('CouchApp removed: ' + item.name);
                        //  Not going to do this here. fs.unlink tho.
                        break;
                    default:
                        break;
                }
            });
        };


        //  TODO:   use project db name and other config variables here.
        feed.db = 'http://127.0.0.1:5984/' + project;

        //  NOTE the value here has to be large enough to avoid problems with
        //  initial connection or a fatal error is thrown by follow(). For
        //  example, 100ms is often too low even on a local dev machine.
        feed.heartbeat = 200;   //  milliseconds

        /**
         * Filters potential changes feed entries before triggering on(change).
         * @param {Object} doc The CouchDB document to potentially filter.
         */
        feed.filter = function(doc) {
            var ok;

            //  TODO:   remove limitation on only app files at some point.
            //  TODO:   allow for configuration of app design doc name/id.
            ok = doc._id === '_design/app';

            if (!ok) {
                console.log('filtering: ' + beautify(JSON.stringify(doc)));
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

                console.log('CouchDB change:\n' +
                    beautify(JSON.stringify(change)));

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
                }
            }
        })

        feed.on('error', function(err) {
            console.error(err);
        });

        try {
            feed.follow();
        } catch (e) {
            console.error(e.message);
        }

        //  ---
        //  File-To-CouchDB
        //  ---

        //  TODO:   use project name and configured url endpoint data
        nano = require('nano')('http://127.0.0.1:5984');
        db = nano.use(project);

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
        couchDigest = function(data, encoding) {

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

                    //  TODO: see pushdb logic for snappy compression version.
                    //  It matches the digest consistently where zlib doesn't.
                    zlib.gzip(data, function(err, zipped) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(compute(zipped));
                    });
                } else {
                    resolve(compute(data));
                }
            });
        };

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
        ignore = TDS.getcfg('couch.watch.ignore');
        if (ignore) {
            pattern = ignore.reduce(function(str, item) {
                return str ? str + '|' + escaper(item) : escaper(item);
            }, '');

            try {
                pattern = new RegExp(pattern);
            } catch (e) {
                return console.log('Error creating RegExp: ' +
                    e.message);
            }
        } else {
            pattern = '**/*';
        }

        //  Configure a watcher instance for the couchapp root.
        watcher = new gaze.Gaze(pattern, {
            cwd: root
        });


        /**
         *
         */
        watcher.on('ready', function() {
            ready = true;
        })


        /**
         *
         */
        watcher.on('error', function(err) {
            console.log(err);
            console.log('closing down file watch for CouchDB');

            watcher.close();
        })


        /**
         *
         */
        watcher.on('nomatch', function(file) {
            console.log('nomatch for gaze');

            //  TODO:   watching an empty dir?
        })


        /**
         * Responds to notifications of new file additions. The resulting file
         * is added as attachments to the current application design document.
         * @param {String} file The name of the file to add as a full path.
         */
        dbAdd = function(file) {
            var name;

            name = couchAttachmentName(file, root);

            console.log('fetching ' + name + ' doc._rev for CRUD process');

            //  TODO:   all CRUD methods should be in a fetch/crud loop.

            return new Promise(function(resolve, reject) {

                dbGet('_design/app').then(function(response) {
                    var doc,
                        rev;

                    //console.log(beautify(JSON.stringify(response)));

                    //  Data comes in the form of an array with doc and status
                    //  so find the doc one.
                    doc = response.filter(function(item) {
                        //  TODO: couch.app_name
                        return item._id === '_design/app';
                    })[0];

                    rev = doc._rev;

                    if (doc._attachments[name]) {
                        dbUpdate(file).then(
                            function(result) {
                                resolve(result);
                            },
                            function(err) {
                                reject(err);
                            });
                        return;
                    }

                    readFile(file).then(function(data) {
                        var type;

                        console.log('read:\n' + data);

                        type = mime.lookup(path.extname(file).slice(1));

                        //  TODO: couch.app_name
                        db.attachment.insert('_design/app', name, data,
                                type, {rev: rev}, function(err, body) {

                            if (err) {
                                console.log('err: ' + err);
                                reject(err);
                                return;
                            }

                            console.log(beautify(JSON.stringify(body)));
                            resolve();
                        });
                    },
                    function(err) {
                        reject(err);
                    });
                });
            });
        };

        watcher.on('added', dbAdd);

        /**
         * Responds to nofications of changed file content. The changed file is
         * read and a CouchDB-compatible digest is computed. If the digest does
         * not match the current digest for the named file (attachment) the data
         * is updated in CouchDB.
         * @param {String} file The name of the file to update as a full path.
         */
        dbUpdate = function(file) {
            var name;

            name = couchAttachmentName(file, root);

            console.log('fetching ' + name + ' doc._rev for CRUD process');

            //  TODO:   all CRUD methods should be in a fetch/crud loop.

            return new Promise(function(resolve, reject) {

                //  Fetch revision of document, we'll need that for the update. Note
                //  that we also ask for encoding info since that's necessary to do
                //  the right process when building a digest for change detection.
                dbGet('_design/app', {att_encoding_info: true}).
                then(function(response) {
                    var doc,
                        rev,
                        att;

                    //console.log(beautify(JSON.stringify(response)));

                    doc = response.filter(function(item) {
                        return item._id === '_design/app';
                    })[0];

                    rev = doc._rev;
                    console.log('document revision: ' + rev);

                    att = doc._attachments[name];
                    if (!att) {
                        console.log('Unable to find attachment: ' + name);
                        reject('No attachment');
                        return;
                    }

                    //  Read the file content in preparation for a push.
                    console.log('reading attachment data');
                    readFile(file).then(function(data) {
                        var type;

                        console.log('read:\n' + data);
                        console.log('computing file system checksum digest');

                        couchDigest(data, att.encoding).then(function(digest) {

                            console.log('comparing attachment digest ' + digest);

                            if (digest === att.digest) {
                                console.log('' + file +
                                    ' digest values match. Skipping push.');
                                resolve();
                                return;
                            }

                            console.log(
                                'digest ' + digest + ' and ' + att.digest +
                                ' differ. Pushing data to CouchDB.');

                            type = mime.lookup(path.extname(file).slice(1));

                            db.attachment.insert('_design/app', name, data,
                                    type, {rev: rev}, function(err, body) {

                                if (err) {
                                    console.log('err: ' + err);
                                    reject(err);
                                    return;
                                }

                                console.log(beautify(JSON.stringify(body)));

                                resolve();
                            });
                        });
                    });
                });
            });
        };

        watcher.on('changed', dbUpdate);


        /**
         *
         */
        dbRemove = function(file) {
            var name;

            name = couchAttachmentName(file, root);

            console.log('fetching ' + name + ' doc._rev for CRUD process');

            //  TODO:   all CRUD methods should be in a fetch/crud loop.

            return new Promise(function(resolve, reject) {

                dbGet('_design/app').then(function(response) {
                    var doc,
                        rev;

                    //console.log(beautify(JSON.stringify(response)));

                    //  Data comes in the form of an array with doc and status
                    //  so find the doc one.
                    doc = response.filter(function(item) {
                        return item._id === '_design/app';
                    })[0];

                    rev = doc._rev;

                    //  Nothing to do. Attachment doesn't exist.
                    if (!doc._attachments[name]) {
                        resolve();
                        return;
                    }

                    db.attachment.destroy('_design/app', name, {rev: rev},
                            function(err, body) {

                        if (err) {
                            console.log('err: ' + err);
                            reject(err);
                            return;
                        }

                        console.log('deleted ' + file);
                        console.log(beautify(JSON.stringify(body)));

                        resolve();
                    });
                });
            });
        };

        watcher.on('deleted', dbRemove);


        /**
         *
         */
        dbRename = function(newPath, oldPath) {
            return dbAdd(newPath).then(dbRemove(oldPath));
        };

        watcher.on('renamed', dbRename);
    };

    module.exports = TDS;

}());

