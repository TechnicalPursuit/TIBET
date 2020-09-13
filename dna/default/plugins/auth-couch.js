/**
 * @overview A strategy for Passport authentication that relies on a CouchDB
 *     database for storage of hashed passwords.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Defines a Passport strategy and helper function which take a username and
     * password and attempt to authenticate against a CouchDB database that will
     * be found in the 'auth.db_name' tds cfg data.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            authenticate,
            logger,
            queries,

            LocalStrategy,

            cloneUserData,

            strategy,
            TDS;

        app = options.app;
        TDS = app.TDS;
        logger = options.logger;

        queries = require('../src/queries.js')(options);

        LocalStrategy = require('passport-local');

        /**
         * Clones the user data retrieved from the database, leaving out the
         * '_id' and '_rev' keys.
         */
        cloneUserData = function(srcObj) {

            var newObj,
                key;

            newObj = {};

            for (key in srcObj) {
                if (!srcObj.hasOwnProperty(key) ||
                    key === '_id' ||
                    key === '_rev') {
                    continue;
                }

                newObj[key] = srcObj[key];
            }

            //  Alias the 'id' of the returned user data to the 'username'.
            newObj.id = srcObj.username;

            return newObj;
        };

        //  ---
        //  Middleware
        //  ---

        /**
         *
         */
        authenticate = function(req, username, password) {
            var promise;

            promise = queries.queryForUserDoc(username);

            promise = promise.then(
                function(result) {

                var user,
                    pass,

                    salt,
                    parts,
                    test;

                user = result;

                if (user) {

                    pass = user.pass;

                    //  During development simple password bypass for
                    //  guest/demo accounts can be set manually via '*'.
                    if (TDS.getEnv() === 'development' && pass === '*') {

                        //  If we're dealing with a superuser here, just fetch
                        //  all of the orgs and populate the user's info with
                        //  them.
                        if (user.superuser === true) {
                            user.role = ['superuser'];
                            return queries.queryForAllOrgNames().then(
                                function(orgNames) {
                                    user.org = orgNames;
                                    return cloneUserData(user);
                                });
                        } else {
                            user.org = [];
                            user.role = [];

                            return queries.queryForAssignmentsForUser(
                                                        user.username).then(
                                function(results) {
                                    if (results) {
                                        results.forEach(
                                            function(assignment) {
                                                user.org.push(assignment.org);
                                                user.role.push(assignment.role);
                                            });

                                        return cloneUserData(user);
                                    }
                                });
                        }
                    }

                    //  Two ways to go here...decrypt the value or split off the
                    //  salt and encrypt the incoming value looking for a match.
                    //  The latter is more secure and essentially required if
                    //  using an asymmetrical encryption approach.
                    try {
                        parts = pass.split(':');
                        salt = Buffer.from(parts.shift(), 'hex');

                        test = TDS.encrypt(password, salt);
                        if (test === pass) {
                            //  Match? Resolve the promise and provide a "user"
                            //  object of some form.

                            //  If we're dealing with a superuser here, just
                            //  fetch all of the orgs and populate the user's
                            //  info with them.
                            if (user.superuser === true) {
                                user.role = ['superuser'];
                                return queries.queryForAllOrgNames().then(
                                    function(orgNames) {
                                        user.org = orgNames;
                                        return cloneUserData(user);
                                    });
                            } else {
                                user.org = [];
                                user.role = [];
                                return queries.queryForAssignmentsForUser(
                                                            user.username).then(
                                    function(results) {
                                        if (results) {
                                            results.forEach(
                                                function(assignment) {
                                                    user.org.push(
                                                        assignment.org);
                                                    user.role.push(
                                                        assignment.role);
                                                });

                                            return cloneUserData(user);
                                        }
                                    });
                            }
                        }
                    } catch (e) {
                        logger.error(e.message);
                        //  Password mismatch...but don't say so.
                        return TDS.Promise.reject('Authentication failed.');
                    }

                    //  Password mismatch...but don't say so.
                    return TDS.Promise.reject('Authentication failed.');
                }

                //  Unknown username...but don't say so.
                return TDS.Promise.reject('Authentication failed.');
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
