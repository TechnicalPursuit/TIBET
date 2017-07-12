/**
 * @overview Simple stub to support require('tibet') as a way of accessing a
 *     utility module for TIBET. Focused primarily on providing access to things
 *     like TIBET package data for tools like Grunt and Gulp.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    var tibet,
        couch,
        make,
        Color,
        Config,
        Logger,
        Package,
        TDS;

    couch = require('../etc/helpers/couch_helpers');
    make = require('../etc/helpers/make_helpers');
    Color = require('../etc/common/tibet_color');
    Config = require('../etc/common/tibet_config');
    Logger = require('../etc/common/tibet_logger');
    Package = require('../etc/common/tibet_package');
    TDS = require('../tds/tds_base');

    tibet = {
        couch: couch,
        make: make,
        Color: Color,
        Config: Config,
        Logger: Logger,
        Package: Package,
        TDS: TDS
    };

    module.exports = tibet;
}());
