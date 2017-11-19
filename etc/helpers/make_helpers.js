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
    helpers;


CLI = require('../../src/tibet/cli/_cli');
fs = require('fs');
hb = require('handlebars');
sh = require('shelljs');
path = require('path');
Promise = require('bluebird');
zlib = require('zlib');

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
helpers.package_check = function(make, options) {

    var result,
        cmd,
        pkg,
        config,
        phase,
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
        (CLI.options.debug ? ' --debug' : '') +
        (CLI.options.verbose ? ' --verbose' : '') +
        (CLI.options.color ? '' : ' --no-color') +
        (CLI.options.silent ? '' : ' --no-silent');

    make.log('executing ' + cmd);
    result = sh.exec(cmd, {
        silent: CLI.options.silent !== false
    });

    if (result.code !== 0) {
        make.error('Error in package:');
        make.error('' + result.output);
        deferred.reject(result.output);
        return deferred.promise;
    } else {
        deferred.resolve(result.output);
        return deferred.promise;
    }
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

    var result,
        cmd,
        pkg,
        config,
        phase,
        lines,
        msg,
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
        (CLI.options.debug ? ' --debug' : '') +
        (CLI.options.verbose ? ' --verbose' : '') +
        (CLI.options.color ? '' : ' --no-color') +
        (CLI.options.silent ? '' : ' --no-silent');

    make.log('executing ' + cmd);
    result = sh.exec(cmd, {
        silent: CLI.options.silent !== false
    });

    if (result.code !== 0) {

        if (!CLI.options.verbose) {
            //  Output for rollup is potentially massive. The actual error will be
            //  the line(s) which start with 'Error processing rollup:'
            lines = result.output.split('\n');
            lines = lines.filter(function(line) {
                var clean;

                clean = CLI.clean(line, true);

                //  Non-empty error or test failure output should be retained.
                return clean.length !== 0 &&
                    (/^ERROR/i.test(clean) ||
                     /^Exception/i.test(clean) ||
                     /^not ok/i.test(clean) ||
                     /with status:/.test(clean));
            });
            msg = lines.join('\n');
        } else {
            msg = result.output;
        }

        make.error(msg);

        deferred.reject();
        return deferred.promise;
    } else {
        deferred.resolve(result.output);
        return deferred.promise;
    }
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

    var result,
        cmd,
        ext,
        file,
        pkg,
        config,
        phase,
        lines,
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
        (CLI.options.debug ? ' --debug' : '') +
        (CLI.options.verbose ? ' --verbose' : '') +
        (CLI.options.color ? '' : ' --no-color') +
        (CLI.options.silent ? '' : ' --no-silent') +
        (headers ? '' : ' --no-headers') +
        (minify ? ' --minify' : '');

    promise = new Promise(function(resolver, rejector) {

        make.log('executing ' + cmd);
        result = sh.exec(cmd, {
            silent: CLI.options.silent !== false
        });

        if (result.code !== 0) {
            //  Output for rollup is potentially massive. The actual error will be
            //  the line(s) which start with 'Error processing rollup:'
            lines = result.output.split('\n');
            lines = lines.filter(function(line) {
                return line.trim().length !== 0;
            });
            msg = lines[lines.length - 1];
            make.error(msg);

            rejector(msg);
            return;
        }

        if (minify) {
            ext = '.min.js';
        } else {
            ext = '.js';
        }

        file = path.join(dir, prefix + root + ext);

        try {
            make.log('writing ' + result.output.length + ' chars to: ' + file);
            result.output.to(file);

            resolver();
            return;
        } catch (e) {
            make.error('Unable to write to: ' + file);
            make.error('' + e.message);
            rejector(e);
            return;
        }
    });

    // gzip as well...
    if (options.zip) {

        zipfile = file + '.gz';
        make.log('creating zipped output in ' + zipfile);

        promise = promise.then(
            function() {
                return new Promise(function(resolver, rejector) {
                    return Promise.promisify(zlib.gzip)(result.output).then(
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

        brotfile = file + '.br';
        make.log('creating brotlied output in ' + brotfile);

        promise = promise.then(
            function() {
                return new Promise(function(resolver, rejector) {
                    var buffer;

                    buffer = Buffer.from(result.output, 'utf8');
                    return Promise.promisify(iltorb.compress)(buffer).then(
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
