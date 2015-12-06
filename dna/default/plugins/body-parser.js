/**
 * @overview Configure the various body parser components the application will
 *     have access to. NOTE that we don't apply them here, we simply create them
 *     and return them for use on a route-by-route basis as needed.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var bodyParser,
        TDS;

    bodyParser = require('body-parser');
    TDS = require('tibet/etc/tds/tds-base');

    module.exports = function(options) {
        var bodyLimit,
            jsonParser,
            urlEncoded;

        bodyLimit = TDS.cfg('tds.max_bodysize') || '5mb';

        jsonParser = bodyParser.json({limit: bodyLimit});

        urlEncoded = bodyParser.urlencoded({
            extended: false,
            limit: bodyLimit
        });

        options.parsers = {
            json: jsonParser,
            urlencoded: urlEncoded
        }
    };

}());
