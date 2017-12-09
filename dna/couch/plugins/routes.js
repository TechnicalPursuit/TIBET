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

    var VERBS;

    VERBS = ['get', 'put', 'post', 'patch', 'delete', 'trace', 'options',
        'head', 'connect'];

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
            style,
            parsers,
            path,
            sh,
            list;

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
        //  CORS options support
        //  ---

        //  Before loading any routes enable options for preflight checks.
        app.options('*', TDS.cors());

        //  ---
        //  Routes/Mocks
        //  ---

        dirs.forEach(function(dir) {

            style = dir === 'mocks' ? 'mock' : 'route';

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
                    meta,
                    middleware,
                    parts,
                    part,
                    pub,
                    verb,
                    name,
                    i,
                    len;

                base = path.basename(file);
                ext = path.extname(base);

                name = base.replace(ext, '');
                parts = name.split('_');

                if (parts.length > 1) {

                    //  Router files should follow pattern of:
                    //  {name}_router[_stuff][_public].js where
                    //  stuff is purely for author clarity.
                    if (parts[1] === 'router') {
                        name = parts[0];
                        len = parts.length;
                        for (i = 2; i < len; i++) {
                            if (parts[i] === 'public') {
                                pub = true;
                                break;
                            }
                        }
                    } else {
                        //  Order matters. Expectation is that 'public' is
                        //  always last if present. Next is the verb. Anything
                        //  in front of that is considered to be the route name
                        //  which is joined back together.
                        parts = parts.reverse();
                        part = parts.shift();
                        while (part) {
                            part = part.toLowerCase();
                            if (part === 'public') {
                                pub = true;
                            } else if (part === 'router') {
                                //  Ignore _router suffixes directly.
                                logger.warn(
                                    'Route file has misplaced `router` in name: ' +
                                    file);
                                void 0;
                            } else if (VERBS.indexOf(part) !== -1) {
                                verb = part;
                            } else {
                                name = part;
                                if (parts.length) {
                                    //  NOTE that when we rebuild we replace any
                                    //  underscores with / to create deep paths.
                                    name = parts.reverse().join('/') + '/' +
                                        part;
                                }
                                break;
                            }
                            part = parts.shift();
                        }
                    }
                }

                meta = {
                    type: style,
                    name: name
                };

                name = '/' + name;
                verb = verb || 'get';   //  Default to an idempotent verb.

                //  JavaScript source files should simply be loaded and run. We
                //  expect them to follow a module form that returns a function
                //  taking 'options' which allow the route to configure itself.
                if (ext === '.js') {

                    try {
                        route = require(file);
                    } catch (e) {
                        logger.error('Error loading ' + style + ': ' + name,
                            meta);
                        logger.error(e.message, meta);
                        TDS.ifDebug() ? logger.debug(e.stack, meta) : 0;
                        return;
                    }

                    if (typeof route === 'function') {

                        //  TODO:   configure an options.logger object that can
                        //  process logging requests with route-specific meta.
                        options.logger = logger.getContextualLogger(meta);

                        try {
                            middleware = route(options);
                        } catch (e) {
                            logger.error(e.message, meta);
                            TDS.ifDebug() ? logger.debug(e.stack, meta) : 0;
                            logger.warn('Disabling invalid route handler in: ' +
                                base, meta);
                        }

                        //  A bit of a hack..but router 'instances' aren't
                        //  really instances of something we can test well.
                        if (middleware &&
                                typeof middleware.propfind === 'function') {
                            //  Routers use this approach to registration where
                            //  no verb is provided since that's done route by
                            //  route.
                            if (pub) {
                                app.use(name, parsers.json, parsers.urlencoded,
                                    middleware);
                            } else {
                                app.use(name, parsers.json, parsers.urlencoded,
                                    options.loggedInOrLocalDev, middleware);
                            }
                        } else if (typeof middleware === 'function') {
                            //  Normal (non-router) routes need a verb.
                            if (pub) {
                                app[verb](name, parsers.json, parsers.urlencoded,
                                    middleware);
                            } else {
                                app[verb](name, parsers.json, parsers.urlencoded,
                                    options.loggedInOrLocalDev, middleware);
                            }
                        }
                    } else {
                        //  Not a function. Incorrect route construction.
                        logger.error('Route ' + name +
                            ' should export a function instance.', meta);
                    }
                } else {
                    //  Files that aren't source files are treated as data
                    //  files. We generate a simple route for these based on
                    //  their name. A suffix of _get, _post, etc. defines the
                    //  verb or other method called on the app object to
                    //  register the route.

                    //  JS files do their own logging re: route vs. mock but we
                    //  need to do it for them when we're loading data files.
                    if (pub) {
                        logger.system(
                            TDS.colorize('building public ' + meta.type, 'dim') + ' ' +
                            TDS.colorize(verb.toUpperCase() + ' ' +
                                name, style), meta);
                        app[verb](name, parsers.json, parsers.urlencoded,
                            function(req, res, next) {
                                res.sendFile(file);
                            });
                    } else {
                        logger.system(
                            TDS.colorize('building secure ' + meta.type, 'dim') + ' ' +
                            TDS.colorize(verb.toUpperCase() + ' ' +
                                name, style), meta);
                        app[verb](name, parsers.json, parsers.urlencoded,
                            options.loggedInOrLocalDev, function(req, res, next) {
                                res.sendFile(file);
                            });
                    }
                }
            });
        });
    };

}(this));
