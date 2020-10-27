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
        semver: '{{semver}}',
        major: '{{major}}',
        minor: '{{minor}}',
        patch: '{{patch}}',
        suffix: '{{suffix}}',
        increment: '{{increment}}',
        time: '{{time}}',
        //  prior semver
        describe: '{{describe}}',
        ptag: '{{ptag}}',
        commits: '{{commits}}',
        phash: '{{phash}}'
    },
    'lib');

}());
