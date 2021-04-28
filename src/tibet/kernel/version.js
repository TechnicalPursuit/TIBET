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
        semver: '5.3.2+gfde6dbabdd.10.1619575997208',
        major: '5',
        minor: '3',
        patch: '2',
        suffix: '',
        increment: '0',
        time: '1619575997208',
        //  prior semver
        describe: '5.3.1-10-gfde6dbabdd',
        ptag: '5.3.1',
        commits: '10',
        phash: 'fde6dbabdd'
    },
    'lib');

}());
