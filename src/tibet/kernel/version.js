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
        semver: '5.2.0+g8b296c1b03.424.1607458274329',
        major: '5',
        minor: '2',
        patch: '0',
        suffix: '',
        increment: '0',
        time: '1607458274329',
        //  prior semver
        describe: '5.1.0-424-g8b296c1b03-dirty',
        ptag: '5.1.0',
        commits: '424',
        phash: '8b296c1b03'
    },
    'lib');

}());
