/**
 * @overview TIBET + CouchDB makefile.js
 */

(function() {

    'use strict';

    var sh,
        fs,
        zlib,
        beautify,
        crypto,
        snappy,
        readFile,
        mime,
        helpers,
        Promise,
        getDatabaseParameters,
        targets;

    fs = require('fs');
    sh = require('shelljs');
    zlib = require('zlib');

    snappy = require('node-snappy');

    beautify = require('js-beautify');
    crypto = require('crypto');
    helpers = require('tibet/src/tibet/cli/_make_helpers');

    Promise = require('bluebird');

    readFile = Promise.promisify(fs.readFile);

    //  Adjust mime mapping for files we use that don't look up correctly.
    mime = require('mime-types');
    mime.types['opts'] = 'text/plain';
    mime.types['pegjs'] = 'text/plain';
    mime.types['tmx'] = 'application/xml';

    /**
     * A helper function to handle prompting the user for common database
     * parameters. The make parameter should be provided to grant access to the
     * currently running task object.
     * @param {Object} make The make command instance.
     * @returns {Object} An object containing db_url and db_name keys.
     */
    getDatabaseParameters = function(make) {
        var db_scheme,
            db_host,
            db_port,
            db_url,
            db_name,
            db_app,
            result;

        if (!make) {
            throw new Error(
                'Invalid call to helper function. No task provided.');
        }

        //  Build up from config or defaults as needed.
        db_scheme = make.CLI.getcfg('couch.scheme') || 'http';
        db_host = make.CLI.getcfg('couch.host') || '127.0.0.1';
        db_port = make.CLI.getcfg('couch.port') || '5984';

        db_url = db_scheme + '://' + db_host + ':' + db_port;

        db_name = make.CLI.getcfg('couch.db_name') || make.getProjectName();
        db_app = make.CLI.getcfg('couch.app_name') || 'app';

        result = make.prompt.question('Database url [' + db_url + '] ? ');
        if (result && result.length > 0) {
            db_url = result;
        }
        make.log('using database url \'' + db_url + '\'.');

        result = make.prompt.question('Database name [' + db_name + '] ? ');
        if (result && result.length > 0) {
            db_name = result;
        }

        return {
            db_url: db_url,
            db_name: db_name,
            db_app: db_app
        };
    };

    /**
     * Canonical `targets` object for exporting the various target functions.
     */
    targets = {};

    /**
     */
    targets.build = function(make) {
        make.log('building app...');

        targets.clean().then(
            targets.rollup).then(
            function() {
                targets.build.resolve();
            },
            function() {
                targets.build.reject();
            });
    };

    /**
     * Run lint and test commands to verify the code is in good shape.
     */
    targets.checkup = function(make) {
        var result;

        make.log('checking for lint...');

        result = sh.exec('tibet lint');
        if (result.code !== 0) {
            targets.checkup.reject();
            return;
        }

        make.log('running unit tests...');

        result = sh.exec('tibet test');
        if (result.code !== 0) {
            targets.checkup.reject();
            return;
        }

        targets.checkup.resolve();
    };

    /**
     */
    targets.clean = function(make) {
        make.log('cleaning...');

        if (sh.test('-d', './build')) {
            sh.rm('-rf', './build/*');
        }

        targets.clean.resolve();
    };

    /**
     */
    targets.rollup = function(make) {
        make.log('rolling up assets...');

        if (!sh.test('-d', './build')) {
            sh.mkdir('./build');
        }

        helpers.rollup(make, {
            pkg: '~app_cfg/app.xml',
            config: 'base',
            dir: './build',
            prefix: 'app_',
            headers: true,
            minify: false,
            zip: true
        }).then(function() {
            return helpers.rollup(make, {
                pkg: '~app_cfg/app.xml',
                config: 'base',
                dir: './build',
                prefix: 'app_',
                headers: true,
                minify: true,
                zip: true
            });
        }).then(
            function() {
                targets.rollup.resolve();
            },
            function() {
                targets.rollup.reject();
            });
    };

    /**
     * Create a new CouchDB database.
     */
    targets.createdb = function(make) {
        var params,
            db_url,
            db_name,
            nano;

        params = getDatabaseParameters(make);
        db_url = params.db_url;
        db_name = params.db_name;

        make.log('creating database: ' + db_url + '/' + db_name);

        nano = require('nano')(db_url);
        nano.db.create(db_name,
            function(error) {
                if (error) {
                    targets.createdb.reject(error);
                    return;
                }

                make.log('database created.');
                targets.createdb.resolve();
            });
    };

    /**
     * Push the current app.js and attachments content to CouchDB.
     */
    targets.pushdb = function(make) {
        var CLI,
            params,
            db_url,
            db_name,
            db_app,
            doc_name,
            doc_url,
            target,
            insertAll,
            updateAll,
            list,
            err,
            couchAttachment,
            couchDigest,
            couchMime,
            db,
            dbGet,
            nano;

        CLI = make.CLI;
        params = getDatabaseParameters(make);
        db_url = params.db_url;
        db_name = params.db_name;
        db_app = params.db_app;

        doc_name = '_design/' + db_app;
        doc_url = db_url + '/' + doc_name;

        //  Helper function when the document doesn't exist yet.
        insertAll = function(files) {

            return new Promise(function(resolve, reject) {
                var attachments,
                    newdoc;

                attachments = [];

                files.forEach(function(item) {
                    var spec;

                    spec = {};

                    //  TODO: Not sure how to send the content header for an
                    //  individual attachment (or if it's even necessary). Check
                    //  back on this.
                    if (/\.gz$/.test(item)) {
                        return false;
                    }

                    spec.name = couchAttachment(item);
                    spec.content_type = couchMime(item);
                    spec.data = fs.readFileSync(item);

                    attachments.push(spec);
                });

                attachments.forEach(function(item) {
                    make.verbose(item.name + ', ' + item.content_type + ', ' +
                        item.data.length + ' bytes.');
                });

                make.log('pushing document content: ' + doc_url);

                // TODO: copy the tibet.json from the top level into the
                // attachments directory but remove 'attachments' from the
                // app.inf reference and any other paths which might include
                // attachments.

                //  The base document. Be sure to set the _id here to match the
                //  document name passed to the multipart insert below.
                newdoc = {
                    _id: doc_name,
                    rewrites: [
                        {from: '/', to: 'index.html'},
                        {from: '/api', to: '../../'},
                        {from: '/api/*', to: '../../*'},
                        {from: '/*', to: '*'}
                    ]
                };

                //  Do the deed...and cross our fingers :)
                nano = require('nano')(db_url + '/' + db_name);
                nano.multipart.insert(newdoc, attachments, doc_name,
                    function(error) {
                        if (error) {
                            make.error(error);
                            reject(error);
                            return;
                        }

                        make.log('application pushed.');
                        resolve();
                    });
            });
        };


        couchAttachment = function(fullname, base) {
            var root,
                name;

            root = base || CLI.expandPath('~app');

            name = fullname.replace(root, '');
            if (name && name.charAt(0) === '/') {
                name = name.slice(1);
            }
            return name;
        };


        couchMime = function(attachment) {
            var type;

            type = mime.lookup(attachment);
            if (!type) {
                make.warn('Defaulting to application/octet-stream for ' +
                    attachment);
                type = 'application/octet-stream';
            }
            return type;
        };


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


        //  Helper function when the document exists. then we need to compare
        //  to see which attachments need to be updated.
        updateAll = function(existing, files) {

            return new Promise(function(resolve, reject) {
                var doc_atts,
                    root,
                    attachments;

                root = CLI.expandPath('~app');

                doc_atts = existing._attachments || {};
                attachments = [];

                //make.log(beautify(JSON.stringify(doc_atts)));

                Promise.settle(files.map(function(item) {
                    var name,
                        encoding,
                        digest,
                        current;

                    //  TODO: Not sure how to send the content header for an
                    //  individual attachment (or if it's even necessary). Check
                    //  back on this.
                    if (/\.gz$/.test(item)) {
                        return Promise.reject('ignore');
                    }

                    name = couchAttachment(item, root);

                    current = doc_atts[name];
                    if (current) {

                        encoding = current.encoding;
                        digest = current.digest;

                        return new Promise(function(resolve2, reject2) {

                            //  existing attachment, does the digest match?
                            readFile(item).then(function(data) {

                                //  Store the data. We'll need this for push.
                                current.data = data;

                                make.verbose(
                                    'computing zlib digest for ' +
                                    name);

                                couchDigest(data, encoding, zlib.gzip).then(
                                function(result) {

                                    if (result === digest) {
                                        reject2('unchanged');
                                    } else {
                                        //  zlib doesn't always match, but
                                        //  snappy does, unfortunately snappy
                                        //  likes to consume file handles so
                                        //  this is an ugly fallback hack to
                                        //  limit our use of snappy for now.
                                        make.verbose(
                                            'computing snappy digest for ' +
                                            name);
                                        couchDigest(data, encoding,
                                            snappy.compress.bind(snappy)).then(

                                        function(stuff) {
                                            if (stuff === digest) {
                                                reject2('unchanged');
                                            } else {
                                                resolve2('update');
                                            }
                                        },
                                        function(err3) {
                                            if (/timed out/.test(err3.message)) {
                                                //  timeout? sigh...snappy
                                                //  probably used up the file
                                                //  descriptors so work from the
                                                //  attachment data.
                                                make.verbose('comparing data for ' +
                                                     name);
                                                db.attachment.get(doc_name, name,
                                                function(error, body) {
                                                    if (error) {
                                                        make.error(error);
                                                        reject2(error);
                                                        return;
                                                    }

                                                    if (body.toString() ===
                                                        data.toString()) {
                                                        reject2('unchanged');
                                                    } else {
                                                        resolve2('update');
                                                    }
                                                });
                                            } else {
                                                make.error(err3);
                                                reject2(err3);
                                            }
                                        }).timeout(1000);
                                    }
                                },
                                function(err3) {
                                    make.error(err3);
                                    reject2(err3);
                                });
                            },
                            function(err2) {
                                reject2(err2);
                            });
                        });
                    } else {
                        //  new attachment
                        return Promise.resolve('insert');
                    }

                })).then(function(results) {

                    results.forEach(function(result, index) {
                        var file_name,
                            att_name,
                            data;

                        if (result.isFulfilled()) {
                            file_name = files[index];
                            att_name = couchAttachment(file_name);

                            make.log(result.value() + ': ' + att_name);

                            //  Existing attachments will have been read already
                            //  to compare digests. We can reuse that data.
                            if (doc_atts[att_name]) {
                                data = doc_atts[att_name].data;
                            } else {
                                //  New file. Have to read it.
                                data = fs.readFileSync(file_name);
                            }

                            attachments.push({
                                name: att_name,
                                content_type: couchMime(att_name),
                                data: data
                            });
                        }  else {
                            make.verbose(result.reason() + ': ' + files[index]);
                        }
                    });

                    Promise.reduce(attachments, function(ignored, attachment) {

                        return new Promise(function(resolve2, reject2) {

                            dbGet(doc_name).then(function(response) {
                                var doc,
                                    rev;

                                doc = response.filter(function(item) {
                                    return item._id === '_design/app';
                                })[0];

                                rev = doc._rev;

                                nano = require('nano')(db_url + '/' + db_name);
                                nano.attachment.insert(doc_name,
                                        attachment.name, attachment.data,
                                        attachment.content_type,
                                        {rev: rev},
                                    function(error, body) {
                                        if (error) {
                                            make.error(error);
                                            reject2(error);
                                            return;
                                        }

                                        make.log(attachment.name + ' updated.');
                                        resolve2();
                                    });
                            },
                            function(error) {
                                reject2();
                            });
                        });

                    }, attachments[0]).then(function(summary) {
                        resolve();
                    },
                    function(error) {
                        reject();
                    });
                });
            });
        };


        make.log('marshaling content for: ' + doc_url);

        //  Scan application directory and get the full list of files.
        target = CLI.expandPath('~app');
        if (sh.test('-d', target)) {
            list = sh.find(target).filter(function(fname) {
                //  TODO:   add configuration-driven ignore checks here.

                //  Remove any files which don't pass our ignore criteria.
                return !sh.test('-d', fname) &&
                    !fname.match(/node_modules/);
            });
            err = sh.error();
            if (sh.error()) {
                make.error('Error checking ~app directory: ' + err);
                targets.pushdb.reject(err);
                return;
            }
        } else {
            make.error(target + ' is not a directory.');
            targets.pushdb.reject(err);
            return;
        }
        //  Try to access the design document for the application. If it's
        //  already there then this is an update operation rather than a clean
        //  insert. That means checking digests to determine which subset we
        //  want to actually update.

        db = require('nano')(db_url + '/' + db_name);
        dbGet = Promise.promisify(db.get);

        dbGet(doc_name, {att_encoding_info: true}).then(
            function(response) {
                var existing;

                //make.log(beautify(JSON.stringify(response)));

                //  Data comes in the form of an array with doc and status
                //  so find the doc one.
                existing = response.filter(function(item) {
                    //  TODO: couch.app_name
                    return item._id === '_design/app';
                })[0];

                updateAll(existing, list).then(
                    function() {
                        targets.pushdb.resolve();
                    },
                    function(err2) {
                        targets.pushdb.reject(err2);
                    });
            },
            function(error) {
                if (error.reason === 'missing') {
                    //  No document? Clean start then.
                    insertAll(list).then(
                        function() {
                            targets.pushdb.resolve();
                        },
                        function(err2) {
                            targets.pushdb.reject(err2);
                        });
                } else {
                    targets.pushdb.reject(error);
                }
            });
    };

    /**
     * Remove the current CouchDB database.
     */
    targets.removedb = function(make) {
        var params,
            db_url,
            db_name,
            result,
            nano;

        params = getDatabaseParameters(make);
        db_url = params.db_url;
        db_name = params.db_name;

        result = make.prompt.question(
            'Delete database [' + db_url + '/' + db_name + '] ? Enter \'yes\' to confirm: ');
        if (!result || result.trim().toLowerCase() !== 'yes') {
            make.log('database removal cancelled.');
            targets.removedb.resolve();
            return;
        }

        make.log('deleting database: ' + db_url + '/' + db_name);

        nano = require('nano')(db_url);
        nano.db.destroy(db_name,
            function(error) {
                if (error) {
                    targets.removedb.reject(error);
                    return;
                }

                make.log('database removed.');
                targets.removedb.resolve();
            });
    };

    module.exports = targets;

}());
