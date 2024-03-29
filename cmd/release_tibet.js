//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet release_tibet' command. This command runs a series of
 *     other commands to produce a TIBET release.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    sh,
    versioning,

    Cmd,

    GIT_COMMAND;

CLI = require('../src/tibet/cli/_cli');
sh = require('shelljs');

versioning = require('../etc/helpers/version_helpers');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('../src/tibet/cli/_cmd');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'release_tibet';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
    boolean: ['check', 'full', 'major', 'minor', 'patch', 'sync', 'dry-run', 'dirty'],
    string: ['context', 'suffix', 'version'],
    number: ['increment'],
    default: {
        major: false,
        minor: false,
        patch: false,
        sync: false,
        dirty: false
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The timeout used for command invocation. Releasing TIBET can take a long time
 * so we give this a generous amount of time.
 * @type {Number}
 */
Cmd.prototype.TIMEOUT = 1000 * 60 * 60;

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet release_tibet [<args>]';

/**
 * The name of the npm executable we look for to confirm installation.
 * @type {string}
 */
GIT_COMMAND = 'git';

//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = async function() {

    var meta,

        gitpath,
        tibetpath,

        code,

        result,

        branchCmd,
        branchResult,

        srcBranch,
        srcRegex,

        source,

        targetBranch,

        execArgs,

        versionCmd,
        versionResult,
        versionObj;

    this.info('Options:');
    this.info(CLI.beautify(JSON.stringify(this.options)));

    if (CLI.inProject()) {
        this.error('Do not run this command in a project.');
        return 1;
    }

    meta = {
        source: null
    };

    //  Compute a version object so we have the component parts.
    meta.source = versioning.getVersionObject(this.options);

    this.info('checking for git support...');

    gitpath = sh.which(GIT_COMMAND);
    if (gitpath) {
        this.info('found git...');
        gitpath = gitpath.toString();
    } else {
        this.info('git not installed');
        return;
    }

    tibetpath = 'tibet';

    /*
     * The steps to building a TIBET release are as follows:
     *      tibet build --release
     *      tibet version (--major|--minor|--patch) --suffix final
     *      tibet build_docs --force
     *      git commit -am "Update the version to: <newversion>"
     *      git push
     *      tibet release --quick
     *      git checkout <targetbranch>
     *      tibet deploy npm
     *      tibet deploy dockerhub '{
     *          "account":"technicalpursuit",
     *          "projectname":"tibet",
     *          "projectversion":"latest",
     *          "nodockercache": true,
     *          "dockerfile": "Dockerfile_DEPLOY",
     *          "extra_tag_entries": [
     *              ["technicalpursuit/tibet:latest","technicalpursuit/tibet:<meta.source.major>"],
     *              ["technicalpursuit/tibet:latest","technicalpursuit/tibet:<meta.source.major>.<meta.source.minor>"],
     *              ["technicalpursuit/tibet:latest","technicalpursuit/tibet:<meta.source.major>.<meta.source.minor>.<meta.source.patch>"]
     *          ],
     *          "extra_push_entries": [
     *              "technicalpursuit/tibet:" + meta.source.major,
     *              "technicalpursuit/tibet:" + meta.source.major + '.' + meta.source.minor,
     *              "technicalpursuit/tibet:" + meta.source.major + '.' + meta.source.minor + '.' + meta.source.patch
     *          ]
     *          }'
     *      git checkout <sourcebranch>
    */

    if (!CLI.isTrue(this.options.major) &&
        !CLI.isTrue(this.options.minor) &&
        !CLI.isTrue(this.options.patch)) {
        this.warn('Missing parameter: release level (specify using' +
                    ' --major, --minor, --patch).');
        return 1;
    }

    //  ---
    //  Make sure that we prompt the user to be logged into both npm and Docker.
    //  ---

    result = CLI.prompt.question(
        'Make sure that you are logged into "git", "npm" and "Dockerhub"' +
        ' before proceeding. Proceed?' +
        ' Enter \'yes\': ');
    if (!/^y/i.test(result)) {
        this.log('TIBET release cancelled.');
        return;
    }


    //  ---
    //  Checkout the branch to deploy
    //  ---

    //  Verify the current branch is the proper source branch.

    // Get current branch name...if detached this will be a commit hash.
    branchCmd = 'git rev-parse --abbrev-ref HEAD';
    branchResult = this.shexec(branchCmd);

    srcBranch = this.getcfg('cli.release.source', 'develop');

    srcRegex = new RegExp('^\s*' + srcBranch + '\s*$');
    if (srcRegex.test(branchResult.stdout.trim()) !== true &&
        !this.options.force) {
        this.error('Not on ' + srcBranch + ' branch. Use --force to override.');
        throw new Error('BadSourceBranch');
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
    //  Build the TIBET release
    //  ---

    execArgs = [
                    'build',
                    '--release'
                ];

    this.log('Build the TIBET release');

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + tibetpath + ' ' + execArgs.join(' '));
    } else {
        code = await CLI.execAsync(this, tibetpath, execArgs);
        if (code !== 0) {
            return CLI.exitSoon(code);
        }
    }


    //  ---
    //  Perform version stamp
    //  ---

    execArgs = [
                    'version'
                ];

    /* eslint-disable no-extra-parens */
    if (CLI.isTrue(this.options.major)) {
        execArgs.push('--major');
        meta.source.major = (parseInt(meta.source.major, 10)).toString();
    } else if (CLI.isTrue(this.options.minor)) {
        execArgs.push('--minor');
        meta.source.minor = (parseInt(meta.source.minor, 10)).toString();
    } else if (CLI.isTrue(this.options.patch)) {
        execArgs.push('--patch');
        meta.source.patch = (parseInt(meta.source.patch, 10)).toString();
    }
    /* eslint-enable no-extra-parens */

    execArgs.push('--suffix', 'final');

    this.log('Perform version stamp');

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + tibetpath + ' ' + execArgs.join(' '));
    } else {
        code = await CLI.execAsync(this, tibetpath, execArgs);
        if (code !== 0) {
            return CLI.exitSoon(code);
        }
    }


    //  ---
    //  Get the updated version stamp.
    //  ---

    this.log('Retrieve the updated version stamp');

    if (this.options['dry-run']) {
        versionResult = 'tibet@' +
                        meta.source.major + '.' +
                        meta.source.minor + '.' +
                        meta.source.patch + '+gXXXXXXXXXX.XXX.XXXXXXXXXXXXX';
    } else {
        versionCmd = 'tibet version --full';
        versionResult = this.shexec(versionCmd);
        versionResult = CLI.clean(versionResult.stdout).trim();
    }

    //  Grab the version object from the versionResult string.
    versionObj = versioning.parseVersionComponents(versionResult);

    //  ---
    //  Rebuild the docs (using --force because of a bug around comparing
    //  freshness of the files with the current version stamp), now that we've
    //  updated the version stamp.
    //  ---

    execArgs = [
                    'build_docs',
                    '--force'
                ];

    this.log('Update *all* of the docs to the new version stamp');

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + tibetpath + ' ' + execArgs.join(' '));
    } else {
        code = await CLI.execAsync(this, tibetpath, execArgs);
        if (code !== 0) {
            return CLI.exitSoon(code);
        }
    }


    //  ---
    //  Make sure that we prompt the user to commit the version stamp.
    //  ---

    result = CLI.prompt.question(
        'New version stamp computed as: ' + versionResult + '.' +
        ' Commit this version stamp? ' +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('Version stamping cancelled.');
        return;
    }


    //  ---
    //  Commit the version stamp changes.
    //  ---

    execArgs = [
                    'commit',
                    '-am',
                    '"Update the version to: ' + versionResult + '"'
                ];

    this.log('Commit the version stamp changes');

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + gitpath + ' ' + execArgs.join(' '));
    } else {
        code = await CLI.execAsync(this, gitpath, execArgs);
        if (code !== 0) {
            return CLI.exitSoon(code);
        }
    }


    //  ---
    //  Push the version stamp changes.
    //  ---

    execArgs = [
                    'push'
                ];

    this.log('Push the version stamp changes');

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + gitpath + ' ' + execArgs.join(' '));
    } else {
        code = await CLI.execAsync(this, gitpath, execArgs);
        if (code !== 0) {
            return CLI.exitSoon(code);
        }
    }


    //  ---
    //  Produce the release
    //  ---

    execArgs = [
                    'release'
                ];

    this.log('Produce the release');

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + tibetpath + ' ' + execArgs.join(' '));
    } else {
        execArgs.push('--quick');
        code = await CLI.execAsync(this, tibetpath, execArgs);
        if (code !== 0) {
            return CLI.exitSoon(code);
        }
    }


    //  ---
    //  Check out the target branch (because that's where 'tibet release' put
    //  the release'd code, but it went ahead and put our branch back to where
    //  it started).
    //  ---

    targetBranch = this.getcfg('cli.release.target', 'master');

    execArgs = [
                    'checkout',
                    targetBranch
                ];

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + gitpath + ' ' + execArgs.join(' '));
    } else {
        code = await CLI.execAsync(this, gitpath, execArgs);
        if (code !== 0) {
            return CLI.exitSoon(code);
        }
    }


    //  ---
    //  Deploy to npm
    //  ---

    result = CLI.prompt.question(
        'Upload release ' + versioning.getVersionString(versionObj) +
        ' to the npm repository? ' +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('npm publish cancelled.');
        return;
    }

    execArgs = [
                    'deploy',
                    'npm'
                ];

    this.log('Deploy to npm');

    //  'tibet deploy npm' supports '--dry-run' natively, so we just push the
    //  the argument here and let it run for real. We also push '--force' here
    //  so that `tibet deploy npm` doesn't try to check branches (since, in dry
    //  run mode, we didn't actually change branches).
    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + tibetpath + ' ' + execArgs.join(' '));
        execArgs.push('--dry-run');
        execArgs.push('--force');
    }

    code = await CLI.execAsync(this, tibetpath, execArgs);
    if (code !== 0) {
        return CLI.exitSoon(code);
    }


    //  ---
    //  Deploy to DockerHub
    //  ---

    result = CLI.prompt.question(
        'Build Docker image release ' +
        versioning.getVersionString(versionObj) +
        ' and upload to the DockerHub docker repository using those labels? ' +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('Docker build and upload cancelled.');
        return;
    }

    execArgs = [
                    'deploy',
                    'dockerhub'
                ];

     execArgs.push(
        '{' +
            '"account": "technicalpursuit", ' +
            '"projectname": "tibet", ' +
            '"projectversion": "latest", ' +
            '"nodockercache": true, ' +
            '"dockerfile": "Dockerfile_DEPLOY", ' +

            //  The default command will tag 'latest' (per our project version),
            //  but we want extra images tagged off of that, so that there are
            //  images with our major, major.minor and major.minor.patch version
            //  numbers.
            '"extra_tag_entries": [' +
                '[' +
                    '"technicalpursuit/tibet:latest"' + ',' +
                    '"technicalpursuit/tibet:' + meta.source.major + '"' +
                ']' +
                ',' +
                '[' +
                    '"technicalpursuit/tibet:latest"' + ',' +
                    '"technicalpursuit/tibet:' + meta.source.major + '.' + meta.source.minor + '"' +
                ']' +
                ',' +
                '[' +
                    '"technicalpursuit/tibet:latest"' + ',' +
                    '"technicalpursuit/tibet:' + meta.source.major + '.' + meta.source.minor + '.' + meta.source.patch + '"' +
                ']' +
            '],' +

            //  The default command will push 'latest', but we want the extra
            //  tagged images to be pushed as well.
            '"extra_push_entries": [' +
                '"technicalpursuit/tibet:' + meta.source.major + '", ' +
                '"technicalpursuit/tibet:' + meta.source.major + '.' + meta.source.minor + '", ' +
                '"technicalpursuit/tibet:' + meta.source.major + '.' + meta.source.minor + '.' + meta.source.patch +
            '"]' +
            '}');

    this.log('Deploy to DockerHub');

    //  'tibet deploy dockerhub' supports '--dry-run' natively, so we just push
    //  the argument here and let it run for real. We also push '--force' here
    //  so that `tibet deploy dockerhub` doesn't try to check branches (since,
    //  in dry run mode, we didn't actually change branches).
    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + tibetpath + ' ' + execArgs.join(' '));
        execArgs.push('--dry-run');
        execArgs.push('--force');
    }

    code = await CLI.execAsync(this, tibetpath, execArgs);
    if (code !== 0) {
        return CLI.exitSoon(code);
    }


    //  ---
    //  Reset git back to source branch
    //  ---

    execArgs = [
                    'checkout',
                    srcBranch
                ];

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + gitpath + ' ' + execArgs.join(' '));
    } else {
        code = await CLI.execAsync(this, gitpath, execArgs);
        if (code !== 0) {
            return CLI.exitSoon(code);
        }
    }


    return 0;
};

module.exports = Cmd;

}());
