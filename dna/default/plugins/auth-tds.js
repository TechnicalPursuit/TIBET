/**
 * @overview Simple strategy for Passport authentication that relies on tds.json
 *     for storage of hashed passwords. This is the default authentication
 *     module since it doesn't require installation of other components but it's
 *     clearly not something you should rely on for anything beyond development.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Defines a simple Passport strategy and helper function which take a
     * username and password and attempt to authenticate against current tds
     * configuration data. Not recommended for production obviously.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            authenticate,
            logger,
            LocalStrategy,
            strategy,
            TDS;

        app = options.app;
        TDS = app.TDS;
        logger = options.logger;

        LocalStrategy = require('passport-local');

        //  ---
        //  Middleware
        //  ---

        /**
         *
         */
        authenticate = function(req, username, password) {
            var promise;

            promise = new TDS.Promise(function(resolve, reject) {
                var user,
                    pass,
                    org,
                    unit,
                    role,
                    salt,
                    parts,
                    test;

                //  Simple authentication is a check against TDS user data.
                //  We don't currently encrypt usernames in that data since it
                //  would then require us to essentially scan and decode each
                //  one since all our salt values are random one-time strings.
                user = TDS.cfg('users.' + username);
                if (user) {

                    pass = TDS.cfg('users.' + username + '.pass');
                    org = TDS.cfg('users.' + username + '.org');
                    unit = TDS.cfg('users.' + username + '.unit');
                    role = TDS.cfg('users.' + username + '.role');

                    //  During development simple password bypass for
                    //  guest/demo accounts can be set manually via '*'.
                    if (TDS.getEnv() === 'development' && pass === '*') {
                        return resolve({
                            id: username,
                            org: org,
                            unit: unit,
                            role: role,
                            email: username
                        });
                    }

                    //  Two ways to go here...decrypt the value or split off the
                    //  salt and encrypt the incoming value looking for a match.
                    //  The latter is more secure and essentially required if
                    //  using an asymmetrical encryption approach.
                    try {
                        parts = pass.split(':');
                        salt = new Buffer(parts.shift(), 'hex');

                        test = TDS.encrypt(password, salt);
                        if (test === pass) {
                            //  Match? Resolve the promise and provide a "user"
                            //  object of some form.
                            return resolve({
                                id: username,
                                org: org,
                                unit: unit,
                                role: role,
                                email: username
                            });
                        }
                    } catch (e) {
                        logger.error(e.message);
                        //  Password mismatch...but don't say so.
                        return reject('Authentication failed.');
                    }

                    //  Password mismatch...but don't say so.
                    return reject('Authentication failed.');
                }

                //  Unknown username...but don't say so.
                return reject('Authentication failed.');
            });

            promise.catch(function(err) {
                logger.error(err);
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
                        if (user) {
                            //  Success. Provide user object to passport.
                            done(null, user);
                        } else {
                            //  Failure. Provide a false value to passport.
                            done(null, false);
                        }
                    },
                    function(err) {
                        //  Error. Provide that value to passport.
                        done(err);
                    }
                );
            });
        });

        //  ---
        //  Sharing
        //  ---

        return strategy;
    };

}(this));
