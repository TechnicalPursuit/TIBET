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
        semver: '5.5.0+gd08a06df2c.150.1634587645147',
        major: '5',
        minor: '5',
        patch: '0',
        suffix: '',
        increment: '0',
        time: '1634587645147',
        //  prior semver
        describe: '5.4.0-150-gd08a06df2c',
        ptag: '5.4.0',
        commits: '150',
        phash: 'd08a06df2c'
    },
    'lib');

}());
