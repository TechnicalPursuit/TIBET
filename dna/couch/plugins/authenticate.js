/**
 * @overview Passport authentication plugin for the TDS. Provides support for
 *     TIBET's various startup options including logins and two-phase booting
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var passport;

    passport = require('passport');

    module.exports = function(options) {
        var app,
            appname,
            name,
            parsers,
            strategy,
            TDS;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        parsers = options.parsers;
        TDS = app.TDS;

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

        name = TDS.cfg('tds.auth.strategy') || 'local';
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
            //  Not parallel, login page only and require validation
            //  in the '/login' route to return index.html to boot.
            res.render('login');
        });


        /*
         *
         */
        app.post('/login', parsers.json, parsers.urlencoded, function(req, res, next) {

            passport.authenticate(name, function(err, user, info) {

                if (err) {
                    return res.redirect('/login');
                }

                if (!user) {
                    return res.redirect('/login');
                }

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
        //  Middleware Helper
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

}());
