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
            crypto,
            LocalStrategy,
            logger,
            Promise,
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
        TDS = app.TDS;

        logger.debug('Integrating TDS auth-tds strategy.');

        //  ---
        //  Requires
        //  ---

        crypto = require('crypto');
        LocalStrategy = require('passport-local');
        Promise = require('bluebird').Promise;

        //  ---
        //  Middleware
        //  ---

        /**
         *
         */
        authenticate = function(req, username, password) {
            var promise;

            promise = new Promise(function(resolve, reject) {
                var pass,
                    hex;

                //  Simple authentication is a hash check against TDS data.
                pass = TDS.cfg('tds.users.' + username);
                if (pass) {

                    //  Compute a simple hash to compare against the stored
                    //  user configuration value (which is similarly hashed).
                    hex = crypto.createHash('md5').update(
                        password).digest('hex');

                    if (hex === pass) {
                        //  Match? Resolve the promise and provide a "user"
                        //  object of some form.
                        return resolve({id: username});
                    }

                    return reject('Password mismatch.');
                }

                return reject('Unknown username.');
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
