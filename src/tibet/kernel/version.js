//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */

(function() {
    'use strict';

    var release;

    release = TP && TP.sys && TP.sys.release ? TP.sys.release :
        (data) => {
            module.exports = data;
        };

    release({
        //  new release
        semver: '5.2.3+g536294056d.30.1609191594752',
        major: '5',
        minor: '2',
        patch: '3',
        suffix: '',
        increment: '0',
        time: '1609191594752',
        //  prior semver
        describe: '5.2.2-develop-30-g536294056d-dirty',
        ptag: '5.2.2-develop',
        commits: '30',
        phash: '536294056d'
    },
    'lib');

}());
