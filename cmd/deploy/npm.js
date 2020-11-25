//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet deploy' subcommand specific to deploying a project to
 *     an npm repository.
 */
//  ========================================================================

/* eslint indent:0, consistent-this: 0, no-console:0 */

(function() {

'use strict';

const executeNpm = function() {
    var commands,
        result,
        release,
        mastertag;

    console.log('deploying to npm...');

    commands = [
        'npm publish ./'
    ];

    this.info('Preparing to: ');
    commands.forEach(function(cmd) {
        release.log(cmd);
    });

    result = this.prompt.question(
        'Upload release ' + mastertag + ' to the npm repository? ' +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('npm publish cancelled.');
        return;
    }

    commands.forEach(function(cmd) {
        var res;

        if (release.options['dry-run']) {
            release.warn('dry-run. bypassing ' + cmd);
        } else {
            release.log('executing ' + cmd);
            res = release.shexec(cmd);
        }

        if (res && res.stdout.trim().slice(0, -1)) {
            release.info(res.stdout.trim());
        }
    });
};


module.exports = function(cmdType) {
    //  NOTE: we patch the prototype since invocation is instance-level.
    cmdType.prototype.executeNpm = executeNpm;
};

}(this));
