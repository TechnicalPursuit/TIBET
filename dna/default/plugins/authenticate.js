/**
 * @overview Passport authentication plugin for the TDS. Provides support for
 *     TIBET's various startup options including logins and two-phase booting
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Defines top-level Passport authentication logic. The options provided
     * are expected to provide both a json and urlencoded parser in the
     * 'parsers' key, which is typically configured by the body-parser plugin.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            appname,
            Cookies,
            Keygrip,
            logger,
            name,
            parsers,
            passport,
            strategy,
            TDS;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;
        parsers = options.parsers;
        TDS = app.TDS;

        logger.debug('Integrating TDS authentication.');

        //  ---
        //  Requires
        //  ---

        Cookies = require('cookies');
        Keygrip = require('keygrip');
        passport = require('passport');

        //  ---
        //  Initialization
        //  ---

        app.use(passport.initialize());
        app.use(passport.session());

        //  Map passport into the option list to allow included modules access
        //  to the passport object as needed.
        options.passport = passport;


        //  ---
        //  Serialization
        //  ---

        /*
         *
         */
        passport.serializeUser(function(user, cb) {
            cb(null, user);
        });


        /*
         *
         */
        passport.deserializeUser(function(obj, cb) {
            cb(null, obj);
        });


        //  ---
        //  Strategy
        //  ---

        appname = TDS.cfg('project.name') || TDS.cfg('npm.name');

        name = TDS.cfg('tds.auth.strategy') || 'tds';
        strategy = require('./auth-' + name)(options);

        passport.use(strategy.name, strategy);


        //  ---
        //  Routes
        //  ---

        /*
         *
         */
        app.get('/', parsers.urlencoded, function(req, res, next) {

            if (TDS.cfg('boot.use_login')) {

                if (req.isAuthenticated()) {

                    if (req.session.render === 'phasetwo') {
                        //  Clear this once we render or bad news...we'll
                        //  keep sending the wrong page :(
                        req.session.render = null;
                        res.render('phasetwo', {
                            layout: false,
                            parallel: false,
                            appname: appname
                        });
                    } else {
                        res.render('index', {
                            layout: false,
                            parallel: false,
                            appname: appname
                        });
                    }

                    return;
                }

                //  Using logins but not-yet-authenticated. Need to show
                //  either a standalone login page or the parallel boot
                //  version of the index page with a login page as the
                //  current "splash page" (aka UIBOOT) iframe content.

                if (TDS.cfg('boot.parallel')) {

                    //  Parallel booting means send index page and let it
                    //  boot phase one. When '/login' is invoked we'll
                    //  validate and return a login success page with the
                    //  proper phase two boot go-ahead values.
                    //  NOTE: this renders into the current route (/).
                    res.render('index', {
                        layout: false,
                        parallel: true,
                        appname: appname
                    });
                    return;

                } else {
                    //  Not parallel, login page only and require validation
                    //  in the '/login' route to return index.html to boot.
                    //  NOTE: this renders into the login route (/login).
                    res.redirect('login');
                    return;
                }

            } else {
                //  Not using logins, just load the top-level index file.
                //  When the client receives this file, with use_login off,
                //  it will simply boot.
                //  NOTE: this renders into the current route (/).
                res.render('index', {
                    layout: false,
                    parallel: false,
                    appname: appname
                });
            }
        });


        /*
         *
         */
        app.get('/login', parsers.urlencoded, function(req, res, next) {
            var user,
                cookies,
                keys;

            //  Read any username cookie from the client and use it to
            //  pre-populate the login field. Keys must match those used
            //  during the post /login process to read correctly.
            keys = new Keygrip([
                TDS.cfg('tds.cookie.key2'), TDS.cfg('tds.cookie.key1')
            ]);
            cookies = new Cookies(req, res, keys);
            user = cookies.get(TDS.cfg('user.cookie'), {
                signed: true
            }) || '';

            //  Not parallel, login page only and require validation
            //  in the '/login' route to return index.html to boot.
            res.render('login', {
                title: appname,
                username: user
            });
        });


        /*
         *
         */
        app.post('/login', parsers.json, parsers.urlencoded, function(req, res, next) {

            passport.authenticate(name, function(err, user, info) {
                var keys,
                    cookies;

                if (err) {
                    return res.redirect('/login');
                }

                if (!user) {
                    return res.redirect('/login');
                }

                //  TIBET leverages the current username as a way to determine
                //  which vCard information (and hence which roles, orgs, units)
                //  should be applied in the client. Set a cookie here the
                //  client can access when login is successful.
                keys = new Keygrip([
                    TDS.cfg('tds.cookie.key2'), TDS.cfg('tds.cookie.key1')
                ]);
                cookies = new Cookies(req, res, keys);
                cookies.set(TDS.cfg('user.cookie'), user.id, {
                    maxAge: 600000,
                    signed: true,
                    secure: TDS.cfg('tds.https'),
                    httpOnly: false     //  NOTE we explicitly read from JS.
                });

                //  Passport requires that if we're using a custom
                //  callback function we need to invoke req.login ourselves.
                req.login(user, function(err2) {

                    if (err2) {
                        return next(err2);
                    }

                    //  User authenticated but we need to decide which
                    //  result page to send.

                    if (TDS.cfg('boot.parallel')) {
                        //  If booting in parallel we presume that phase one
                        //  is already underway or complete and need to
                        //  return a proceed-with-phase-two page.

                        //  NOTE: we set session state to communicate with
                        //  the other route handler that we're done with
                        //  phase one and need to render the phasetwo page.
                        req.session.render = 'phasetwo';
                        res.redirect('/');

                    } else {
                        //  NOTE: we set session state to communicate with
                        //  the other route handler that we're just getting
                        //  started and need to render the phase one page.
                        req.session.render = 'phaseone';
                        res.redirect('/');
                    }
                });
            })(req, res, next);
        });

        /**
         *
         */
        app.get('/logout', parsers.urlencoded, function(req, res) {
            //  Un-authenticate the user and reset to home route.
            req.logout();
            res.redirect('/');
        });

        /**
         *
         */
        app.post('/logout', parsers.json, parsers.urlencoded, function(req, res) {
            //  Un-authenticate the user and send ack status.
            req.logout();
            res.sendStatus('200');
        });


        //  ---
        //  Sharing
        //  ---

        /**
         *
         */
        options.loggedIn = function(req, res, next) {
            if (req.isAuthenticated() ||
                TDS.cfg('boot.use_login') === false) {
                return next();
            }

            res.redirect('/');
        };
    };

}(this));
