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
        semver: '5.4.0+gca7ddff277.337.1630370362838',
        major: '5',
        minor: '4',
        patch: '0',
        suffix: '',
        increment: '0',
        time: '1630370362838',
        //  prior semver
        describe: '5.3.7-337-gca7ddff277',
        ptag: '5.3.7',
        commits: '337',
        phash: 'ca7ddff277'
    },
    'lib');

}());
