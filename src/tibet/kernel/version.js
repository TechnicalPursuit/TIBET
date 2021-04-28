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
        semver: '5.3.3+ga7f324821d.12.1619578243849',
        major: '5',
        minor: '3',
        patch: '3',
        suffix: '',
        increment: '0',
        time: '1619578243849',
        //  prior semver
        describe: '5.3.1-12-ga7f324821d',
        ptag: '5.3.1',
        commits: '12',
        phash: 'a7f324821d'
    },
    'lib');

}());
