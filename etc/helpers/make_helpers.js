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
    hb,
    fs,
    os,
    sh,
    path,
    Promise,
    zlib,
    helpers;


CLI = require('../../src/tibet/cli/_cli');
fs = require('fs');
os = require('os');
hb = require('handlebars');
sh = require('shelljs');
path = require('path');
Promise = require('bluebird');
zlib = require('zlib');


/**
 * Canonical `helper` object for internal utility functions.
 */
helpers = {};

/**
 *
 */
helpers.augment_args = function(make, args) {

    if (make.options.debug) {
        args.push('--debug');
    }

    if (make.options.verbose) {
        args.push('--verbose');
    }

    if (make.options.timeout) {
        args.push('--timeout', make.options.timeout);
    }

    if (!make.options.color) {
        args.push('--no-color');
    }

    if (make.options['tds-cli']) {
        args.push('--tds-cli');
    }

    if (!make.options.silent) {
        args.push('--no-silent');
    }
};


/**
 *
 * @param {Cmd} make The make command handle which provides access to logging
 *     and other CLI functionality specific to make operation.
 * @param {Hash} options An object whose keys must include:
 *     pkg - the package file path
 *     config - the package config id to be rolled up
 * @returns {Promise} A Promise that will resolve when the operation is
 *     finished.
 */
helpers.linkup_app = function(make, options) {
    var deferred,

        target,
        source;

    deferred = Promise.pending();

    target = CLI.expandPath('~app_build');
    if (!sh.test('-d', target)) {
        make.error('~app_build not found.');
        deferred.reject();
        return deferred;
    }

    source = CLI.expandPath('~lib_build');
    if (!sh.test('-d', source)) {
        make.error('~lib_build not found.');
        deferred.reject();
        return deferred;
    }

    this.link_apps_and_tibet(make, source, target, options);

    make.info('build assets linked successfully.');

    deferred.resolve();

    return deferred.promise;
};


/**
 *
 * @param {Cmd} cmd The command handle which provides access to logging and
 *     other CLI functionality specific to that command's operation.
 * @param {String} source The source of the link (i.e. the directory we're
 *     linking *from*).
 * @param {String} target The target of the link (i.e. the directory we're
 *     linking *to*).
 * @param {Hash} options An object whose keys must include:
 *     pkg - the package file path
 *     config - the package config id to be rolled up
 */
helpers.link_apps_and_tibet = function(cmd, source, target, options) {
    var cfg,
        list;

    cfg = options.config || 'base';

    list = [
        'tibet_' + cfg + '.js',
        'tibet_' + cfg + '.min.js',
        'tibet_' + cfg + '.min.js.gz',
        'tibet_' + cfg + '.min.js.br',
        'app_' + cfg + '.js',
        'app_' + cfg + '.min.js',
        'app_' + cfg + '.min.js.gz',
        'app_' + cfg + '.min.js.br'
    ];

    list.forEach(function(item) {
        var linksrc,
            linkdest,

            linksrcdir,
            linkdestdir,

            srcdir,

            rellinksrc;

        if (item.indexOf('tibet') === 0) {
            linksrc = CLI.joinPaths(source, item);
        } else {
            linksrc = CLI.joinPaths(target, item);
        }
        linkdest = CLI.joinPaths(target, item.replace('_' + cfg, ''));

        if (!sh.test('-e', linksrc)) {
            cmd.warn('skipping link for missing file \'' +
                CLI.getVirtualPath(linksrc) + '\'');
            return;
        }

        //  Grab the directories of the link source and destination.
        linksrcdir = path.dirname(linksrc);
        linkdestdir = path.dirname(linkdest);

        //  Compute a relative path between the two directories
        srcdir = path.relative(linkdestdir, linksrcdir);

        //  Join the supplied item onto the relative source directory. This
        //  will produce a relative path to the destination.
        rellinksrc = CLI.joinPaths(srcdir, item);

        try {
            //  NB: The source path to the command here is used as a raw
            //  argument. In other words, the '../..' is *not* evaluated against
            //  the current working directory. It is used as is to create the
            //  link.
            //  Note here that we always force the link since, if the project
            //  was already built, it will already have links in the build
            //  directory.
            sh.ln('-sf', rellinksrc, linkdest);
        } catch (e) {
            throw new Error('Error linking \'' + linksrc + '\': ' +
                            e.toString());
        }
    });

    return;
};


/**
 *
 * @param {Cmd} make The make command handle which provides access to logging
 *     and other CLI functionality specific to make operation.
 * @param {Hash} options An object whose keys must include:
 *     pkg - the package file path
 *     config - the package config id to be rolled up
 * @returns {Promise} A Promise that will resolve when the operation is
 *     finished.
 */
helpers.package_check = function(make, options) {

    var pkg,
        config,
        phase,
        deferred,

        cmd,
        args,

        proc;

    if (CLI.notValid(options)) {
        throw new Error('InvalidOptions');
    }

    if (CLI.notValid(options.pkg)) {
        throw new Error('InvalidPackage');
    }

    if (CLI.notValid(options.config)) {
        throw new Error('InvalidConfig');
    }

    pkg = options.pkg;
    config = options.config;
    phase = options.phase;

    deferred = Promise.pending();

    if (pkg && config) {
        make.info('verifying ' + pkg + '@' + config);
    }

    //  The big path construction here is to locate the tibet command relative
    //  to the current module. This is necessary for the npm prepublish step
    //  (used by TravisCI etc) so they can build tibet without having it
    //  installed yet. Note that we don't run CI, etc. on Windows and it seems
    //  to have problems with finding binaries, but not with an installed TIBET,
    //  so we just set it to 'tibet' here.
    if (os.platform() === 'win32') {
        cmd = 'tibet';
    } else {
        cmd = CLI.joinPaths(
                    module.filename, '..', '..', '..', 'bin', 'tibet');
    }

    args = ['package', '--unresolved'];

    if (pkg) {
        args.push('--package', pkg);
    }

    if (config) {
        args.push('--config', config);
    }

    if (phase) {
        args.push('--phase', phase);
    }

    //  The building flag is specific to the package command and typically only
    //  set by 'tibet make' scripts. it isn't a standard augmentation flag.
    if (make.options.building) {
        args.push('--building');
    }

    this.augment_args(make, args);

    make.debug('executing ' + cmd + ' ' + args.join(' '));

    //  Use our wrapper function here, it'll log via the make object's logging
    //  hooks so we get properly processed stdout and stderr data.
    proc = make.spawn(cmd, args);

    proc.on('exit', function(code) {
        if (code !== 0) {
            deferred.reject();
            return;
        }
        deferred.resolve();
    });

    return deferred.promise;
};


/**
 *
 * @param {Cmd} make The make command handle which provides access to logging
 *     and other CLI functionality specific to make operation.
 * @param {Hash} options An object whose keys must include:
 *     pkg - the package file path
 *     config - the package config id to be rolled up
 * @returns {Promise} A Promise that will resolve when the operation is
 *     finished.
 */
helpers.resource_build = function(make, options) {

    var pkg,
        config,
        phase,
        proc,
        deferred,

        cmd,
        args;

    if (CLI.notValid(options)) {
        throw new Error('InvalidOptions');
    }

    if (CLI.notValid(options.pkg)) {
        throw new Error('InvalidPackage');
    }

    if (CLI.notValid(options.config)) {
        throw new Error('InvalidConfig');
    }

    pkg = options.pkg;
    config = options.config;
    phase = options.phase;

    deferred = Promise.pending();

    make.info('generating resources...');

    //  The big path construction here is to locate the tibet command relative
    //  to the current module. This is necessary for the npm prepublish step
    //  (used by TravisCI etc) so they can build tibet without having it
    //  installed yet. Note that we don't run CI, etc. on Windows and it seems
    //  to have problems with finding binaries, but not with an installed TIBET,
    //  so we just set it to 'tibet' here.
    if (os.platform() === 'win32') {
        cmd = 'tibet';
    } else {
        cmd = CLI.joinPaths(
                    module.filename, '..', '..', '..', 'bin', 'tibet');
    }

    args = ['resource', '--build'];

    if (pkg) {
        args.push('--package', pkg);
    }

    if (config) {
        args.push('--config', config);
    }

    if (phase) {
        args.push('--phase', phase);
    }

    this.augment_args(make, args);

    make.debug('executing ' + cmd + ' ' + args.join(' '));

    //  Use our wrapper function here, it'll log via the make object's logging
    //  hooks so we get properly processed stdout and stderr data.
    proc = make.spawn(cmd, args);

    proc.on('exit', function(code) {
        if (code !== 0) {
            deferred.reject();
            return;
        }
        deferred.resolve();
    });

    return deferred.promise;
};


/**
 * A common utility used by rollup operations to avoid duplication of the
 * logic behind building specific rollup products.
 * @param {Cmd} make The make command handle which provides access to logging
 *     and other CLI functionality specific to make operation.
 * @param {Hash} options An object whose keys must include:
 *     pkg - the package file path
 *     config - the package config id to be rolled up
 *
 *     Additional keys are:
 *     dir - the target directory for the rollup output [.]
 *     headers - true to add headers between files [false]
 *     minify - true to minify the content of files [false]
 *     root - name of output artifact file [config id]
 * @returns {Promise} A Promise that will resolve when the operation is
 *     finished.
 */
helpers.rollup = function(make, options) {

    var buffer,
        cmd,
        args,
        ext,
        file,
        pkg,
        config,
        phase,
        msg,
        dir,
        prefix,
        root,
        headers,
        minify,
        promise,
        zipfile,
        brotfile,
        virtual,
        timestamp;

    if (CLI.notValid(options)) {
        throw new Error('InvalidOptions');
    }

    if (CLI.notValid(options.pkg)) {
        throw new Error('InvalidPackage');
    }

    if (CLI.notValid(options.config)) {
        throw new Error('InvalidConfig');
    }

    pkg = options.pkg;
    config = options.config;
    phase = options.phase || 'two';

    prefix = options.prefix || '';
    dir = options.dir || '.';

    if (CLI.isValid(options.headers)) {
        headers = options.headers;
    } else {
        headers = false;
    }

    if (CLI.isValid(options.minify)) {
        minify = options.minify;
    } else {
        minify = false;
    }

    root = options.root || options.config;

    //  The big path construction here is to locate the tibet command relative
    //  to the current module. This is necessary for the npm prepublish step
    //  (used by TravisCI etc) so they can build tibet without having it
    //  installed yet. Note that we don't run CI, etc. on Windows and it seems
    //  to have problems with finding binaries, but not with an installed TIBET,
    //  so we just set it to 'tibet' here.
    if (os.platform() === 'win32') {
        cmd = 'tibet';
    } else {
        cmd = CLI.joinPaths(
                    module.filename, '..', '..', '..', 'bin', 'tibet');
    }

    args = ['rollup', '--package', pkg, '--config', config, '--phase', phase];

    //  Headers defaults to true so force --no- prefix when explicitly false.
    if (!headers) {
        args.push('--no-headers');
    }

    if (make.options.clean) {
        args.push('--clean');
    }

    if (minify) {
        args.push('--minify');
    }

    if (minify) {
        ext = '.min.js';
    } else {
        ext = '.js';
    }

    file = CLI.joinPaths(dir, prefix + root + ext);
    virtual = CLI.getVirtualPath(file);

    if (CLI.sh.test('-e', file)) {
        timestamp = fs.statSync(file).mtime.getTime();
        args.push('--since=' + timestamp);
    }

    //  Add a prefix to use for any logging messages. We can then use this in
    //  the on(data) handler to filter out logging messages while retaining
    //  the actual rollup content
    args.push('--log-prefix', '### - ');

    //  Add any final "common arguments" such as debug/verbose/etc
    this.augment_args(make, args);

    promise = new Promise(function(resolver, rejector) {
        var proc;

        make.debug('executing ' + cmd + ' ' + args.join(' '));

        proc = make.spawn(cmd, args, {stdio: 'pipe'});

        proc.stdout.on('data', function(data) {
            var str;

            if (!buffer) {
                buffer = '';
            }

            //  Check for our log prefix and filter those lines.
            str = '' + data;
            if (/^### - /.test(str)) {
                return;
            }

            buffer = buffer + data;
        });

        proc.stderr.on('data', function(data) {
            var clean;

            if (!make.options.verbose) {
                clean = CLI.clean(data, true);

                //  Non-empty error or test failure output should be retained.
                if (clean.length !== 0 &&
                        (/^ERROR/i.test(clean) ||
                         /^Exception/i.test(clean) ||
                         /^not ok/i.test(clean) ||
                         /with status:/.test(clean))) {
                    make.error(clean);
                }
            } else {
                make.error(data);
            }
        });

        proc.on('exit', function(code) {

            if (code !== 0) {
                rejector(msg);
                return;
            }

            //  Is the buffer real rollup content or a message that the content
            //  was no fresher than the current rollup timestamp?
            if (/^no source changes --since/.test(buffer)) {
                make.info(virtual + ' is current');
                resolver();
                return;
            }

            try {
                make.info('writing ' + buffer.length + ' chars to ' + virtual);
                new sh.ShellString(buffer).to(file);

                resolver();
                return;
            } catch (e) {
                make.error('Unable to write to ' + virtual);
                make.error('' + e.message);
                rejector(e);
                return;
            }
        });
    });

    //  gzip as well...
    if (options.zip) {

        promise = promise.then(
            function() {

                zipfile = file + '.gz';

                if (!CLI.isFileNewer(file, zipfile)) {
                    make.info(zipfile + ' is current');
                    return Promise.resolve();
                }

                make.info('zipping rollup in ' + zipfile);

                return new Promise(function(resolver, rejector) {
                    return Promise.promisify(zlib.gzip)(buffer).then(
                        function(zipresult) {
                            try {
                                fs.writeFileSync(zipfile, zipresult);
                                make.info('gzip compressed to: ' +
                                            zipresult.length +
                                            ' bytes');
                                resolver();
                                return;
                            } catch (e) {
                                make.error('Unable to write to: ' + zipfile);
                                make.error('' + e.message);
                                rejector(e);
                                return;
                            }
                        },
                        function(error) {
                            make.error('Unable to compress: ' +
                                        zipfile.slice(0, -3));
                            make.error('' + error);
                            rejector(error);
                            return;
                        });
                });
        });
    }

    //  brotli as well...
    if (options.brotli) {

        promise = promise.then(
            function() {

                brotfile = file + '.br';

                if (!CLI.isFileNewer(file, brotfile)) {
                    make.info(brotfile + ' is current');
                    return Promise.resolve();
                }

                make.info('brotli rollup in ' + brotfile);

                return new Promise(function(resolver, rejector) {
                    var buff;

                    buff = Buffer.from(buffer, 'utf8');
                    return Promise.promisify(zlib.brotliCompress)(buff).then(
                        function(brresult) {
                            try {
                                fs.writeFileSync(brotfile, brresult);
                                make.info('brotli compressed to: ' +
                                            brresult.length +
                                            ' bytes');
                                resolver();
                                return;
                            } catch (e) {
                                make.error('Unable to write to: ' + brotfile);
                                make.error('' + e.message);
                                rejector(e);
                                return;
                            }
                        },
                        function(error) {
                            make.error('Unable to compress: ' +
                                        brotfile.slice(0, -2));
                            make.error('' + error);
                            rejector(error);
                            return;
                        });
                });
        });
    }

    return promise;
};


/**
 *
 * @returns {Promise} A Promise that will resolve when the operation is
 *     finished.
 */
helpers.rollup_app = function(make, options) {
    var opts,
        dir;

    dir = CLI.expandPath('~app_build');
    if (!sh.test('-d', dir)) {
        sh.mkdir(dir);
    }

    opts = CLI.blend(options, {
        pkg: '~app_cfg/main.xml',
        phase: 'two',
        dir: dir,
        prefix: 'app_',
        headers: true,
        minify: false,
        zip: true,
        brotli: false
    });

    if (CLI.notValid(opts.config)) {
        throw new Error('Missing required config parameter.');
    }

    return this.rollup(make, opts);
};


/**
 *
 * @returns {Promise} A Promise that will resolve when the operation is
 *     finished.
 */
helpers.rollup_lib = function(make, options) {
    var opts,
        dir;

    dir = CLI.expandPath('~lib_build');
    if (!sh.test('-d', dir)) {
        sh.mkdir(dir);
    }

    opts = CLI.blend(options, {
        pkg: '~lib_cfg/TIBET.xml',
        phase: 'one',
        dir: dir,
        prefix: 'tibet_',
        headers: false,
        minify: false,
        zip: false,
        brotli: false
    });

    if (CLI.notValid(opts.config)) {
        throw new Error('Missing required config parameter.');
    }

    return this.rollup(make, opts);
};


/**
 * Performs a template interpolation on a source file, writing the output to a
 * target file. The underlying templating engine used is the handlebars engine.
 * @param {Cmd} make The make command handle which provides access to logging
 *     and other CLI functionality specific to make operation.
 * @param {Hash} options An object whose keys must include:
 *     source - the file path to the source template text.
 *     target - the file path to the target file.
 *     data - the object containing templating data.
 * @returns {Promise} A Promise that will resolve when the operation is
 *     finished.
 */
helpers.transform = function(make, options) {

    var content,  //    File content after template injection.
        source,   //    The source file path.
        target,   //    The target file path.
        text,     //    File text.
        data,     //    File injection data.
        template, //    The compiled template content.
        deferred; //    Promise support object for returns.

    if (CLI.notValid(options)) {
        throw new Error('InvalidOptions');
    }

    if (CLI.notValid(options.source)) {
        throw new Error('InvalidSourceFile');
    }

    if (CLI.notValid(options.target)) {
        throw new Error('InvalidTargetFile');
    }

    if (CLI.notValid(options.data)) {
        throw new Error('InvalidData');
    }

    source = CLI.expandPath(options.source);
    target = CLI.expandPath(options.target);

    if (!CLI.isFileNewer(source, target)) {
        make.info(CLI.getVirtualPath(target) + ' is current');
        return Promise.resolve();
    }

    data = options.data;

    deferred = Promise.pending();

    make.trace('Processing file: ' + source);
    try {
        text = sh.cat(source).toString();
        if (!text) {
            throw new Error('Empty');
        }
    } catch (e) {
        make.error('Error reading ' + source + ': ' + e.message);
        deferred.reject(e.message);
        return deferred.promise;
    }

    try {
        template = hb.compile(text);
        if (!template) {
            throw new Error('InvalidTemplate');
        }
    } catch (e) {
        make.error('Error compiling template ' + source + ': ' +
            e.message);
        deferred.reject(e.message);
        return deferred.promise;
    }

    try {
        content = template(data);
        if (!content) {
            throw new Error('InvalidContent');
        }
    } catch (e) {
        make.error('Error injecting template data in ' + source +
            ': ' + e.message);
        deferred.reject(e.message);
        return deferred.promise;
    }

    if (text === content) {
        make.trace('Ignoring static file: ' + source);
    } else {
        make.trace('Updating file: ' + target);
        try {
            content = CLI.normalizeLineEndings(content);
            new sh.ShellString(content).to(target);
        } catch (e) {
            make.error('Error writing file ' + target + ': ' + e.message);
            deferred.reject(e.message);
            return deferred.promise;
        }
    }

    deferred.resolve();
    return deferred.promise;
};


module.exports = helpers;

}());
