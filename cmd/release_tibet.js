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
    boolean: ['check', 'full', 'major', 'minor', 'patch', 'sync', 'dry-run'],
    string: ['context', 'suffix', 'version'],
    number: ['increment'],
    default: {
        major: false,
        minor: false,
        patch: false,
        sync: false
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

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
    var version,

        meta,

        gitpath,
        tibetpath,

        execArgs,

        result;

    this.info('Options:');
    this.info(CLI.beautify(JSON.stringify(this.options)));

    if (CLI.inProject()) {
        version = CLI.getAppVersion();
    } else {
        version = CLI.getLibVersion();
    }

    meta = {
        source: null
    };

    //  Pull apart the version string so we have the component parts.
    meta.source = versioning.getVersionObject(version);

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
     * The steps to building a TIBET release are as follows
     *      tibet build --release
     *      git commit
     *      tibet version (--major|--minor|--patch) --suffix final
     *      tibet release
     *      tibet deploy npm
     *      tibet deploy dockerhub '{
     *          "projectname":"tibet",
     *          "projectversion":"latest",
     *          "nodockercache": true,
     *          "dockerfile": "Dockerfile_DEPLOY",
     *          "extra_tag_entries": [
     *              "technicalpursuit/tibet:latest technicalpursuit/tibet:" + meta.source.major,
     *              "technicalpursuit/tibet:latest technicalpursuit/tibet:" + meta.source.major + '.' + meta.source.minor,
     *              "technicalpursuit/tibet:latest technicalpursuit/tibet:" + meta.source.major + '.' + meta.source.minor + '.' + meta.source.patch,
     *          ],
     *          "extra_push_entries": [
     *              "technicalpursuit/tibet:" + meta.source.major
     *              "technicalpursuit/tibet:" + meta.source.major + '.' + meta.source.minor
     *              "technicalpursuit/tibet:" + meta.source.major + '.' + meta.source.minor + '.' + meta.source.patch
     *          ]
     *          }'
    */

    // 'docker build --no-cache -f Dockerfile_DEPLOY -t technicalpursuit/tibet:latest .',
    if (!CLI.isTrue(this.options.major) &&
        !CLI.isTrue(this.options.minor) &&
        !CLI.isTrue(this.options.patch)) {
        this.warn('Missing parameter: release level (specify using' +
                    ' --major, --minor, --patch).');
        return 1;
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
        await CLI.execAsync(this, tibetpath, execArgs);
    }


    //  ---
    //  Commit before we version stamp
    //  ---

    execArgs = [
                    'commit',
                    '--am',
                    '"Ready to version"'
                ];

    this.log('Commit changes before version stamp');

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + gitpath + ' ' + execArgs.join(' '));
    } else {
        await CLI.execAsync(this, gitpath, execArgs);
    }


    //  ---
    //  Perform version stamp
    //  ---

    execArgs = [
                    'version'
                ];

    if (CLI.isTrue(this.options.major)) {
        execArgs.push('--major');
    } else if (CLI.isTrue(this.options.minor)) {
        execArgs.push('--minor');
    } else if (CLI.isTrue(this.options.patch)) {
        execArgs.push('--patch');
    }

    execArgs.push('--suffix', 'final');

    this.log('Perform version stamp');

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + tibetpath + ' ' + execArgs.join(' '));
    } else {
        await CLI.execAsync(this, tibetpath, execArgs);
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
        await CLI.execAsync(this, tibetpath, execArgs);
    }


    //  ---
    //  Deploy to npm
    //  ---

    if (!this.options['dry-run']) {
        result = CLI.prompt.question(
            'Upload release ' + versioning.getVersionString() +
            ' to the npm repository? ' +
            '? Enter \'yes\' after inspection: ');
        if (!/^y/i.test(result)) {
            this.log('npm publish cancelled.');
            return;
        }
    }

    execArgs = [
                    'deploy',
                    'npm'
                ];

    this.log('Deploy to npm');

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + tibetpath + ' ' + execArgs.join(' '));
    } else {
        await CLI.execAsync(this, tibetpath, execArgs);
    }


    //  ---
    //  Deploy to DockerHub
    //  ---

    if (!this.options['dry-run']) {
        result = CLI.prompt.question(
            'Build Docker image release ' + versioning.getVersionString() +
            ' and upload to the DockerHub docker repository using those labels? ' +
            '? Enter \'yes\' after inspection: ');
        if (!/^y/i.test(result)) {
            this.log('Docker build and upload cancelled.');
            return;
        }
    }

    execArgs = [
                    'deploy',
                    'dockerhub'
                ];

     execArgs.push(
        '{' +
            '"projectname": "tibet", ' +
            '"projectversion": "latest", ' +
            '"nodockercache": true, ' +
            '"dockerfile": "Dockerfile_DEPLOY", ' +

            '"extra_tag_entries": [' +
                '"technicalpursuit/tibet:latest technicalpursuit/tibet:' +
                meta.source.major + '", ' +
                '"technicalpursuit/tibet:latest technicalpursuit/tibet:' +
                meta.source.major + '.' + meta.source.minor + '", ' +
                '"technicalpursuit/tibet:latest technicalpursuit/tibet:' +
                meta.source.major + '.' + meta.source.minor + '.' + meta.source.patch +
            '"], ' +

            '"extra_push_entries": [' +
                '"technicalpursuit/tibet:' + meta.source.major + '", ' +
                '"technicalpursuit/tibet:' + meta.source.major + '.' + meta.source.minor + '", ' +
                '"technicalpursuit/tibet:' + meta.source.major + '.' + meta.source.minor + '.' + meta.source.patch +
            '"]' +
            '}');

    this.log('Deploy to DockerHub');

    if (this.options['dry-run']) {
        this.log('DRY RUN: ' + tibetpath + ' ' + execArgs.join(' '));
    } else {
        await CLI.execAsync(this, tibetpath, execArgs);
    }

    return 0;
};

module.exports = Cmd;

}());
