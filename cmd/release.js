/**
 * @overview The 'tibet release' command. Does a number of steps with the goal
 *     of producing a newly tagged release-able version of TIBET.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd;

CLI = require('../src/tibet/cli/_cli');

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
 * The command execution context. This release command is very specific to the
 * library and can only run there.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.LIBRARY;

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

/**
 * The name of the target file to be updated with the templated output.
 * @type {String}
 */
Cmd.TARGET_FILE = '~lib/src/tibet/kernel/TIBETVersion.js';

/**
 * The name of the template file to use for injecting values. This file is
 * expected to have handlebars template slots for the data needed for a tag.
 * @type {String}
 */
Cmd.TEMPLATE_FILE = '~lib/src/tibet/kernel/TIBETVersionTemplate.js';

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
        'boolean': ['major', 'minor', 'patch', 'build', 'test',
            'local', 'dry-run', 'quick'],
        'string': ['suffix', 'version'],
        'number': ['increment'],
        'default': {
            major: false,
            minor: false,
            patch: false,
            incremental: true,
            local: false,
            quick: false,
            dirty: false,
            build: true,
            test: true,
            'dry-run': false
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * A list of suffixes we'll allow for release identification. The default is
 * 'dev'. Note that if you specify 'final' it is _not_ added to the string,
 * instead it signifies only the major.minor.patch output should be output.
 * @type {Array}
 */
Cmd.prototype.SUFFIXES = ['beta', 'dev', 'final', 'hotfix', 'pre', 'rc'];


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet release [--major|--minor|--patch]' +
    ' --local --build --test --dry-run' +
    ' [--version <version>] [--suffix <suffix>]';


//  ---
//  Instance Methods
//  ---

/**
 * Build a release candidate build, commit it, tag it, push it, etc. Simple.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    // There are three phases due to two async breaks in the process. Kick off
    // the first one.
    this.phaseOne();

    //  Not the final status, but 0 keeps the process running.
    return 0;
};


/**
 * Returns a semver-compliant version string from the source data provided. The
 * data provided here is the same data contained in TIBETVersion[Template].js
 * file(s) in the kernel and comparable to the version from npm info output.
 * @param {Object} data The release data as built from git describe and npm
 *     version information.
 * @returns {String} The semver-compliant version string.
 */
Cmd.prototype.getLibVersion = function(data) {

    var str;

    if (CLI.notEmpty(data.semver)) {
        return data.semver;
    }

    // Build a semver-compliant string optionally including pre-release and meta
    // information when that data is available. Not all releases have it.
    str = '';
    str += data.major;
    str += '.';
    str += data.minor;
    str += '.';
    str += data.patch;

    if (CLI.notEmpty(data.suffix)) {
        str += '-';
        str += data.suffix;

        // Incremental builds will always update the increment for any suffix so
        // we get something increasing without being a major.minor.patch value.
        str += '.';
        str += data.increment;
    }

    if (CLI.notEmpty(data.phash)) {
        str += '+g';
        str += data.phash;
    }

    if (CLI.notEmpty(data.commits)) {
        if (CLI.notEmpty(data.phash)) {
            str += '.';
        } else {
            str += '+';
        }
        str += data.commits;
    }

    if (CLI.notEmpty(data.time)) {
        if (CLI.notEmpty(data.phash) || CLI.notEmpty(data.commits)) {
            str += '.';
        } else {
            str += '+';
        }
        str += data.time;
    }

    // Cache the computed string in the data.
    data.semver = str;

    return str;
};


/**
 * Returns the suffix string to use based on the input suffix. Certain
 * transforms are done here, in particular if the suffix is 'final' it's
 * actually trimmed out so the eventual version string won't have a
 * "pre-release" portion.
 * @param {String} suffix The suffix to check and process.
 * @returns {String} The processed suffix value.
 */
Cmd.prototype.getSuffix = function(suffix) {
    var data,
        re,
        match;

    // If empty default to 'dev'.
    if (CLI.isEmpty(suffix)) {
        re = new RegExp('\-(' + this.SUFFIXES.join('|') + ')\.');
        data = CLI.config.npm.version;
        match = re.exec(data);
        if (CLI.notEmpty(match)) {
            return match[1];
        }
        return 'dev';
    }

    // If found it checks out and we can use it directly.
    if (this.SUFFIXES.indexOf(suffix) !== -1) {
        // When releasing final we remove any suffix/count by trimming suffix.
        if (suffix === 'final') {
            return '';
        }
        return suffix;
    }

    // All other suffixes must conform to semver rules.
    if (/^([a-zA-Z0-9])+$/.test(suffix)) {
        this.warn('Using non-standard TIBET suffix \'' + suffix + '\'...');
        this.warn('Perhaps one of these? ' + this.SUFFIXES.join(', '));
        return suffix;
    }

    throw new Error('Non-compliant semver release suffix: ' + suffix);
};


/**
 * Performs the first phase of release generation which focuses on verifying the
 * branch is in the right state to build a release from. This phase also does a
 * confirmation prompt after building the version string to ensure the right
 * build version will be produced. If the build is confirmed the last step of
 * this method is to kick off the asynchronous 'tibet build' command and
 * wait. If the build succeeds phaseTwo is invoked.
 */
Cmd.prototype.phaseOne = function() {
    var cmd,
        result,
        result2,
        source,
        version,
        match,
        major,
        minor,
        patch,
        increment,
        suffix,
        sh,
        release;

    //  ---
    //  Verify minimum required arguments etc.
    //  ---

    if (this.options['dry-run']) {
        this.warn('Running dry-run release process...');
    }

    // If no specific semver update is specified this is a 'dev build' request.
    if (!this.options.major && !this.options.minor && !this.options.patch) {
        this.options.develop = true;
    }

    // Process any input suffix to get one we should use for this release.
    suffix = this.getSuffix(this.options.suffix);

    //  ---
    //  Verify the current branch is develop.
    //  ---

    // Get current branch name...if detached this will be a commit hash.
    cmd = 'git rev-parse --abbrev-ref HEAD';
    result = this.shexec(cmd);

    if (/^\s*develop\s*$/.test(result.output) !== true) {
        throw new Error('Releases must be done from develop branch.');
    }

    //  ---
    //  Verify the branch is up to date with origin.
    //  ---

    cmd = 'git fetch';
    this.shexec(cmd);
    cmd = 'git rev-parse HEAD';
    result = this.shexec(cmd);
    cmd = 'git rev-parse @{u}';
    result2 = this.shexec(cmd);
    if (result.output !== result2.output &&
        !this.options.local &&
        !this.options.dirty) {
        throw new Error('Cannot release from out-of-date local branch.');
    }

    //  ---
    //  Verify the branch isn't "dirty".
    //  ---

    // Describe current branch ensuring we find whether it is dirty and matching
    // the 10-digit commit typically shown in GitHub commit listings for each
    // checking.
    cmd = 'git describe --abbrev=10 --long --tags --dirty --always';
    result = this.shexec(cmd);

    // Undocumented flag here...unless you count this comment :) Here only for
    // development of the initial release command. TODO: delete this flag.
    if (/dirty/.test(result.output) && !this.options.dirty) {
        throw new Error('Cannot release a dirty branch. Stash or commit.');
    }

    source = {};
    source.time = new Date().getTime();

    source.describe = result.output.slice(0, -1);
    // Describe output should always be of the form:
    //      {last_tag}-{commits_since}-g{parent_commit}
    match = source.describe.match(/^(.*)-(\d+)-g([a-zA-Z0-9]+)(-dirty)*$/);
    if (CLI.isValid(match)) {
        source.ptag = match[1];
        source.commits = parseInt(match[2], 10);
        source.phash = match[3];
    } else {
        throw new Error('Unable to parse branch description: ' +
            source.describe);
    }

    source.suffix = suffix;

    //  ---
    //  Prep the version update data so we can ask the user to confirm...
    //  ---

    // Read the current version... should be in npm.version unless provided
    // explicitly on the command line.
    version = this.options.version || this.getcfg('npm.version');
    match = version.match(/(v)*(\d+)\.(\d+)\.(\d+)(.*)/);

    if (CLI.isEmpty(match)) {
        throw new Error('Unable to parse version string: ' + version);
    }

    major = match[2];
    minor = match[3];
    patch = match[4];

    // Is this a major, minor, or patch release?
    // Bump appropriately. Major also zeroes out minor/patch. Minor also zeroes
    // out patch. Patch just updates patch.
    if (this.options.major) {
        major = parseInt(major, 10) + 1;
        minor = 0;
        patch = 0;
    } else if (this.options.minor) {
        minor = parseInt(minor, 10) + 1;
        patch = 0;
    } else if (this.options.patch) {
        patch = parseInt(patch, 10) + 1;
    }

    // Incremental. We need to compute an increment that works if one isn't
    // provided.
    if (this.options.increment) {
        increment = this.options.increment;
    } else {
        match = version.match(/(v)*(\d+)\.(\d+)\.(\d+)\-([a-z]*)\.(\d+)(.*)/);
        if (CLI.notEmpty(match)) {
            increment = match[6];
            increment = parseInt(increment, 10) + 1;
        } else {
            increment = 0;
        }
    }

    source.major = major;
    source.minor = minor;
    source.patch = patch;

    source.increment = increment;

    //  ---
    //  Make sure we should continue. From here on out it's "real work".
    //  ---

    result = this.prompt.question(
        'Ready to build ' + this.getLibVersion(source) +
        '? Enter \'yes\' to continue: ');
    if (!/^y/i.test(result)) {
        this.log('Release cancelled.');
        return;
    }

    //  ---
    //  Run 'tibet build' to create content for ~lib_src
    //  ---

    if (this.options.build && !this.options['dry-run'] && !this.options.quick) {
        sh = require('shelljs');

        cmd = 'tibet build --release';
        release = this;

        sh.exec(cmd, function(code, output) {
            if (code !== 0) {
                // release.error(output);
                return;
            }

            release.phaseTwo(source);
        });
    } else {
        if (this.options['dry-run']) {
            this.warn('dry-run. bypassing \'tibet build --release\'');
        }
        this.phaseTwo(source);
    }
};


/**
 * Performs the second phase of release processing. This phase involves editing
 * the kernel's version file and the npm package.json file to update them with
 * the proposed build identification data. Once all edits are complete a full
 * 'tibet test' is run to lint and test the content before any commit.
 * If the asynchronous test process passes phaseThree is invoked.
 */
Cmd.prototype.phaseTwo = function(source) {

    var hb,
        fs,
        file,
        data,
        content,
        template,
        sh,
        cmd,
        release,
        result;

    hb = require('handlebars');
    fs = require('fs');

    //  ---
    //  Make sure we should continue. From here on out we're editing code.
    //  ---

    result = this.prompt.question(
        'Update version to ' + this.getLibVersion(source) +
        '? Enter \'yes\' to continue: ');
    if (!/^y/i.test(result)) {
        this.log('Release cancelled. Revert uncommitted branch changes.');
        return;
    }

    //  ---
    //  Run the version update process to update the kernel version.
    //  ---

    file = CLI.expandPath(
            CLI.getcfg('path.release_version_template') || Cmd.TEMPLATE_FILE);
    try {
        data = fs.readFileSync(file, {encoding: 'utf8'});
        if (!data) {
            throw new Error('NoData');
        }
    } catch (e) {
        this.error('Error reading file data: ' + e.message);
        return;
    }

    try {
        template = hb.compile(data);
        if (!template) {
            throw new Error('InvalidTemplate');
        }
    } catch (e) {
        this.error('Error compiling template ' + file + ': ' +
            e.message);
        return;
    }

    try {
        content = template(source);
        if (!content) {
            throw new Error('InvalidContent');
        }
    } catch (e) {
        this.error('Error injecting template data in ' + file +
            ': ' + e.message);
        return;
    }

    file = CLI.expandPath(
            CLI.getcfg('path.release_version_target') || Cmd.TARGET_FILE);
    if (this.options['dry-run']) {
        this.warn('dry-run. bypassing writing: ' + file);
    } else {
        this.info('Updating target version file: ' + file);
        try {
            content = CLI.normalizeLineEndings(content);
            fs.writeFileSync(file, content);
        } catch (e) {
            this.error('Error writing file ' + file + ': ' + e.message);
            return;
        }
    }

    //  ---
    //  Update the package.json file version number.
    //  ---

    // Don't include metadata in the npm version string.
    CLI.config.npm.version = this.getLibVersion(source).split('+')[0];
    CLI.config.tibet.version = CLI.config.npm.version;

    file = CLI.expandPath(Cmd.NPM_FILE);
    if (this.options['dry-run']) {
        this.warn('dry-run. bypassing writing: ' + file);
    } else {
        this.info('Updating npm version in: ' + file);
        try {
            content = CLI.beautify(JSON.stringify(CLI.config.npm));
            content = CLI.normalizeLineEndings(content);
            fs.writeFileSync(file, content);
        } catch (e) {
            this.error('Error writing file ' + file + ': ' + e.message);
            return;
        }
    }

    //  ---
    //  Run 'tibet build_docs' to update doc verions.
    //  ---

    if (!this.options['dry-run']) {
        sh = require('shelljs');

        //  NOTE we pass --clean here to ensure all docs regen with version.
        cmd = 'tibet build_docs --clean';

        release = this;

        sh.exec(cmd, function(code, output) {
            if (code !== 0) {
                // release.error(output);
                return;
            }

            //  ---
            //  Run 'tibet test' to test the resulting package.
            //  ---

            cmd = 'tibet test';

            if (release.options.test && !release.options.quick) {
                sh.exec(cmd, function(code2, output2) {
                    if (code2 !== 0) {
                        release.error(output2);
                        result = release.prompt.question(
                            'tibet test detected errors. Continue anyway?' +
                            ' Enter \'yes\' after inspection: ');
                        if (!/^y/i.test(result)) {
                            release.log(
                                'Release cancelled. Revert uncommitted branch' +
                                ' changes.');
                            return;
                        }
                    }

                    release.phaseThree({content: content, source: source});
                });
            } else {
                release.phaseThree({content: content, source: source});
            }
        });

    } else {
        if (this.options['dry-run']) {
            this.warn('dry-run. bypassing \'tibet build_docs\'');
            this.warn('dry-run. bypassing \'tibet test\'');
        }
        this.phaseThree({content: content, source: source});
    }
};


/**
 * Finalizes the release process by committing all the build assets produced and
 * version files edited. Once changes are committed to the develop branch those
 * changes are merged into master, committed, tagged, and pushed. The final step
 * outputs instructions on how to publish master to npm.
 * @param {Object} meta Data including 'source.semver' string value.
 */
Cmd.prototype.phaseThree = function(meta) {

    var release,
        result,
        devtag,
        mastertag,
        commands;

    // Build the proposed release tag so we can verify with user...
    mastertag = meta.source.semver.split('+')[0];
    devtag = mastertag + '-develop';

    release = this;

    // ---
    // Develop branch updates...
    // ---

    commands = [
        'git fetch --tags',
        // Commit outstanding changes produced by the release build/update.
        'git commit -am \'Release-ready build ' + devtag + '\'',
        // Tag the resulting commit, adding '-develop' to the master tag.
        'git tag -a \'' + devtag + '\' -m ' + '\'Release ' + devtag + '\'',
        // Push the changes to develop branch on origin along with tag.
        'git push origin develop --tags'
    ];

    this.info('Preparing to: ');
    commands.forEach(function(cmd) {
        release.log(cmd);
    });

    result = this.prompt.question(
        'Process changes to develop as ' + devtag +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('Release cancelled. Revert uncommitted branch changes.');
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

        if (res && res.output.slice(0, -1)) {
            release.info(res.output);
        }
    });


    // ---
    // Master branch updates...
    // ---

    commands = [
        'git fetch --tags',
        'git checkout master',
        'git pull --ff',
        'git merge develop',
        'git tag -a \'' + mastertag + '\' -m ' + '\'Release ' + mastertag + '\'',
        'git push origin master --tags'
    ];

    this.info('Preparing to: ');
    commands.forEach(function(cmd) {
        release.log(cmd);
    });

    result = this.prompt.question(
        'Process changes to master as ' + mastertag +
        '? Enter \'yes\' after inspection: ');
    if (!/^y/i.test(result)) {
        this.log('Release cancelled. Revert uncommitted branch changes.');
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

        if (res && res.output.slice(0, -1)) {
            release.info(res.output);
        }
    });


    // ---
    // npm repository updates... this is optional
    // ---

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

        if (res && res.output.slice(0, -1)) {
            release.info(res.output);
        }
    });


    // ---
    // dockerhub updates... this is optional
    // ---

    commands = [
        'docker build --no-cache -t technicalpursuit/tibet:latest .',
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

        if (res && res.output.slice(0, -1)) {
            release.info(res.output);
        }
    });

   /*
    * At this point the develop branch is updated, tagged, and pushed and the
    * changes there have been merged into master, tagged, and pushed. So for the
    * most part you could say the release is built.
    *
    * Last step left: pack/publish to npm.
    */

    this.info('Read https://gist.github.com/coolaj86/1318304 and npm publish.');
    this.info('\n\n');

    this.info('Release is done.');
    this.info('\n\n');

    this.info('FINAL NOTE: YOU ARE CHECKED OUT ON THE \'MASTER\' BRANCH -' +
                ' Reset accordingly');
};


module.exports = Cmd;

}());
