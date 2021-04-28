//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet release' command. Manages all git-related checks and
 *     commands to produce a newly tagged release-able version of a project.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0, no-debugger:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    versioning;

CLI = require('./_cli');

versioning = require('../../../etc/helpers/version_helpers');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context. The release command can be run within the
 * TIBET library or within a specific project.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'release';

/**
 * The path to the npm package.json file we should update with version data.
 * @type {String}
 */
Cmd.NPM_FILE = '~lib/package.json';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */
/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['dirty', 'dry-run', 'force', 'local'],
        'default': {
            dirty: false,
            'dry-run': false,
            force: false,
            local: false
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet release --dirty --local --force --dry-run';


//  ---
//  Instance Methods
//  ---

/**
 * Verify any command prerequisites are in place (such as necessary binaries
 * etc). If the execution should stop this method will return a non-zero result
 * code.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.prereqs = function() {
    var root;

    //  Must be in a git project
    root = CLI.getAppHead();
    if (!CLI.sh.test('-d', CLI.joinPaths(root, '.git'))) {
        this.warn('tibet release supports git-based projects.');
        this.error('.git directory not found in project root.');
        return -1;
    }

    if (!CLI.sh.which('git')) {
        this.warn('tibet release supports git-based projects.');
        this.error('git executable not found.');
        return -1;
    }

    return 0;
};


/**
 * Process a release candidate: test, commit, tag, etc. Simple ;)
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    // There are phases due to async breaks in the process. Kick off the first.
    return this.phaseOne();
};


/**
 * Performs the first phase of release generation which focuses on verifying the
 * branch is in the right state to process a release.
 */
Cmd.prototype.phaseOne = function() {
    var cmd,
        result,
        result2,
        srcBranch,
        srcRegex,
        source,
        version,
        current;

    //  ---
    //  Verify minimum required arguments etc.
    //  ---

    if (this.options['dry-run']) {
        this.warn('Running dry-run release process...');
    }

    //  ---
    //  Verify the current branch is the proper source branch.
    //  ---

    // Get current branch name...if detached this will be a commit hash.
    cmd = 'git rev-parse --abbrev-ref HEAD';
    result = this.shexec(cmd);

    srcBranch = this.getcfg('cli.release.source', 'develop');

    srcRegex = new RegExp('^\s*' + srcBranch + '\s*$');
    if (srcRegex.test(result.stdout.trim()) !== true && !this.options.force) {
        this.error('Not on ' + srcBranch + ' branch. Use --force to override.');
        throw new Error('BadSourceBranch');
    }

    //  ---
    //  Verify the branch is up to date with origin.
    //  ---

    cmd = 'git fetch';
    this.shexec(cmd);
    cmd = 'git rev-parse HEAD';
    result = this.shexec(cmd);
    cmd = 'git rev-parse @{u}';
    try {
        result2 = this.shexec(cmd);
        if (result.stdout.trim() !== result2.stdout.trim() &&
                !this.options.local &&
                !this.options.dirty) {
            throw new Error('BranchNotCurrent');
        }
    } catch (e) {
        //  Unreleased branches / upstream issues when forcing can trigger
        //  errors. In that case just check whether we're being forced.
        if (!this.options.local || !this.options.force) {
            this.error(
                'Out-of-date branch. Override with --local --dirty flags.');
            throw e;
        }
    }

    //  ---
    //  Verify the branch isn't "dirty".
    //  ---

    //  gather git's view of the current branch commit info
    source = versioning.parseGitDescription();

    //  If the branch is dirty we can force continuing with the --dirty flag.
    if (source.dirty && !this.options.dirty) {
        this.error(
            'Cannot release dirty branch. Stash, commit, or use --dirty.');
        throw new Error('DirtyBranch');
    }

    //  ---
    //  Check version is up-to-date
    //  ---

    //  get stamped (version.js) version so we can check its git info

    if (CLI.inProject()) {
        version = CLI.getAppVersion(true);
    } else if (CLI.inLibrary()) {
        version = CLI.getLibVersion(true);
    }

    if (CLI.isEmpty(version)) {
        this.error('Unable to determine current assigned version.');
        throw new Error('UnknownVersion');
    }

    current = versioning.getVersionObject(version);

    /*
    console.log('source:  ', source);
    console.log('current: ', current);
    */

    //  The currently stamped git info should match or the release won't be
    //  properly correlated to the actual source code version.
    if (CLI.notEmpty(source.ptag)) {

        if (source.ptag !== current.ptag) {
            this.warn('Version ptag not current. Use tibet version to set it.');
            this.log('Release cancelled.');
            return 1;
        }

        //  If there's at least one tag there'll be a count since that tag.
        if (CLI.isValid(source.commits)) {
            //  TODO commits should perhaps be "off by one" with versioning.
            if (source.commits !== current.commits) {
                this.warn(
                    'Version commit count off. Use tibet version to set it.');
                this.log('Release cancelled.');
                return 1;
            }
        }

        //  TODO:   not sure about this since tibet version alters file.
        if (source.phash !== current.phash) {
            this.warn('Version phash not current. Use tibet version to set it.');
            this.log('Release cancelled.');
            return 1;
        }
    }

    //  ---
    //  Make sure we should continue. From here on out it's "real work".
    //  ---

    result = this.prompt.question('Ready to check ' + version + '?' +
        ' Enter \'yes\' to continue: ');

    if (!/^y/i.test(result)) {
        this.log('Release cancelled.');
        return 0;
    }

    return this.phaseTwo(source);
};


/**
 * Performs the second phase of release processing. This phase involves an
 * optional 'tibet test' run to lint and test the content before any commit.
 * If the asynchronous test process passes phaseThree is invoked.
 */
Cmd.prototype.phaseTwo = function(source) {
    var cmd,
        release,
        content;

    //  ---
    //  Run 'tibet lint' to verify clean code.
    //  ---

    if (!this.options['dry-run']) {

        //  NOTE we pass --clean here to ensure we lint everything.
        cmd = 'tibet lint --clean';

        release = this;

        CLI.sh.exec(cmd, function(code, stdout) {
            var answer;

            if (code !== 0) {
                answer = release.prompt.question(
                    'tibet lint detected errors. Continue anyway?' +
                    ' Enter \'yes\' after inspection: ');
                if (!/^y/i.test(answer)) {
                    release.log(
                        'Release cancelled. Revert any uncommitted' +
                        ' changes.');
                    return code;
                }
            }

            //  ---
            //  Run 'tibet test' to test the resulting package.
            //  ---

            if (release.options.test && !release.options.quick) {
                cmd = 'tibet test';
                CLI.sh.exec(cmd, function(code2, stdout2) {
                    var answer2;

                    if (code2 !== 0) {
                        release.error(stdout2.trim());
                        answer2 = release.prompt.question(
                            'tibet test detected errors. Continue anyway?' +
                            ' Enter \'yes\' after inspection: ');
                        if (!/^y/i.test(answer2)) {
                            release.log(
                                'Release cancelled. Revert any uncommitted' +
                                ' changes.');
                            return 0;
                        }
                    }

                    return release.phaseThree(
                                    {content: content, source: source});
                });
            } else {
                return release.phaseThree({content: content, source: source});
            }
        });

    } else {

        if (this.options['dry-run']) {
            this.warn('dry-run. bypassing \'tibet lint --clean\'');
            this.warn('dry-run. bypassing \'tibet test\'');
        }

        return this.phaseThree({content: content, source: source});
    }
};


/**
 * Finalizes the release process by committing any build assets produced. Once
 * changes are committed to the source release branch those changes are merged
 * into the release target branch, committed, tagged, and pushed. The final step
 * outputs instructions on how to deploy the release.
 * @param {Object} meta Data including 'source.semver' string value.
 */
Cmd.prototype.phaseThree = function(meta) {
    var release,
        result,
        srcBranch,
        targetBranch,
        remoteName,
        srcTag,
        targetTag,
        commands;

    srcBranch = this.getcfg('cli.release.source');
    targetBranch = this.getcfg('cli.release.target', 'master');
    remoteName = this.getcfg('cli.release.remote', 'origin');

    // Build the proposed release tag so we can verify with user...
    if (meta && meta.source && meta.source.semver) {
        targetTag = meta.source.semver.split('+')[0];
    } else {
        if (CLI.inProject()) {
            targetTag = CLI.getAppVersion(true).split('+')[0];
        } else {
            targetTag = CLI.getLibVersion(true).split('+')[0];
        }
    }
    srcTag = targetTag + '-' + srcBranch;

    release = this;

    // ---
    // Source branch updates...
    // ---

    commands = [
        'git fetch --tags',
        // Commit outstanding changes produced by the release build/update.
        'git commit -am \'release ' + srcTag + '\'',
        // Tag the resulting commit, adding '-'{srcBranch} to the master tag.
        'git tag -a \'' + srcTag + '\' -m ' + '\'release ' + srcTag + '\'',
        // Push the changes to source branch on the remote along with tag.
        'git push ' + remoteName + ' ' + srcBranch + ' --tags'
    ];

    this.info('Preparing to: ');
    commands.forEach(function(cmd) {
        release.log(cmd);
    });

    result = this.prompt.question(
        'Process changes to ' + srcBranch + ' as ' + srcTag +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('Release cancelled. Revert uncommitted branch changes.');
        return 0;
    }

    commands.forEach(function(cmd) {
        var res;

        if (release.options['dry-run']) {
            release.warn('dry-run. bypassing ' + cmd);
        } else {
            release.log('executing ' + cmd);
            debugger;
            try {
                res = release.shexec(cmd);
            } catch (e) {
                //  one case is "failure" but actually success... when there's
                //  nothing to commit.
                if (/nothing added to commit/i.test(e.message)) {
                    release.info(e.message.trim());
                } else {
                    throw e;
                }
            }
        }

        if (res && res.stdout.trim().slice(0, -1)) {
            release.info(res.stdout.trim());
        }
    });


    // ---
    // Target branch updates...
    // ---

    commands = [
        'git fetch --tags',
        'git checkout ' + targetBranch,
        'git pull --ff',
        'git merge ' + srcBranch,
        'git tag -a \'' + targetTag + '\' -m ' + '\'Release ' + targetTag + '\'',
        'git push ' + remoteName + ' ' + targetBranch + ' --tags',
        'git checkout ' + srcBranch
    ];

    this.info('Preparing to: ');
    commands.forEach(function(cmd) {
        release.log(cmd);
    });

    result = this.prompt.question(
        'Process changes to ' + targetBranch + ' as ' + targetTag +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('Release cancelled. Revert any uncommitted changes.');
        return 0;
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


    //  At this point the source branch is updated, tagged, and pushed and the
    //  changes there have been merged into target, tagged, and pushed.
    this.info('Release complete.');
    return 0;
};


module.exports = Cmd;

}());
