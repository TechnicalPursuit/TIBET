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
    sh,
    path,
    Promise,
    zlib,
    iltorb,
    helpers,
    child;


CLI = require('../../src/tibet/cli/_cli');
fs = require('fs');
hb = require('handlebars');
sh = require('shelljs');
path = require('path');
Promise = require('bluebird');
zlib = require('zlib');
child = require('child_process');

//  Conditionally load iltorb. If this fails don't make a fuss, we just won't
//  output brotli-compressed content.
try {
    iltorb = require('iltorb');
} catch (e) {
    void 0;
}


/**
 * Canonical `helper` object for internal utility functions.
 */
helpers = {};


/**
 *
 * @param {Cmd} make The make command handle which provides access to logging
 *     and other CLI functionality specific to make operation.
 * @param {Hash} options An object whose keys must include:
 *     pkg - the package file path
 *     config - the package config id to be rolled up
 */
helpers.linkup_app = function(make, options) {
    var target,
        source,
        list,
        config,
        lnflags,
        deferred;

    deferred = Promise.pending();

    target = make.CLI.expandPath('~app_build');
    if (!sh.test('-d', target)) {
        make.error('~app_build not found.');
        deferred.reject();
        return deferred;
    }

    source = make.CLI.expandPath('~lib_build');
    if (!sh.test('-d', source)) {
        make.error('~lib_build not found.');
        deferred.reject();
        return deferred;
    }

    config = options.config || 'base';

    lnflags = '-sf';

    list = [
        'tibet_' + config + '.js',
        'tibet_' + config + '.min.js',
        'tibet_' + config + '.min.js.gz',
        'tibet_' + config + '.min.js.br',
        'app_' + config + '.js',
        'app_' + config + '.min.js',
        'app_' + config + '.min.js.gz',
        'app_' + config + '.min.js.br'
    ];

    list.forEach(function(item) {
        var linksrc,
            linkdest,
            lnerr;

        if (item.indexOf('tibet') === 0) {
            linksrc = path.join(source, item);
        } else {
            linksrc = path.join(target, item);
        }
        linkdest = path.join(target, item.replace('_' + config, ''));

        if (!sh.test('-e', linksrc)) {
            make.warn('skipping link for missing file ' +
                make.CLI.getVirtualPath(linksrc));
            return;
        }

        sh.ln(lnflags, linksrc, linkdest);
        lnerr = sh.error();
        if (lnerr) {
            throw new Error('Error linking ' +
                linksrc + ': ' + lnerr);
        }
    });

    make.log('build assets linked successfully.');

    deferred.resolve();

    return deferred.promise;
};


/**
 *
 * @param {Cmd} make The make command handle which provides access to logging
 *     and other CLI functionality specific to make operation.
 * @param {Hash} options An object whose keys must include:
 *     pkg - the package file path
 *     config - the package config id to be rolled up
 */
helpers.package_check = function(make, options) {

    var cmd,
        pkg,
        config,
        phase,
        proc,
        deferred;

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

    make.log('verifying package@config');

    // The big path construction here is to locate the tibet command relative to
    // the current module. This is necessary for the npm prepublish step (used
    // by TravisCI etc) so they can build tibet without having it installed yet.
    cmd = path.join(module.filename, '..', '..', '..', 'bin', 'tibet') +
        ' package --missing' +
        (pkg ? ' --package \'' + pkg : '') +
        (config ? '\' --config ' + config : '') +
        (phase ? ' --phase ' + phase : '') +
        (options.debug ? ' --debug' : '') +
        (options.verbose ? ' --verbose' : '') +
        (options.color ? '' : ' --no-color') +
        (options['tds-cli'] ? '' : ' --tds-cli') +
        (options.silent ? '' : ' --no-silent');

    make.log('executing ' + cmd);

    //  Use our wrapper function here, it'll log via the make object's logging
    //  hooks so we get properly processed stdout and stderr data.
    proc = make.spawn(cmd);

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
 */
helpers.resource_build = function(make, options) {

    var cmd,
        pkg,
        config,
        phase,
        proc,
        deferred;

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

    make.log('generating resources');

    // The big path construction here is to locate the tibet command relative to
    // the current module. This is necessary for the npm prepublish step (used
    // by TravisCI etc) so they can build tibet without having it installed yet.
    cmd = path.join(module.filename, '..', '..', '..', 'bin', 'tibet') +
        ' resource --build' +
        (pkg ? ' --package \'' + pkg : '') +
        (config ? '\' --config ' + config : '') +
        (phase ? ' --phase ' + phase : '') +
        (options.debug ? ' --debug' : '') +
        (options.verbose ? ' --verbose' : '') +
        (options.color ? '' : ' --no-color') +
        (options['tds-cli'] ? '' : ' --tds-cli') +
        (options.silent ? '' : ' --no-silent');

    make.log('executing ' + cmd);

    //  Use our wrapper function here, it'll log via the make object's logging
    //  hooks so we get properly processed stdout and stderr data.
    proc = make.spawn(cmd);

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
 */
helpers.rollup = function(make, options) {

    var buffer,
        cmd,
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
        brotfile;

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

    make.log('rolling up ' + prefix + root);

    // The big path construction here is to locate the tibet command relative to
    // the current module. This is necessary for the npm prepublish step (used
    // by TravisCI etc) so they can build tibet without having it installed yet.
    cmd = path.join(module.filename, '..', '..', '..', 'bin', 'tibet') +
        ' rollup --package \'' + pkg +
        '\' --config ' + config +
        ' --phase ' + phase +
        (options.debug ? ' --debug' : '') +
        (options.verbose ? ' --verbose' : '') +
        (options.color ? '' : ' --no-color') +
        (options['tds-cli'] ? '' : ' --tds-cli') +
        (options.silent ? '' : ' --no-silent') +
        (headers ? '' : ' --no-headers') +
        (minify ? ' --minify' : '');

    if (minify) {
        ext = '.min.js';
    } else {
        ext = '.js';
    }

    file = path.join(dir, prefix + root + ext);

    promise = new Promise(function(resolver, rejector) {
        var proc;

        make.log('executing ' + cmd);

        proc = child.spawn(cmd, {
            shell: true
        });

        proc.stdout.on('data', function(data) {
            if (!buffer) {
                buffer = '';
            }

            buffer = buffer + data;
        });

        proc.stderr.on('data', function(data) {
            var clean;

            if (!options.verbose) {
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

            try {
                make.log('writing ' + buffer.length + ' chars to: ' + file);
                buffer.to(file);

                resolver();
                return;
            } catch (e) {
                make.error('Unable to write to: ' + file);
                make.error('' + e.message);
                rejector(e);
                return;
            }
        });
    });

    // gzip as well...
    if (options.zip) {

        promise = promise.then(
            function() {

                zipfile = file + '.gz';
                make.log('creating zipped output in ' + zipfile);

                return new Promise(function(resolver, rejector) {
                    return Promise.promisify(zlib.gzip)(buffer).then(
                        function(zipresult) {
                            try {
                                fs.writeFileSync(zipfile, zipresult);
                                make.log('gzip compressed to: ' +
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

    // brotli as well...
    if (options.brotli) {

        if (!iltorb) {
            make.warn('Ignoring brotli flag. Module `iltorb` not installed.');
            return promise;
        }

        promise = promise.then(
            function() {

                brotfile = file + '.br';
                make.log('creating brotlied output in ' + brotfile);

                return new Promise(function(resolver, rejector) {
                    var buff;

                    buff = Buffer.from(buffer, 'utf8');
                    return Promise.promisify(iltorb.compress)(buff).then(
                        function(brresult) {
                            try {
                                fs.writeFileSync(brotfile, brresult);
                                make.log('brotli compressed to: ' +
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
 */
helpers.rollup_app = function(make, options) {
    var opts,
        dir;

    dir = make.CLI.expandPath('~app_build');
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
 */
helpers.rollup_lib = function(make, options) {
    var opts,
        dir;

    dir = make.CLI.expandPath('~lib_build');
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
 */
helpers.transform = function(make, options) {

    var content,  // File content after template injection.
        source,   // The source file path.
        target,   // The target file path.
        text,     // File text.
        data,     // File injection data.
        template, // The compiled template content.
        deferred; // Promise support object for returns.

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
    data = options.data;

    deferred = Promise.pending();

    make.trace('Processing file: ' + source);
    try {
        text = fs.readFileSync(source, {encoding: 'utf8'});
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
            fs.writeFileSync(target, content);
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
