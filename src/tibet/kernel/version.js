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
        semver: '5.3.6+gc1d4633d09.30.1621302640011',
        major: '5',
        minor: '3',
        patch: '6',
        suffix: '',
        increment: '0',
        time: '1621302640011',
        //  prior semver
        describe: '5.3.5-30-gc1d4633d09',
        ptag: '5.3.5',
        commits: '30',
        phash: 'c1d4633d09'
    },
    'lib');

}());
