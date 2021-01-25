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
        semver: '5.2.5+gec63b1e0fe.11.1611616804416',
        major: '5',
        minor: '2',
        patch: '5',
        suffix: '',
        increment: '0',
        time: '1611616804416',
        //  prior semver
        describe: '5.2.4-develop-11-gec63b1e0fe',
        ptag: '5.2.4-develop',
        commits: '11',
        phash: 'ec63b1e0fe'
    },
    'lib');

}());
