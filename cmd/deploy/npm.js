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

/* eslint indent:0, consistent-this: 0, no-console:0, one-var: 0 */

(function() {

'use strict';

const CLI = require('../../src/tibet/cli/_cli');

const executeNpm = function() {
    var branch,
        commands,
        result,
        cmd,
        version;

    console.log('deploying to npm...');

    cmd = this;

    //  'target' here because that's where release put the release'd code.
    branch = this.getcfg('cli.release.target');

    if (CLI.inProject()) {
        version = CLI.getAppVersion();
    } else {
        version = CLI.getLibVersion();
    }

    commands = [
        'git checkout ' + branch,
        'npm publish ./'
    ];

    this.info('Preparing to: ');
    commands.forEach(function(command) {
        cmd.log(command);
    });

    result = this.prompt.question(
        'Upload release ' + version + ' to the npm repository? ' +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('npm publish cancelled.');
        return;
    }

    commands.forEach(function(command) {
        var res;

        cmd.log('executing ' + command);
        return;
        res = cmd.shexec(command);

        if (res && res.stdout.trim().slice(0, -1)) {
            cmd.info(res.stdout.trim());
        }
    });
};


module.exports = function(cmdType) {
    //  NOTE: we patch the prototype since invocation is instance-level.
    cmdType.prototype.executeNpm = executeNpm;
};

}(this));
