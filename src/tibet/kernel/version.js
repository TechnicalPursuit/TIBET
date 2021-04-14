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
        semver: '5.2.7+g550916e7aa.13.1618415478871',
        major: '5',
        minor: '2',
        patch: '7',
        suffix: '',
        increment: '0',
        time: '1618415478871',
        //  prior semver
        describe: '5.2.6-13-g550916e7aa',
        ptag: '5.2.6',
        commits: '13',
        phash: '550916e7aa'
    },
    'lib');

}());
