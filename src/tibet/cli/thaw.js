//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet thaw' command reverses the effect of 'tibet freeze',
 *     resetting TIBET-INF/tibet to a link and resetting the lib_root value
 *     in tibet.json to ~/node_modules/tibet. After a thaw the project will
 *     be in the same state it is in after tibet init is first run.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    helpers,
    Cmd;


CLI = require('./_cli');
helpers = require('../../../etc/helpers/make_helpers');

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
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.PROJECT;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'thaw';

//  ---
//  Instance Attributes
//  ---

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
    boolean: ['force'],
    default: {
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet thaw [--force]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var sh,
        path,

        cmd,
        err,
        app_inf,
        app_npm,
        infroot,

        lnflags,
        linksrcdir,
        linkdestdir,
        srcdir,
        lnerr,

        file,
        json,

        str,

        profile,
        bundle,

        source,
        target;

    sh = require('shelljs');
    path = require('path');

    cmd = this;

    app_inf = CLI.expandPath('~app_inf');

    app_npm = CLI.expandPath('~app_npm');

    // Verify our intended target directory exists. The TIBET-INF directory
    // should be there or we have nothing to thaw.
    if (!sh.test('-e', app_inf)) {
        this.error('Unable to thaw. Cannot find app_inf directory: ' + app_inf);
        return -1;
    }

    //  Verify target subdir/link exists.
    infroot = CLI.joinPaths(app_inf, 'tibet');
    if (!sh.test('-e', infroot)) {
        this.warn('Application not frozen.');
        return 0;
    }

    //  If it's a link we're in a thawed state already.
    if (sh.test('-L', infroot)) {
        this.info('Project library resources already thawed.');
        return 0;
    }

    //  Exists and not a link...need force to remove it...
    if (!this.options.force) {
        this.warn('Use --force to confirm destruction of ~app_inf/tibet.');
        return 1;
    }

    err = sh.rm('-rf', infroot);
    if (sh.error()) {
        this.error('Error removing ~app_inf/tibet directory: ' + err.stderr);
        return 1;
    }

    //  Replace link to library resources common to all projects.
    lnflags = '-s';
    if (this.options.force) {
        lnflags += 'f';
    }

    this.log('relinking development library resources...');

    linksrcdir = CLI.joinPaths(app_npm, 'tibet');
    linkdestdir = infroot;
    srcdir = path.relative(path.dirname(linkdestdir), linksrcdir);

    lnerr = sh.ln(lnflags, srcdir, linkdestdir);
    if (sh.error()) {
        this.error('Error relinking library resources: ' + lnerr.stderr);
    }

    //  ---
    //  update lib_root
    //  ---

    this.log('updating project lib_root setting...');

    file = CLI.expandPath('~tibet_file');
    json = require(file);
    if (!json) {
        this.error('Unable to load and update lib_root in: ' + file);
        return 1;
    }

    //  Make sure json.path is clear, back to initial default state.
    if (json.path) {
        delete json.path.lib_root;
    }

    //  SAVE the file (note the 'to()' call here...
    str = CLI.beautify(JSON.stringify(json));
    new sh.ShellString(str).to(file);

    //  ---
    //  Set new lib_root in runtime and flush all paths to force recomputation
    //  ---

    CLI.getPackage().lib_root = json.path.lib_root;
    CLI.getPackage().paths = {};

    //  ---
    //  Relink project build
    //  ---

    //  Compute the bundle based on what the 'tibet build' command would've
    //  put into our config as the project packaging profile (if 'tibet
    //  build was executed').
    profile = CLI.getcfg('project.packaging.profile');
    if (profile) {
        bundle = profile.slice(profile.lastIndexOf('@') + 1);
    }

    if (CLI.isEmpty(bundle)) {
        bundle = 'base';
    }

    target = CLI.expandPath('~app_build');
    if (!sh.test('-d', target)) {
        this.warn('Couldn\'t find built project files but `tibet build` will' +
                    ' now use dynamically linked library.');
        return 1;
    }

    source = CLI.expandPath('~lib_build');
    if (!sh.test('-d', source)) {
        this.error('~lib_build not found.');
        return 1;
    }

    helpers.link_apps_and_tibet(cmd, source, target, {config: bundle});

    this.info('Application thawed. TIBET now boots from ./node_modules/tibet.');

    return 0;
};

module.exports = Cmd;

}());
