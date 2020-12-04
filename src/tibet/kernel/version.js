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
        semver: '5.1.0+g423852ba8.298.1596382200092',
        major: '5',
        minor: '1',
        patch: '0',
        suffix: '',
        increment: '0',
        time: '1596382200092',
        //  prior semver
        describe: '5.0.11-298-g423852ba8',
        ptag: '5.0.11',
        commits: '298',
        phash: '423852ba8'
    },
    'lib');

}());