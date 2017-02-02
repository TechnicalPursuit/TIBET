/**
 * @overview TIBET + CouchDB make targets. This file provides the supporting
 *     logic for the various `tibet` commands specific to working with CouchDB.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var sh,
        fs,
        path,
        zlib,
        // beautify,
        crypto,
        readFile,
        mime,
        helpers,
        couch,
        Promise,
        targets;

    fs = require('fs');
    path = require('path');
    sh = require('shelljs');
    zlib = require('zlib');

    // beautify = require('js-beautify');
    crypto = require('crypto');
    helpers = require('tibet/etc/helpers/make_helpers');
    couch = require('tibet/etc/helpers/couch_helpers');

    Promise = require('bluebird');

    readFile = Promise.promisify(fs.readFile);

    //  Adjust mime mapping for files we use that don't look up correctly.
    mime = require('mime-types');
    mime.types.opts = 'text/plain';
    mime.types.pegjs = 'text/plain';
    mime.types.tmx = 'application/xml';

    /**
     * Canonical `targets` object for exporting the various target functions.
     */
    targets = {};

    /**
     */
    targets.build = function(make) {
        make.log('building app...');

        targets.clean().then(
            targets.check_lint).then(
            targets.check_package).then(
            targets.build_resources).then(
            targets.rollup).then(
            function() {
                targets.build.resolve();
            },
            function() {
                targets.build.reject();
            });
    };

    /**
     */
    targets.build_resources = function(make) {
        var config;

        make.log('processing resources...');

        config = make.options.config || 'base';

        helpers.resource_build(make, {
            pkg: '~app_cfg/main.xml',
            config: config
        }).then(
        function() {
            targets.build_resources.resolve();
        },
        function() {
            targets.build_resources.reject();
        });
    };

    /**
     * Run lint and test commands to verify the code is in good shape.
     */
    targets.checkup = function(make) {
        make.log('checking app...');

        targets.check_lint().then(
            targets.check_package).then(
            targets.check_tests).then(
            function() {
                targets.checkup.resolve();
            },
            function() {
                targets.checkup.reject();
            });
    };

    /**
     * Run lint and test commands to verify the code is in good shape.
     */
    targets.check_lint = function(make) {
        var result;

        make.log('checking for lint...');

        result = sh.exec('tibet lint');
        if (result.code !== 0) {
            targets.check_lint.reject();
            return;
        }

        targets.check_lint.resolve();
    };

    /**
     */
    targets.check_package = function(make) {
        var config;

        make.log('verifying packages...');

        config = make.options.config || 'base';

        helpers.package_check(make, {
            pkg: '~app_cfg/main.xml',
            config: config
        }).then(
        function() {
            targets.check_package.resolve();
        },
        function() {
            targets.check_package.reject();
        });
    };

    /**
     * Run unit tests to verify the code is in good shape.
     */
    targets.check_tests = function(make) {
        var result;

        make.log('running unit tests...');

        result = sh.exec('tibet test');
        if (result.code !== 0) {
            targets.check_tests.reject();
            return;
        }

        targets.check_tests.resolve();
    };

    /**
     */
    targets.clean = function(make) {
        var dir;

        make.log('cleaning...');

        dir = make.CLI.expandPath('~app_build');
        if (sh.test('-d', dir)) {
            sh.rm('-rf', path.join(dir, '*'));
        }

        dir = make.CLI.expandPath('~app_log');
        if (sh.test('-d', dir)) {
            sh.rm('-rf', path.join(dir, '*'));
        }

        targets.clean.resolve();
    };

    /**
     */
    targets.deploy = function(make) {
        var args;

        make.log('deploying application...');

        args = make.getArgv();
        if (args.length) {
            make.log('deployment args: ' + args.join(' '));
        }

        make.warn('No concrete deployment logic.');

        targets.deploy.resolve();
    };

    /**
     */
    targets.resources = function(make) {

        make.log('processing resources...');

        helpers.resources(make, {
            pkg: '~app_cfg/main.xml',
            config: 'base',
        }).then(
        function() {
            targets.resources.resolve();
        },
        function() {
            targets.resources.reject();
        });
    };

    /**
     */
    targets.rollup = function(make) {
        var dir,
            config;

        make.log('rolling up assets...');

        dir = make.CLI.expandPath('~app_build');
        if (!sh.test('-d', dir)) {
            sh.mkdir(dir);
        }

        config = make.options.config || 'base';

        helpers.rollup(make, {
            pkg: '~app_cfg/main.xml',
            config: config,
            phase: 'two',
            dir: dir,
            prefix: 'app_',
            headers: true,
            minify: false,
            zip: true
        }).then(function() {
            return helpers.rollup(make, {
                pkg: '~app_cfg/main.xml',
                config: config,
                phase: 'two',
                dir: dir,
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
     * Compact the current CouchDB database.
     */
    targets.compactdb = function(make) {
        var params,
            db_url,
            db_name,
            app_name,
            result,
            nano;

        params = couch.getCouchParameters({requestor: make});
        db_url = params.db_url;
        db_name = params.db_name;
        app_name = params.app_name;

        result = make.prompt.question(
            'Compact database [' +
            couch.maskCouchAuth(db_url) + '/' + db_name + '] ? Enter \'yes\' to confirm: ');
        if (!result || result.trim().toLowerCase() !== 'yes') {
            make.log('database compaction cancelled.');
            targets.compactdb.resolve();
            return;
        }

        make.log('compacting database: ' +
            couch.maskCouchAuth(db_url) + '/' + db_name);

        nano = require('nano')(db_url);
        nano.db.compact(db_name, app_name,
            function(error) {
                if (error) {
                    targets.compactdb.reject(error);
                    return;
                }

                make.log('database compacted.');
                targets.compactdb.resolve();
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

        params = couch.getCouchParameters({requestor: make});
        db_url = params.db_url;
        db_name = params.db_name;

        make.log('creating database: ' +
            couch.maskCouchAuth(db_url) + '/' + db_name);

        nano = require('nano')(db_url);
        nano.db.create(db_name,
            function(error) {
                if (error) {
                    targets.createdb.reject(error);
                    return;
                }

                make.log('database ready at ' +
                    couch.maskCouchAuth(db_url) + '/' + db_name);

                targets.createdb.resolve();
            });
    };

    /**
     * Push the current app.js and attachments content to CouchDB.
     */
    targets.pushapp = function(make) {
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
            db_config,
            nano;

        CLI = make.CLI;
        params = couch.getCouchParameters({requestor: make});
        db_url = params.db_url;
        db_name = params.db_name;
        db_app = params.db_app;

        doc_name = '_design/' + db_app;
        doc_url = db_url + '/' + db_name + '/' + doc_name;

        db_config = {
            attachments: {
                compression_level: 8    //  default
            }
        };

        //  Access the database configuration data. We use this for gzip
        //  level confirmation and other potential processing.
        require('nano')(db_url).relax({db: '_config'}, function(err2, dat) {
            if (err2) {
                //  ERROR here usually means 'you are not a server admin' or
                //  something similar. NOTE we leave default value in place
                //  and just return here. Default is set in outer scope.
                return;
            }

            db_config = dat;
        });

        //  Helper function when the document doesn't exist yet.
        insertAll = function(files) {

            return new Promise(function(resolve, reject) {
                var attachments,
                    newdoc,
                    fullpath;

                attachments = [];

                files.forEach(function(item) {
                    var spec,
                        json;

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

                    //  One thing we have to adjust during push is that we need
                    //  to reset the app_root to point to app_head. This is
                    //  needed since couch will want to work from db_app which
                    //  doesn't allow for the typical app_root of '~/public'.
                    if (/tibet.json$/.test(spec.name)) {
                        json = JSON.parse(spec.data);
                        if (!json.path) {
                            json.path = {};
                        }
                        json.path.app_root = '~';
                        spec.data = JSON.stringify(json);
                    }

                    attachments.push(spec);
                });

                attachments.forEach(function(item) {
                    make.verbose(item.name + ', ' + item.content_type + ', ' +
                        item.data.length + ' bytes.');
                });

                // make.log('pushing document content: ' + doc_url);

                //  The base document. Be sure to set the _id here to match the
                //  document name passed to the multipart insert below.
                newdoc = {
                    _id: doc_name
                };

                //  Ensure we also capture any views, shows, lists, etc...
                //  NOTE we add appname if actual app directory isn't found.
                fullpath = make.CLI.expandPath(make.CLI.getcfg('path.tds_couch_defs'));
                if (sh.test('-d', path.join(fullpath, db_app))) {
                    fullpath = path.join(fullpath, db_app);
                } else {
                    fullpath = path.join(fullpath, make.CLI.getProjectName());
                }
                newdoc = couch.populateDesignDoc(newdoc, fullpath, params, true);

                //  Make sure we at least got rewrites..or it won't work at all.
                if (!newdoc.rewrites) {
                    newdoc.rewrites = [
                        {from: '/', to: 'index.html'},
                        {from: '/api', to: '../../'},
                        {from: '/api/*', to: '../../*'},
                        {from: '/*', to: '*'}
                    ];
                }

                //  Do the deed...and cross our fingers :)
                nano = require('nano')(db_url + '/' + db_name);
                nano.multipart.insert(newdoc, attachments, doc_name,
                    function(error) {
                        if (error) {
                            make.error(error);
                            reject(error);
                            return;
                        }

                        make.log('application loaded at ' + doc_url);
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
                make.warn('Defaulting to text/plain for ' +
                    attachment);
                type = 'text/plain';
            }
            return type;
        };


        couchDigest = function(data, options, zipper) {

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
                if (options.encoding === 'gzip') {
                    zipper(data, {level: options.level}, function(err2, zipped) {
                        if (err2) {
                            reject(err2);
                            return;
                        }
                        resolve(compute(zipped));
                    });
                } else {
                    resolve(compute(data));
                }
            });
        };


        //  Helper function when the document exists. then we need to compare
        //  to see which attachments need to be updated.
        updateAll = function(existing, files) {

            return new Promise(function(resolve, reject) {
                var doc_atts,
                    root,
                    attachments,
                    newdoc;

                root = CLI.expandPath('~app');

                doc_atts = existing._attachments || {};
                existing._attachments = {};
                attachments = [];

                // make.log(beautify(JSON.stringify(doc_atts)));

                Promise.settle(files.map(function(item) {
                    var name,
                        encoding,
                        digest,
                        current;

                    //  TODO: Revisit why we ignore the gz files. Would storing
                    //  and loading these speed things up?
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
                            readFile(item).then(function(dat) {
                                var json,
                                    data,
                                    level;

                                if (/tibet.json$/.test(name)) {
                                    json = JSON.parse(dat);
                                    if (!json.path) {
                                        json.path = {};
                                    }
                                    json.path.app_root = '~';
                                    data = JSON.stringify(json);
                                } else {
                                    data = dat;
                                }

                                //  Store the data. We'll need this for push.
                                current.data = data;

                                //  Set the compression level for gzip to the one our
                                //  database is configured to use for attachments.
                                level = db_config.attachments.compression_level;

                                couchDigest(data,
                                    {level: level, encoding: encoding}, zlib.gzip).then(
                                function(result) {
                                    if (result === digest) {
                                        resolve2('unchanged');
                                    } else {
                                        resolve2('update');
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
                    var fullpath;

                    results.forEach(function(result, index) {
                        var file_name,
                            att_name,
                            data;

                        if (result.isFulfilled()) {
                            file_name = files[index];
                            att_name = couchAttachment(file_name);

                            make.verbose(result.value() + ': ' + att_name);

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

                    //  Ensure we also capture any views, shows, lists, etc...
                    //  NOTE we add 'default' if the actual app directory isn't found.
                    fullpath = make.CLI.expandPath(make.CLI.getcfg('path.tds_couch_defs'));
                    if (sh.test('-d', path.join(fullpath, db_app))) {
                        fullpath = path.join(fullpath, db_app);
                    } else {
                        fullpath = path.join(fullpath, 'default');
                    }
                    newdoc = couch.populateDesignDoc(existing, fullpath, params, true);

                    //  Do the deed...and cross our fingers :)
                    nano = require('nano')(db_url + '/' + db_name);
                    nano.multipart.insert(newdoc, attachments, doc_name,
                        function(error) {
                            if (error) {
                                make.error(error);
                                reject(error);
                                return;
                            }

                            make.log('application updated at ' + doc_url);
                            resolve();
                        });
                });
            });
        };


        //  ---
        //  Actual "work" begins below...
        //  ---

        make.log('marshalling content for: ' +
            couch.maskCouchAuth(doc_url));

        //  Scan application directory and get the full list of files.
        target = CLI.expandPath('~app');
        if (sh.test('-d', target)) {
            list = sh.find(target).filter(function(fname) {
                //  TODO:   add configuration-driven ignore checks here.
                //  Remove any files which don't pass our ignore criteria.
                return !sh.test('-d', fname) &&
                    !fname.match(/node_modules/) && !fname.match(/\.DS_Store/);
            });
            err = sh.error();
            if (sh.error()) {
                make.error('Error checking ~app directory: ' + err);
                targets.pushapp.reject(err);
                return;
            }
        } else {
            make.error(target + ' is not a directory.');
            targets.pushapp.reject(err);
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

                // make.log(beautify(JSON.stringify(response)));

                if (Array.isArray(response)) {
                    existing = response.filter(function(item) {
                        return item._id === doc_name;
                    })[0];
                } else {
                    existing = response;
                }

                updateAll(existing, list).then(
                    function() {
                        targets.pushapp.resolve();
                    },
                    function(err2) {
                        targets.pushapp.reject(err2);
                    });
            },
            function(error) {
                if (error.reason === 'missing') {
                    //  No document? Clean start then.
                    insertAll(list).then(
                        function() {
                            targets.pushapp.resolve();
                        },
                        function(err2) {
                            targets.pushapp.reject(err2);
                        });
                } else {
                    targets.pushapp.reject(error);
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

        params = couch.getCouchParameters({requestor: make});
        db_url = params.db_url;
        db_name = params.db_name;

        result = make.prompt.question(
            'Delete database [' +
            couch.maskCouchAuth(db_url) + '/' + db_name + '] ? Enter \'yes\' to confirm: ');
        if (!result || result.trim().toLowerCase() !== 'yes') {
            make.log('database removal cancelled.');
            targets.removedb.resolve();
            return;
        }

        make.log('deleting database: ' +
            couch.maskCouchAuth(db_url) + '/' + db_name);

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
