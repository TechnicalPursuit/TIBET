//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet deploy' subcommand specific to deploying TIBET to its
 *     public dockerhub repository.
 */
//  ========================================================================

/* eslint indent:0, consistent-this: 0, no-console:0, one-var: 0 */

(function() {
'use strict';

const CLI = require('../../src/tibet/cli/_cli');
const versioning = require('../../etc/helpers/version_helpers');

const executeTIBETDocker = function() {
    var branch,
        commands,
        meta,
        result,
        version,
        cmd;

    console.log('deploying TIBET docker image...');

    cmd = this;

    //  'target' here because that's where release put the release'd code.
    branch = this.getcfg('cli.release.target');

    if (CLI.inProject()) {
        version = CLI.getAppVersion(true);
    } else {
        version = CLI.getLibVersion(true);
    }

    meta = {
        source: null
    };

    //  Pull apart the version string so we have the component parts.
    meta.source = versioning.getVersionObject(version);

    commands = [
        'git checkout ' + branch,
        'docker build --no-cache -f Dockerfile_DEPLOY -t technicalpursuit/tibet:latest .',
        'docker push technicalpursuit/tibet:latest',
        'docker tag technicalpursuit/tibet:latest technicalpursuit/tibet:' +
        meta.source.major,
        'docker push technicalpursuit/tibet:' +
        meta.source.major,
        'docker tag technicalpursuit/tibet:latest technicalpursuit/tibet:' +
        meta.source.major + '.' + meta.source.minor,
        'docker push technicalpursuit/tibet:' +
        meta.source.major + '.' + meta.source.minor,
        'docker tag technicalpursuit/tibet:latest technicalpursuit/tibet:' +
        meta.source.major + '.' + meta.source.minor + '.' + meta.source.patch,
        'docker push technicalpursuit/tibet:' +
        meta.source.major + '.' + meta.source.minor + '.' + meta.source.patch
    ];

    this.info('Preparing to: ');
    commands.forEach(function(command) {
        cmd.log(command);
    });

    result = this.prompt.question(
        'Build Docker image release ' + version.split('+')[0] + ' and upload to the' +
        ' DockerHub docker repository using those labels? ' +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('Docker build and upload cancelled.');
        return;
    }

    commands.forEach(function(command) {
        /*
        var res;

        cmd.log('executing ' + command);

        res = cmd.shexec(command);

        if (res && res.stdout.trim().slice(0, -1)) {
            cmd.info(res.stdout.trim());
        }
        */
    });
};


module.exports = function(cmdType) {

    //  NOTE: we patch the prototype since invocation is instance-level.
    cmdType.prototype.executeTibetdocker = executeTIBETDocker;
};

}(this));
