//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview Utility methods used to help commands work with TIBET version
 *     strings, objects, and files. See the 'release' and 'version' commands.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    SUFFIXES,
    helpers;


//  Pull in CLI root. We use it for common utility functions.
CLI = require('../../src/tibet/cli/_cli');


/**
 *  Standard release/version suffixes. These are the default values typically
 *  used but which can be overridden via 'cli.release.suffixes' setting.
 */
SUFFIXES = ['beta', 'dev', 'final', 'hotfix', 'pre', 'rc'];


/**
 * Canonical `helper` object for internal utility functions.
 */
helpers = {};


/**
 * Returns an object whose keys are appropriate for use in templating the TIBET
 * version file content used to stamp a build with embedded version information.
 * @param {Object} options The invoking command's options object. Specific
 *     values checked include version, major, minor, patch, etc.
 * @returns {Object} A TIBET release() compatible object used as part of the
 *     templating process for updating version files.
 */
helpers.getVersionObject = function(options) {
    var source,
        match,
        version,
        major,
        minor,
        patch,
        increment;

    source = helpers.parseGitDescription();

    //  If a version string is explicitly provided we pull it apart and use it
    //  exactly as provided (with defaulting for git values etc).
    if (CLI.notEmpty(options.version)) {
        version = helpers.parseVersionComponents(options.version);

        if (CLI.isValid(options.suffix)) {
            version.suffix = options.suffix;
        }

        if (CLI.notEmpty(options.increment)) {
            version.increment = options.increment;
        }

        return CLI.blend(version, source);
    }


    //  If sync is set then our version data is being requested based on the
    //  current git values which should be used to set the new version.
    if (options.sync) {
        if (CLI.inProject()) {
            version = CLI.getAppVersion(true);
        } else {
            version = CLI.getLibVersion(true);
        }
        version = helpers.parseVersionComponents(version);

        if (CLI.isValid(options.suffix)) {
            version.suffix = options.suffix;
        }

        if (CLI.notEmpty(options.increment)) {
            version.increment = options.increment;
        }

        return CLI.blend(source, version);
    }


    // Read the current version... should be in npm.version unless provided
    // explicitly on the command line.
    version = options.version || CLI.getcfg('npm.version');
    match = version.match(/(v)*(\d+)\.(\d+)\.(\d+)(.*)/);

    if (CLI.isEmpty(match)) {
        CLI.error('Unable to parse version string: ' + version);
        throw new Error('VersionParseError');
    }

    major = match[2];
    minor = match[3];
    patch = match[4];

    // Is this a major, minor, or patch release?
    // Bump appropriately. Major also zeroes out minor/patch. Minor also zeroes
    // out patch. Patch just updates patch.
    if (options.major) {
        major = parseInt(major, 10) + 1;
        minor = 0;
        patch = 0;
    } else if (options.minor) {
        minor = parseInt(minor, 10) + 1;
        patch = 0;
    } else if (options.patch) {
        patch = parseInt(patch, 10) + 1;
    }

    // Incremental. We need to compute an increment that works if one isn't
    // provided.
    if (options.increment) {
        increment = options.increment;
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

    if (CLI.notEmpty(options.suffix)) {
        source.suffix = helpers.getVersionSuffix(options.suffix);
    }

    source.increment = increment;

    return source;
};


/**
 * Returns a semver-compliant version string from the source data provided. The
 * data provided here is the same data contained in version and version template
 * file(s) in the kernel and comparable to the version from npm info output.
 * @param {Object} data The release data as built from git describe and npm
 *     version information.
 * @returns {String} The semver-compliant version string.
 */
helpers.getVersionString = function(data) {
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
helpers.getVersionSuffix = function(suffix) {
    var data,
        re,
        match,
        suffixes;

    suffixes = CLI.getcfg('cli.release.suffixes', SUFFIXES);

    // If empty default to 'dev'.
    if (CLI.isEmpty(suffix)) {
        re = new RegExp('\-(' + suffixes.join('|') + ')\.');
        data = CLI.config.npm.version;
        match = re.exec(data);
        if (CLI.notEmpty(match)) {
            return match[1];
        }
        return 'dev';
    }

    // If found it checks out and we can use it directly.
    if (suffixes.indexOf(suffix) !== -1) {
        // When releasing final we remove any suffix/count by trimming suffix.
        if (suffix === 'final') {
            return '';
        }
        return suffix;
    }

    // All other suffixes must conform to semver rules.
    if (/^([a-zA-Z0-9])+$/.test(suffix)) {
        CLI.warn('Using non-standard TIBET suffix \'' + suffix + '\'' +
            ' vs: ' + suffixes.join(', '));
        return suffix;
    }

    CLI.error('Non-compliant semver version suffix: ' + suffix);

    throw new Error('NonSemverSuffix');
};


/**
 * Returns an object whose keys match those of a typical TIBET release()
 * parameter block based on the current 'git describe' output string.
 * @returns {Object} A release() compatible source object. Common keys include:
 *     time, describe, ptag, commits, phash, and dirty.
 */
helpers.parseGitDescription = function() {
    var cmd,
        result,
        source,
        match;

    // Describe current branch ensuring we find whether it is dirty and matching
    // the 10-digit commit typically shown in GitHub commit listings for each
    // checking.
    cmd = 'git describe --abbrev=10 --long --tags --dirty --always';
    result = CLI.sh.exec(cmd, {silent: true});

    //  gather git's view of the version commit info in object format

    source = {};
    source.time = new Date().getTime();

    source.describe = result.stdout.trim();

    //  'git describe' stdout should always be of the form:
    //      {last_tag}-{commits_since}-g{parent_commit}
    //  unless there's never been a tag...
    match = source.describe.match(/^(.*)-(\d+)-g([a-zA-Z0-9]+)(-dirty)*$/);
    if (CLI.isValid(match)) {
        source.ptag = match[1];
        source.commits = parseInt(match[2], 10);
        source.phash = match[3];
        source.dirty = match[4] === '-dirty';
    } else {
        //  when no tags exist there will only be current hash which may
        //  optionally also have a dirty suffix attached.
        match = source.describe.match(/^([a-zA-Z0-9]+)(-dirty)*$/);
        if (CLI.isValid(match)) {
            source.phash = match[1];
            source.dirty = match[2] === '-dirty';
        } else {
            CLI.error('Unable to parse description: ' + source.describe);
            throw new Error('DescribeParseError');
        }
    }

    return source;
};


/**
 * Inverts the logic of getVersionString, splitting a version string from that
 * routine (as embedded in TIBET's version.js file) back into the same object
 * format used by the release command and the getVersionString routine.
 * @param {String} string The version string to parse and decompose.
 * @returns {Object} An object suitable for the TIBET release() function:
 *     release({
 *       //  new release
 *       semver: '{{semver}}',
 *       major: '{{major}}',
 *       minor: '{{minor}}',
 *       patch: '{{patch}}',
 *       suffix: '{{suffix}}',
 *       increment: '{{increment}}',
 *       time: '{{time}}',
 *       //  prior semver
 *       describe: '{{describe}}',
 *       ptag: '{{ptag}}',
 *       commits: '{{commits}}',
 *       phash: '{{phash}}'
 *   },
 *   'app');
 */
helpers.parseVersionComponents = function(string) {
    var parts,
        name,
        version,
        gitinfo,
        major,
        minor,
        patch,
        suffix,
        increment,
        time,
        dirty,
        ptag,
        commits,
        phash,
        result;

    //  Split by name@version if included.
    if (string.indexOf('@') !== -1) {
        parts = string.split('@');
        name = parts[0];
        version = parts[1];
    } else {
        //  If no @ assume raw version string.
        name = '';
        version = string;
    }

    if (CLI.notEmpty(version)) {

        if (version.indexOf('+') !== -1) {
            //  semver-formatted version string
            //  e.g. 5.1.0-dev.14+gd4b8958759.307.1606238056337
            parts = version.split('+');
            version = parts[0];
            gitinfo = parts[1];
        } else {
            //  git describe-formatted version string
            //  e.g. 5.1.0-307-gd4b8958759-dirty
            parts = version.split('-');
            version = parts.shift();
            gitinfo = parts.join('-');
        }

        if (version.indexOf('-') !== -1) {
            //  version with a suffix.increment value
            //  e.g. 5.1.0-dev.14
            parts = version.split('-');
            version = parts[0];
            parts = parts[1].split('.');
            suffix = parts[0];
            increment = parts[1] || 0;
        }

        //  Split version by '.' to get major, minor, patch
        parts = version.split('.');
        major = parts[0];
        minor = parts[1];
        patch = parts[2];

        //  Split gitinfo by '.' to get ptag etc.
        //  e.g. gd4b8958759.307.1606238056337
        if (CLI.notEmpty(gitinfo)) {
            if (gitinfo.indexOf('.') !== -1) {
                parts = gitinfo.split('.');
                ptag = parts[0].slice(1);   //  slice to remove leading 'g'
                commits = parts[1];
                //  NOTE last segment is timestamp in our metadata
                time = parts[2];
            } else {
                //  e.g. d4b8958759-dirty
                parts = gitinfo.split('-');
                if (parts.length > 2) {
                    ptag = parts[1];
                    dirty = parts[2] === 'dirty';
                }
            }
        }
    }

    result = {
        name: name,
        semver: null,   //  LEAVE EMPTY.
        major: major,
        minor: minor,
        patch: patch,
        suffix: suffix,
        increment: increment || 0,
        time: time || new Date().getTime(),
        //  prior semver
        describe: null, //  LEAVE EMPTY
        ptag: ptag,
        commits: commits || 0,
        phash: phash,
        dirty: dirty || false
    };

    return result;
};


module.exports = helpers;

}());
