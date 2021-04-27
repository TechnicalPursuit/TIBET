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
        semver: '5.3.1+gacbe6ca99f.12.1619546478225',
        major: '5',
        minor: '3',
        patch: '1',
        suffix: '',
        increment: '0',
        time: '1619546478225',
        //  prior semver
        describe: '5.3.0-12-gacbe6ca99f',
        ptag: '5.3.0',
        commits: '12',
        phash: 'acbe6ca99f'
    },
    'lib');

}());
