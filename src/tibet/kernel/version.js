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
        semver: '5.3.7+g9e44065640.63.1623617117935',
        major: '5',
        minor: '3',
        patch: '7',
        suffix: '',
        increment: '0',
        time: '1623617117935',
        //  prior semver
        describe: '5.3.6-63-g9e44065640',
        ptag: '5.3.6',
        commits: '63',
        phash: '9e44065640'
    },
    'lib');

}());
