/**
 * @overview Authentication plugin supporting OKTA OAuth 2.0 service. This
 *     particular version uses the 'password' grant_type which is only available
 *     to Okta applications it considers 'Native' applications.
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
     * username and password and attempt to authenticate against OKTA.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            TDS,
            logger,
            LocalStrategy,
            btoa,
            rp,
            okta,
            oktaJWTVerifier,
            strategy;

        app = options.app;
        TDS = app.TDS;
        logger = options.logger;

        btoa = require('btoa');
        rp = require('request-promise');

        LocalStrategy = require('passport-local');

        okta = require('@okta/okta-sdk-nodejs');
        oktaJWTVerifier = require('@okta/jwt-verifier');

        //  ---
        //  Middleware
        //  ---

        /*
         * A local strategy which manages session fixation by regenerating
         * any existing session and processing asynchronous user validation.
         */
        strategy = new LocalStrategy({
            passReqToCallback: true
        }, function(req, username, password, done) {
            var authType,
                issuer,
                audience,
                orgURL,
                apiToken,
                clientID,
                clientSecret,
                value,
                data;

            if (TDS.isEmpty(username) ||
                TDS.isEmpty(password)) {
                done(new Error('Missing required identity parameter(s)'));
                return;
            }

            //  The API endpoints we use will require the following parameters
            //  for proper operation.
            orgURL = TDS.cfg('tds.auth.config.okta.orgURL');
            issuer = TDS.cfg('tds.auth.config.okta.issuer');
            clientID = TDS.cfg('tds.auth.config.okta.clientID');
            value = TDS.cfg('tds.auth.config.okta.clientSecret');
            if (value) {
                clientSecret = TDS.decrypt(value);
            }

            if (TDS.isEmpty(orgURL) ||
                TDS.isEmpty(issuer) ||
                TDS.isEmpty(clientID) ||
                TDS.isEmpty(clientSecret)) {
                done(new Error('Missing required API parameter(s)'));
                return;
            }

            //  The auth type determines how we go about doing verification. For
            //  'org' we have to use the '/introspect' API endpoint. For custom
            //  auth servers (including 'default') we can use oktaJwtVerifier();
            authType = TDS.cfg('tds.auth.config.okta.authType');
            value = TDS.cfg('tds.auth.config.okta.apiToken');
            if (value) {
                apiToken = TDS.decrypt(value);
            }

            //  Store passport data before regenerate so we can reset once
            //  the regeneration is done.
            data = req.session.passport;

            req.session.regenerate(function() {
                var authToken,
                    reqOpts,
                    cleansed;

                //  Set passport data back on the session once regeneration
                //  has completed.
                req.session.passport = data;

                // logger.debug('req.session.passport: ' + JSON.stringify(data));

                authToken = btoa(clientID + ':' + clientSecret);

                reqOpts = {
                    method: 'POST',
                    uri: issuer + '/v1/token',
                    form: {
                        grant_type: 'password',
                        username: username,
                        password: password,
                        scope: 'openid'
                    },
                    headers: {
                        accept: 'application/json',
                        authorization: 'Basic ' + authToken
                    }
                };

                cleansed = JSON.stringify(reqOpts);
                cleansed = cleansed.replace(new RegExp(password, 'g'), '*****');
                logger.debug('Okta Request: ' + cleansed);

                return rp(reqOpts).then(function(tokenStr) {
                    var result,
                        token,
                        verifier;

                    logger.debug('Okta Response: ' +
                        tokenStr.replace(new RegExp(password, 'g'), '*****'));

                    try {
                        result = JSON.parse(tokenStr);
                    } catch (err) {
                        done(null, false);
                        return;
                    }

                    if (!result) {
                        done(null, false);
                        return;
                    }

                    switch (authType) {
                    case 'org':
                        //  Org level servers vend tokens that can only be
                        //  authenticated using the introspection API.
                        reqOpts = {
                            method: 'POST',
                            uri: issuer + '/v1/introspect',
                            form: {
                                token: result.access_token
                            },
                            headers: {
                                accept: 'application/json',
                                authorization: 'Basic ' + authToken
                            }
                        };

                        cleansed = JSON.stringify(reqOpts);
                        cleansed = cleansed.replace(
                            new RegExp(password, 'g'), '*****');
                        logger.debug('Okta Request: ' + cleansed);

                        return rp(reqOpts).then(function(introStr) {

                            logger.debug('Okta Response: ' +
                                introStr.replace(
                                    new RegExp(password, 'g'), '*****'));

                            try {
                                result = JSON.parse(introStr);
                            } catch (err) {
                                done(null, false);
                                return;
                            }

                            if (!result) {
                                done(null, false);
                                return;
                            }

                            if (result.active === true) {
                                return result.sub;
                            }

                            done(new Error('Invalid or expired token.'));
                            return;
                        },
                        function(err) {
                            done(err);
                        });

                    case 'custom':
                        //  fall through
                    case 'default':
                        //  custom auth servers (including "default") vend
                        //  tokens that can be verified using "remote" aka
                        //  oktaJwtVerifier utils.
                        verifier = new oktaJWTVerifier({
                            issuer: issuer,
                            clientId: clientID
                        });

                        token = result.access_token;
                        logger.debug(token);

                        audience = TDS.cfg('tds.auth.config.okta.audience');

                        return verifier.verifyAccessToken(token, audience).then(
                            function(jwt) {
                                return jwt.claims.sub;
                            });
                    default:
                        done(new Error('Invalid/unknown authType value.'));
                        return;
                    }
                }).then(function(userID) {
                    var client;

                    client = new okta.Client({
                        orgUrl: orgURL,
                        token: apiToken
                    });

                    logger.debug('Fetching Okta user record.');

                    //  Note that we map the following fields
                    //  from Okta into TIBET:
                    //  Okta            TIBET
                    //  ----            -----
                    //  email           id
                    //  groups          org (primary & additional)
                    //  userType        role
                    //  email           email
                    return client.getUser(userID).then(function(user) {
                        var org,
                            role,
                            profileData;

                        org = [];

                        logger.debug(JSON.stringify(user));

                        role = user.profile.userType;
                        if (role &&
                            role.indexOf(',') !== -1) {
                            role = role.split(/\s*,\s*/g);
                        } else {
                            role = [role];
                        }

                        profileData = {
                            id: user.profile.email,
                            org: org,
                            unit: 'staff',
                            role: role,
                            email: user.profile.email
                        };

                        user.listGroups().each(function(group) {
                            var groupName;

                            //  Filter out the
                            //  'Everyone' group
                            groupName = group.profile.name;
                            if (groupName !== 'Everyone') {
                                org.push(groupName);
                            }
                        }).then(function() {
                            //  Success. Provide profile
                            //  data to passport.
                            done(null, profileData);
                        });
                    },
                    function(err) {
                        done(err);
                    });

                }).catch(function(err) {
                    logger.error(err, err.stack);

                    //  Error. Provide that value to passport.
                    done(err);

                });

            }); //  end of regenerate callback

        }); //  end of strategy callback

        //  ---
        //  Sharing
        //  ---

        return strategy;
    };

}(this));
