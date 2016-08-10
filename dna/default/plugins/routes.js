/**
 * @overview Loads and/or generates routes based on the content of the project's
 *     routes or mocks directory (mocks if tds.use_mocks is true).
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Load any routes (or mocks) in the project's routes and mocks directories.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            env,
            logger,
            TDS,
            useMocks,
            dirs,
            parsers,
            path,
            sh,
            list;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  Mocks are explicitly disabled except in development or test
        //  environments.
        env = app.get('env');
        if (env !== 'development' && env !== 'test') {
            useMocks = false;
        } else {
            useMocks = TDS.cfg('tds.use_mocks') || false;
        }

        logger.debug('Integrating TDS routes/mocks.');

        dirs = ['routes'];
        if (useMocks) {
            dirs.unshift('mocks');
        }

        //  ---
        //  Requires
        //  ---

        path = require('path');
        sh = require('shelljs');

        //  ---
        //  Variables
        //  ---

        parsers = options.parsers;

        //  ---
        //  Routes/Mocks
        //  ---

        dirs.forEach(function(dir) {

            //  Find all files in the directory, filtering out hidden files.
            list = sh.find(path.join(TDS.expandPath('~'), dir)).filter(
            function(fname) {
                var base;

                base = path.basename(fname);
                return !base.match(/^(\.|_)/) && !sh.test('-d', fname);
            });

            //  Process each file to produce a route if possible. File names and
            //  extentions drive how we process each file found.
            list.forEach(function(file) {
                var base,
                    ext,
                    route,
                    middleware,
                    parts,
                    part,
                    pub,
                    verb,
                    name;

                base = path.basename(file);
                ext = path.extname(base);

                name = base.replace(ext, '');
                parts = name.split('_');

                if (parts.length > 1) {
                    parts = parts.reverse();
                    part = parts.shift();
                    while (part) {
                        part = part.toLowerCase();
                        if (part === 'public') {
                            pub = true;
                        } else if (typeof app[part] === 'function') {
                            verb = part;
                        } else {
                            name = part;
                            if (parts.length) {
                                name += '_' + parts.join('_');
                            }
                            break;
                        }
                        part = parts.shift();
                    }
                }

                name = '/' + name;
                verb = verb || 'post';

                //  JavaScript source files should simply be loaded and run. We
                //  expect them to follow a module form that returns a function
                //  taking 'options' which allow the route to configure itself.
                if (ext === '.js') {
                    logger.debug('Loading route source for ' +
                        verb.toUpperCase() + ' ' + name);

                        route = require(file);

                    if (typeof route === 'function') {
                        middleware = route(options);
                        if (typeof middleware === 'function') {
                            if (pub) {
                                logger.debug('Registering public route for ' +
                                   verb.toUpperCase() + ' ' + name);
                                app[verb](name, parsers.json, parsers.urlencoded,
                                    middleware);
                            } else {
                                logger.debug('Registering private route for ' +
                                   verb.toUpperCase() + ' ' + name);
                                app[verb](name, parsers.json, parsers.urlencoded,
                                    options.loggedIn, middleware);
                            }
                        }
                    }
                } else {
                    //  Files that aren't source files are treated as data
                    //  files. We generate a simple route for these based on
                    //  their name. A suffix of _get, _post, etc. defines the
                    //  verb or other method called on the app object to
                    //  register the route.
                    if (pub) {
                        logger.debug('Building public route for ' +
                            verb.toUpperCase() + ' ' + name);
                        app[verb](name, parsers.json, parsers.urlencoded,
                            function(req, res, next) {
                                res.sendFile(file);
                            });
                    } else {
                        logger.debug('Building private route for ' +
                            verb.toUpperCase() + ' ' + name);
                        app[verb](name, parsers.json, parsers.urlencoded,
                            options.loggedIn, function(req, res, next) {
                                res.sendFile(file);
                            });
                    }
                }
            });
        });
    };

}(this));
