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
            var issuer,
                audience,
                orgURL,
                apiToken,
                clientID,
                clientSecret,
                data;

            //  NOTE that the special keys (token and secret) are encrypted so
            //  logging them here isn't a huge security issue...but still.
            /*
            logger.debug('tds.cfg: ' +
                JSON.stringify(TDS.cfg('tds.auth.config.okta')));
            */

            issuer = TDS.cfg('tds.auth.config.okta.issuer');
            audience = TDS.cfg('tds.auth.config.okta.audience');

            orgURL = TDS.cfg('tds.auth.config.okta.orgURL');
            apiToken = TDS.decrypt(TDS.cfg('tds.auth.config.okta.apiToken'));

            clientID = TDS.cfg('tds.auth.config.okta.clientID');
            clientSecret =
                TDS.decrypt(TDS.cfg('tds.auth.config.okta.clientSecret'));

            //  Store passport data before regenerate so we can reset once
            //  the regeneration is done.
            data = req.session.passport;

            req.session.regenerate(function() {
                var authToken,
                    reqOpts;

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

                logger.debug('Okta Request: ' + JSON.stringify(reqOpts));

                return rp(reqOpts).then(function(dataStr) {
                    var result,
                        token,
                        verifier;

                    logger.debug('Okta Response: ' + dataStr);

                    try {
                        result = JSON.parse(dataStr);
                    } catch (err) {
                        done(null, false);
                        return;
                    }

                    if (!result) {
                        done(null, false);
                        return;
                    }

                    verifier = new oktaJWTVerifier({
                        issuer: issuer,
                        clientId: clientID
                    });

                    token = result.access_token;
                    logger.debug(token);

                    return verifier.verifyAccessToken(token, audience).then(
                            function(jwt) {
                        var client;

                        client = new okta.Client({
                            orgUrl: orgURL,
                            token: apiToken
                        });

                        //  Note that we map the following fields
                        //  from Okta into TIBET:
                        //  Okta            TIBET
                        //  ----            -----
                        //  email           id
                        //  groups          org (primary & additional)
                        //  userType        role
                        //  email           email
                        return client.getUser(jwt.claims.sub).then(
                                function(user) {
                            var org,
                                role,
                                profileData;

                            org = [];

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
                        });
                    });
                },
                function(err) {
                    logger.error(err, err.stack);

                    //  Error. Provide that value to passport.
                    done(err);

                }); //  end of rp promise

            }); //  end of regenerate callback

        }); //  end of strategy callback

        //  ---
        //  Sharing
        //  ---

        return strategy;
    };

}(this));
