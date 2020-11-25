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

/* eslint indent:0, consistent-this: 0, no-console:0 */

/* eslint-disable no-console */

(function() {
'use strict';

const executeTIBETDocker = function() {
    var commands,
        meta,
        release,
        result,
        mastertag;

    console.log('deploying TIBET docker image...');

    commands = [
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
    commands.forEach(function(cmd) {
        release.log(cmd);
    });

    result = this.prompt.question(
        'Build Docker image release ' + mastertag + ' and upload to the' +
        ' DockerHub docker repository using those labels? ' +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('Docker build and upload cancelled.');
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
    cmdType.prototype.executeTibetdocker = executeTIBETDocker;
};

}(this));
