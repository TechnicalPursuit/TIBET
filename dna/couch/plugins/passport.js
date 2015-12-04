/**
 * @overview
 */

(function() {

    var passport,
        LocalStrategy,
        path,
        pass,
        Promise;

    path = require('path');
    passport = require('passport');
    LocalStrategy = require('passport-local');
    Promise = require('bluebird').Promise;

    pass = {
        configure: function(app) {
            var authenticate,
                strategy,
                TDS;

console.log('configuring the darn thing');

            TDS = app.TDS;

            authenticate = function(req, username, password) {
                var promise;

                promise = new Promise(function(resolve, reject) {

console.log('session: ' + JSON.stringify(req.session));

                    //  TODO:   verify username and password against some
                    //  repository for such information. Preferably you
                    //  hash the password to check against previously stored
                    //  hashed password from registration operation.
                    resolve({id: username});
                });

                return promise;
            };

            /*
             * A local strategy which manages session fixation by regenerating
             * any existing session and processing asynchronous user validation.
             */
            strategy = new LocalStrategy({
                passReqToCallback: true
            }, function(req, username, password, done) {
                var data;

console.log('local strategy callback');

                //  Store passport data before regenerate so we can reset once
                //  the regeneration is done.
                data = req.session.passport;

                req.session.regenerate(function() {

                    //  Set passport data back on the session once regeneration
                    //  has completed.
                    req.session.passport = data;

                    //  Invoke the authentication logic. Once it's complete call
                    //  the done() routine passport requires to resolve.
                    authenticate(req, username, password).then(
                        function(user) {
console.log('auth callback user: ' + user);
                            if (user) {
                                //  Passport considers authentication successful
                                //  if we pass non-error, non-false value here.
console.log('auth callback done with user');
                                done(null, user);
                            } else {
console.log('auth callback done with false');
                                done(null, false);
                            }
                        },
                        function(err) {
console.log('auth callback done with err: ' + err);
                            done(err);
                        }
                    );
                });
            });


            //  ---
            //
            //  ---

            app.use(passport.initialize());
            app.use(passport.session());
            passport.use('local', strategy);

            /*
             *
             */
            passport.serializeUser(function(user, cb) {
console.log('serializing: ' + JSON.stringify(user));
                cb(null, user);
            });


            /*
             *
             */
            passport.deserializeUser(function(obj, cb) {
console.log('deserializing: ' + JSON.stringify(obj));
                cb(null, obj);
            });


            //  ---
            //
            //  ---

            /*
             *
             */
            app.get('/', function(req, res, next) {

console.log('get /');
console.log('req: ' + Object.keys(req));

                if (TDS.cfg('boot.use_login')) {

                    if (req.isAuthenticated()) {
console.log('authenticated, even if reloading');

                        if (req.session.render === 'phasetwo') {
                            //  Clear this once we render or bad news...we'll
                            //  keep sending the wrong page :(
                            req.session.render = null;
                            res.render('phasetwo', {
                                layout: false,
                                parallel: false
                            });
                        } else {
                            res.render('index', {
                                layout: false,
                                parallel: false
                            });
                        }

                        return;
                    }

                    //  Using logins but not-yet-authenticated. Need to show
                    //  either a standalone login page or the parallel boot
                    //  version of the index page with a login page as the
                    //  current "splash page" (aka UIBOOT) iframe content.
console.log('un-authenticated');

                    if (TDS.cfg('boot.parallel')) {

                        //  Parallel booting means send index page and let it
                        //  boot phase one. When '/login' is invoked we'll
                        //  validate and return a login success page with the
                        //  proper phase two boot go-ahead values.
                        //  NOTE: this renders into the current route (/).
console.log('rendering use_login+parallel: index.html');
                        res.render('index', {
                            layout: false,
                            parallel: true
                        });
                        return;

                    } else {
                        //  Not parallel, login page only and require validation
                        //  in the '/login' route to return index.html to boot.
console.log('rendering use_login+notparallel: login');
                        //  NOTE: this renders into the login route (/login).
                        res.redirect('login');
                        return;
                    }

                } else {
                    //  Not using logins, just load the top-level index file.
                    //  When the client receives this file, with use_login off,
                    //  it will simply boot.
console.log('rendering notuse_login: index.html');
                    //  NOTE: this renders into the current route (/).
                    res.render('index', {layout: false, parallel: false});
                }
            });


            /*
             *
             */
            app.get('/login', function(req, res, next) {

console.log('get /login');
                //  Not parallel, login page only and require validation
                //  in the '/login' route to return index.html to boot.
                res.render('login');
            });


            /*
             *
             */
            app.post('/login', function(req, res, next) {

console.log('post /login');
console.log("body parsing", req.body);

                passport.authenticate('local', function(err, user, info) {

console.log('passport.authenticate callback');

                    if (err) {
console.log('passport.authenticate err');
                        return res.redirect('/login');
                    }

                    if (!user) {
console.log('passport.authenticate !user');
                        return res.redirect('/login');
                    }

                    //  Passport requires that if we're using a custom
                    //  callback function we need to invoke req.login ourselves.
                    req.login(user, function(err2) {

                        if (err2) {
console.log('req.login err');
                            return next(err2);
                        }

console.log('req.login success');

                        //  User authenticated but we need to decide which
                        //  result page to send.

                        if (TDS.cfg('boot.parallel')) {

                            //  If booting in parallel we presume that phase one
                            //  is already underway or complete and need to
                            //  return a proceed-with-phase-two page.
console.log('post /login auth success parallel: ' + user);

                            //  NOTE: we set session state to communicate with
                            //  the other route handler that we're just getting
                            //  started and need to render the phasetwo page.
                            req.session.render = 'phasetwo';
                            res.redirect('/');

                        } else {
console.log('post /login auth success notparallel: index.html w: ' + user);
                            //  Not parallel, meaning we've never sent anything with
                            //  boot logic to the client. Do that now that we've
                            //  authenticated the user. NOTE that we need to include
                            //  information the client can use to see that even though
                            //  config says use_login we have already done that.
                            //  TODO:   user cookie? extra header? something?

                            //  NOTE: we set session state to communicate with
                            //  the other route handler that we're just getting
                            //  started and need to render the phasetwo page.
                            req.session.render = 'phaseone';
                            res.redirect('/');
                        }

                    });
                })(req, res, next);
            });

            /**
             *
             */
            app.get('/logout', function(req, res) {
                //  Un-authenticate the user and reset to home route.
                req.logout();
                res.redirect('/');
            });

            /**
             *
             */
            app.post('/logout', function(req, res) {
                //  Un-authenticate the user and send ack status.
                req.logout();
                res.sendStatus('200');
            });
        }
    };

    module.exports = pass;

}(this));
